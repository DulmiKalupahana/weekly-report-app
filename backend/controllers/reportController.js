const Report = require('../models/Report');

// @desc    Submit a new weekly report
// @route   POST /api/reports
// @access  Private (any logged-in user)
const createReport = async (req, res) => {
    try {
        const {
            projectId,
            weekStartDate,
            weekEndDate,
            tasksCompleted,
            tasksPlannedNextWeek,
            blockers,
            hoursWorked,
            notes
        } = req.body;

        if (!projectId || !weekStartDate || !tasksCompleted || !tasksPlannedNextWeek) {
            return res.status(400).json({ message: 'Project, week start date, tasks completed and tasks planned are required.' });
        }

        const report = await Report.create({
            user: req.user._id,
            project: projectId,
            weekStartDate,
            weekEndDate: weekEndDate || undefined,
            tasksCompleted,
            tasksPlannedNextWeek,
            blockers,
            hoursWorked,
            notes
        });

        const populated = await report.populate('project', 'name');
        res.status(201).json(populated);
    } catch (err) {
        console.error('createReport error', err);
        res.status(500).json({ message: 'Error submitting report.' });
    }
};

// @desc    Get the logged-in user's own reports
// @route   GET /api/reports/myreports
// @access  Private
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id })
            .populate('project', 'name')
            .sort({ weekStartDate: -1 });

        res.json(reports);
    } catch (err) {
        console.error('getMyReports error', err);
        res.status(500).json({ message: 'Error fetching your reports.' });
    }
};

// @desc    Get all reports across all users (manager view)
// @route   GET /api/reports
// @access  Private (manager only)
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate('project', 'name')
            .populate('user', 'name email')
            .sort({ weekStartDate: -1 });

        res.json(reports);
    } catch (err) {
        console.error('getAllReports error', err);
        res.status(500).json({ message: 'Error fetching reports.' });
    }
};

// @desc    Update a report (owner only)
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        // Only the report's owner can edit it
        if (report.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not allowed to edit this report.' });
        }

        const {
            projectId,
            weekStartDate,
            weekEndDate,
            tasksCompleted,
            tasksPlannedNextWeek,
            blockers,
            hoursWorked,
            notes
        } = req.body;

        if (projectId) report.project = projectId;
        if (weekStartDate) report.weekStartDate = weekStartDate;
        report.weekEndDate = weekEndDate || undefined;
        if (tasksCompleted !== undefined) report.tasksCompleted = tasksCompleted;
        if (tasksPlannedNextWeek !== undefined) report.tasksPlannedNextWeek = tasksPlannedNextWeek;
        if (blockers !== undefined) report.blockers = blockers;
        if (hoursWorked !== undefined) report.hoursWorked = hoursWorked;
        if (notes !== undefined) report.notes = notes;

        const updated = await report.save();
        const populated = await updated.populate('project', 'name');
        res.json(populated);
    } catch (err) {
        console.error('updateReport error', err);
        res.status(500).json({ message: 'Error updating report.' });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found.' });
        }

        if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized to delete this report.' });
        }

        await Report.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Report deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteReport controller:', error);
        res.status(500).json({ message: error.message || 'Server error.' });
    }
};

module.exports = {
    createReport,
    getMyReports,
    getAllReports,
    updateReport,
    deleteReport
};