const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    // Optional: Project එකට අදාළ team members ලව මෙතන ලින්ක් කරන්න පුළුවන්
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);