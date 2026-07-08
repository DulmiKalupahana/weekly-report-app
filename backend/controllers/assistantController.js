const { GoogleGenAI } = require('@google/genai');
const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');

//  Gemini client
let geminiClient = null;
const getClient = () => {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('GEMINI_API_KEY configured:', Boolean(apiKey));
        geminiClient = new GoogleGenAI({ apiKey });
    }
    return geminiClient;
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_REPORT_WEEKS = 8; // limit how many weeks of history we send

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const isQuotaError = (err) => {
    const message = err?.message || '';
    const status = err?.status || err?.response?.status;
    return status === 429 || status === 'RESOURCE_EXHAUSTED' || message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED');
};

const generateWithRetry = async (payload) => {
    const client = getClient();
    let lastError;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            return await client.models.generateContent(payload);
        } catch (err) {
            lastError = err;
            if (isQuotaError(err) && attempt === 0) {
                console.warn('Gemini quota reached, retrying once in 5 seconds...');
                await delay(5000);
                continue;
            }
            throw err;
        }
    }

    throw lastError;
};

//  System prompt
const SYSTEM_PROMPT = `You are an internal team-activity assistant for engineering managers.
You have access to aggregated weekly report data from the team.
Answer ONLY from the provided team-report context. If the context doesn't contain the answer, say so — never invent tasks, blockers, or names.
Keep responses concise, actionable, and well-formatted with markdown.
When discussing workload, reference actual hours and report counts from the data.
When discussing blockers, highlight recurring ones that appear across multiple weeks.`;

//  Data aggregation
const buildTeamContext = async () => {
    // 1. Date boundary: last MAX_REPORT_WEEKS weeks
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_REPORT_WEEKS * 7);

    // 2. Fetch reports with only needed fields (no emails, no passwords)
    const reports = await Report.find({ weekStartDate: { $gte: cutoffDate } })
        .populate('user', 'name')       // name only — no email, no password
        .populate('project', 'name')
        .sort({ weekStartDate: -1 })
        .lean();

    // 3. Fetch projects (names + member count only)
    const projects = await Project.find({}).select('name members').lean();

    // 4. Fetch team members (names + roles only)
    const users = await User.find({}).select('name role').lean();

    //  Pre-aggregate into compact structures

    // 4a. Per-member weekly summaries
    const memberSummaries = {};
    for (const r of reports) {
        const memberName = r.user?.name || 'Unknown';
        const projectName = r.project?.name || 'Unknown Project';
        const weekKey = new Date(r.weekStartDate).toISOString().slice(0, 10);

        if (!memberSummaries[memberName]) {
            memberSummaries[memberName] = { weeks: {}, totalHours: 0, reportCount: 0 };
        }
        const ms = memberSummaries[memberName];
        ms.reportCount++;
        ms.totalHours += r.hoursWorked || 0;

        if (!ms.weeks[weekKey]) {
            ms.weeks[weekKey] = [];
        }
        ms.weeks[weekKey].push({
            project: projectName,
            tasksCompleted: r.tasksCompleted,
            tasksPlanned: r.tasksPlannedNextWeek,
            blockers: r.blockers || '',
            hours: r.hoursWorked || 0,
            notes: r.notes || ''
        });
    }

    // 4b. Recurring blockers detection — find blocker text that appears across ≥ 2 weeks
    const blockerOccurrences = {};
    for (const r of reports) {
        if (!r.blockers || r.blockers.trim() === '') continue;
        const blockerKey = r.blockers.trim().toLowerCase();
        const weekKey = new Date(r.weekStartDate).toISOString().slice(0, 10);
        if (!blockerOccurrences[blockerKey]) {
            blockerOccurrences[blockerKey] = { text: r.blockers.trim(), weeks: new Set(), members: new Set() };
        }
        blockerOccurrences[blockerKey].weeks.add(weekKey);
        blockerOccurrences[blockerKey].members.add(r.user?.name || 'Unknown');
    }
    const recurringBlockers = Object.values(blockerOccurrences)
        .filter(b => b.weeks.size >= 2)
        .map(b => ({
            blocker: b.text,
            occurrences: b.weeks.size,
            affectedMembers: [...b.members]
        }));

    // 4c. Per-project report counts
    const projectStats = {};
    for (const r of reports) {
        const pName = r.project?.name || 'Unknown';
        projectStats[pName] = (projectStats[pName] || 0) + 1;
    }

    // 4d. Workload signals (hours per member per week)
    const workloadByWeek = {};
    for (const r of reports) {
        const weekKey = new Date(r.weekStartDate).toISOString().slice(0, 10);
        const memberName = r.user?.name || 'Unknown';
        if (!workloadByWeek[weekKey]) workloadByWeek[weekKey] = {};
        workloadByWeek[weekKey][memberName] = (workloadByWeek[weekKey][memberName] || 0) + (r.hoursWorked || 0);
    }

    // 5. Build compact context object
    return {
        dataRange: `Last ${MAX_REPORT_WEEKS} weeks (since ${cutoffDate.toISOString().slice(0, 10)})`,
        teamMembers: users.map(u => ({ name: u.name, role: u.role })),
        projects: projects.map(p => ({ name: p.name, memberCount: p.members?.length || 0 })),
        totalReportsInRange: reports.length,
        memberSummaries,
        recurringBlockers,
        projectReportCounts: projectStats,
        weeklyWorkload: workloadByWeek
    };
};

// POST /api/assistant/chat
// @desc    Chat with the AI assistant about team reports
// @route   POST /api/assistant/chat
// @access  Private (manager only)
const chatWithAssistant = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(400).json({ message: 'Message is required.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
        }

        // Build team context
        const teamContext = await buildTeamContext();

        // Build the system instruction with aggregated context
        const systemInstruction = `${SYSTEM_PROMPT}\n\n--- TEAM REPORT CONTEXT (aggregated, privacy-filtered) ---\n${JSON.stringify(teamContext, null, 2)}`;

        // Convert conversation history to Gemini format (limit to last 20 turns)
        // Gemini uses role "user" and "model" (not "assistant")
        const priorContents = Array.isArray(conversationHistory)
            ? conversationHistory.slice(-20).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }))
            : [];

        // Add the new user message
        const contents = [...priorContents, { role: 'user', parts: [{ text: message.trim() }] }];

        // Call Gemini
        const response = await generateWithRetry({
            model: MODEL,
            contents,
            config: {
                systemInstruction,
                maxOutputTokens: 1024
            }
        });

        const reply = response.text || 'No response generated.';
        res.json({ reply });
    } catch (err) {
        console.error('chatWithAssistant error');
        console.error('message:', err?.message);
        console.error('stack:', err?.stack);
        if (err?.response?.data) {
            console.error('response.data:', JSON.stringify(err.response.data, null, 2));
        }
        res.status(500).json({ message: 'Error communicating with AI assistant.' });
    }
};

//  GET /api/assistant/summary
// @desc    Generate an automatic weekly team summary
// @route   GET /api/assistant/summary
// @access  Private (manager only)
const generateTeamSummary = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server.' });
        }

        const teamContext = await buildTeamContext();

        const systemInstruction = `${SYSTEM_PROMPT}\n\n--- TEAM REPORT CONTEXT (aggregated, privacy-filtered) ---\n${JSON.stringify(teamContext, null, 2)}`;

        const response = await generateWithRetry({
            model: MODEL,
            contents: `Generate a concise weekly team summary covering:
1. **Completed Work** — key accomplishments per team member this week
2. **Recurring Blockers** — blockers that have persisted across multiple weeks and need escalation
3. **Workload Imbalances** — team members who are significantly over or under their typical hours
4. **Upcoming Plans** — major tasks planned for next week across the team

Format the summary in clear markdown sections. Be specific — reference actual names, projects, and data from the reports.`,
            config: {
                systemInstruction,
                maxOutputTokens: 1024
            }
        });

        const reply = response.text || 'No summary generated.';
        res.json({ reply });
    } catch (err) {
        console.error('generateTeamSummary error');
        console.error('message:', err?.message);
        console.error('stack:', err?.stack);
        if (err?.response?.data) {
            console.error('response.data:', JSON.stringify(err.response.data, null, 2));
        }
        res.status(500).json({ message: 'Error generating team summary.' });
    }
};

module.exports = {
    chatWithAssistant,
    generateTeamSummary
};
