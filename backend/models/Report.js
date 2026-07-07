const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        weekStartDate: {
            type: Date,
            required: true
        },
        weekEndDate: {
            type: Date
        },
        tasksCompleted: {
            type: String,
            required: true,
            trim: true
        },
        tasksPlannedNextWeek: {
            type: String,
            required: true,
            trim: true
        },
        blockers: {
            type: String,
            trim: true,
            default: ''
        },
        hoursWorked: {
            type: Number,
            min: 0
        },
        notes: {
            type: String,
            trim: true,
            default: ''
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);