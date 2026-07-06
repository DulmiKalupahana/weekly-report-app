const Report = require('../models/Report');

// @desc    Create a new weekly report
// @route   POST /api/reports
// @access  Private (Logged in users only)
const createReport = async (req, res) => {
    const {
        projectId,
        weekStartDate,
        tasksCompleted,
        tasksPlannedNextWeek,
        blockers,
        hoursWorked,
        notes,
        status
    } = req.body;

    try {
        const report = await Report.create({
            user: req.user._id,
            project: projectId,
            weekStartDate,
            tasksCompleted,
            tasksPlannedNextWeek,
            blockers,
            hoursWorked,
            notes,
            status
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get logged-in user's reports (History)
// @route   GET /api/reports/myreports
// @access  Private
const getMyReports = async (req, res) => {
    try {
        // තමන්ගේ reports විතරක් අලුත්ම එකේ ඉඳන් පරණ එකට පෙළගස්වලා ගන්නවා
        const reports = await Report.find({ user: req.user._id })
            .populate('project', 'name') // Project එකේ නමත් එක්කම ගන්නවා
            .sort({ weekStartDate: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ALL reports (For Manager View)
// @route   GET /api/reports
// @access  Private/Manager
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate('user', 'name email') // User ගේ නම සහ ඊමේල් එක
            .populate('project', 'name')    // Project එකේ නම
            .sort({ weekStartDate: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) return res.status(404).json({ message: 'Report not found' });

        // මේ report එක අයිති කෙනාමද edit කරන්නේ කියලා බලනවා
        if (report.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to edit this report' });
        }

        const updatedReport = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedReport);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getMyReports, getAllReports, updateReport };