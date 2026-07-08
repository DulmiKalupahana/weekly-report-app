const express = require('express');
const router = express.Router();
const { chatWithAssistant, generateTeamSummary } = require('../controllers/assistantController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

// POST /api/assistant/chat — conversational chat with the AI assistant
router.post('/chat', protect, managerOnly, chatWithAssistant);

// GET /api/assistant/summary — generate automatic weekly team summary
router.get('/summary', protect, managerOnly, generateTeamSummary);

module.exports = router;
