const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReport } = require('../controllers/reportController');const { protect, managerOnly } = require('../middleware/authMiddleware');

// Report එකක් හදන්න (POST) සහ Manager ට ඔක්කොම reports බලන්න (GET)
router.route('/')
    .post(protect, createReport)
    .get(protect, managerOnly, getAllReports);

// තමන්ගේ Reports ටික බලාගන්න (GET)
router.get('/myreports', protect, getMyReports);
router.route('/:id').put(protect, updateReport);

module.exports = router;