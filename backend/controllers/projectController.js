const Project = require('../models/Project');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Manager
const createProject = async (req, res) => {
    const { name, description } = req.body;
    try {
        const project = await Project.create({ name, description });
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        // .populate පාවිච්චි කරලා members ලගේ විස්තරත් එක්කම ගන්නවා
        const projects = await Project.find({}).populate('members', 'name email');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a project (Edit name, description, or members)
// @route   PUT /api/projects/:id
// @access  Private/Manager
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            project.name = req.body.name || project.name;
            project.description = req.body.description || project.description;
            
            // Assign members කොටස (Optional)
            if (req.body.members) {
                project.members = req.body.members;
            }

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Manager
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            await Project.deleteOne({ _id: req.params.id });
            res.json({ message: 'Project removed successfully' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };