const express = require('express');
const router = express.Router();
const {
    createReport,
    getMyReports,
    getAllReports,
    updateReport,
    deleteReport
} = require('../controllers/reportController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReport)
    .get(protect, managerOnly, getAllReports);


router.get('/myreports', protect, getMyReports);

router.route('/:id')
    .put(protect, updateReport);

router.delete('/:id', protect, deleteReport);

module.exports = router;