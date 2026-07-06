const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // මේ report එක අයිති user (Team Member)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // මේ report එක අදාළ project එක
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    // සතියේ ආරම්භක දිනය (Week / date range)
    weekStartDate: {
        type: Date,
        required: true
    },
    // මේ සතියේ ඉවර කරපු වැඩ (Tasks completed)
    tasksCompleted: {
        type: String,
        required: true
    },
    // ලබන සතියේ කරන්න ඉන්න වැඩ (Tasks planned for next week)
    tasksPlannedNextWeek: {
        type: String,
        required: true
    },
    // ඇතිවුණු බාධා (Blockers / challenges)
    blockers: {
        type: String,
        required: true
    },
    // වැඩ කරපු පැය ගණන (Hours worked - optional)
    hoursWorked: {
        type: Number,
        default: 0
    },
    // අමතර සටහන් (Optional notes or links)
    notes: {
        type: String
    },
    // Report එකේ තත්වය (submitted / pending)
    status: {
        type: String,
        enum: ['submitted', 'pending'],
        default: 'submitted'
    }
}, {
    timestamps: true // මේකෙන් report එක හැදුවේ කීයටද කියලා auto save වෙනවා
});

module.exports = mongoose.model('Report', reportSchema);