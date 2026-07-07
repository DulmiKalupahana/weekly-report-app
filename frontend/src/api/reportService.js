const express = require('express');
const router = express.Router();
const { createReport, getMyReports, getAllReports, updateReport } = require('../controllers/reportController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);
router.get('/my', protect, getMyReports); // Standardized to /my
router.get('/all', protect, managerOnly, getAllReports); // Standardized to /all
router.put('/:id', protect, updateReport);

module.exports = router;