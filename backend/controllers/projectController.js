const Project = require('../models/Project');

// @route   POST /api/projects
const createProject = async (req, res) => {
    const { name, description, members } = req.body;

    try {
        const project = await Project.create({
            name,
            description,
            members: members || []
        });

        const populatedProject = await Project.findById(project._id)
            .populate('members', 'name email');

        res.status(201).json(populatedProject);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @route   GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('members', 'name email');

        res.json(projects);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            project.name = req.body.name || project.name;
            project.description = req.body.description || project.description;

            if (req.body.members) {
                project.members = req.body.members;
            }

            const updatedProject = await project.save();

            const populatedProject = await Project.findById(updatedProject._id)
                .populate('members', 'name email');

            res.json(populatedProject);

        } else {
            res.status(404).json({ message: 'Project not found' });
        }

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @route   DELETE /api/projects/:id
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


module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject
};