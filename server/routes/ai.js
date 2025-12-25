const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');

/**
 * POST /api/ai/chat
 * Body: { messages: [{ role, content }] }
 */
router.post('/chat', auth, async (req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({ message: 'Invalid messages format' });
        }

        const result = await callOpenRouter({ messages });

        res.json(result);
    } catch (err) {
        console.error('OpenRouter error:', err.response?.data || err.message);
        res.status(500).json({ message: 'AI service error' });
    }
});

module.exports = router;
