const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getUsers } = require('../controllers/userController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, managerOnly, getUsers);

module.exports = router;