const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    updateProject,
    deleteProject
} = require('../controllers/projectController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, managerOnly, createProject)
    .get(protect, getProjects);

router.route('/:id')
    .put(protect, managerOnly, updateProject)
    .delete(protect, managerOnly, deleteProject);

module.exports = router;