const express = require('express');
const router = express.Router();
const { processMessage } = require('../services/chatbotService');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ message: 'Message too long. Please keep it under 500 characters.' });
    }

    const result = await processMessage(message.trim(), req.user);

    res.json(result);
  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ message: 'Sorry, something went wrong. Please try again.' });
  }
});

module.exports = router;
