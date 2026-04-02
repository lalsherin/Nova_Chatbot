require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store conversation histories per session (in-memory)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    const id = sessionId || 'default';
    if (!conversations.has(id)) {
      conversations.set(id, [
        {
          role: 'system',
          content: `You are Nova, a friendly and knowledgeable AI assistant. You are helpful, creative, and concise. You use markdown formatting when appropriate to make your responses clear and well-structured. You were built by an innovative developer using Groq's lightning-fast inference engine.`
        }
      ]);
    }

    const history = conversations.get(id);
    history.push({ role: 'user', content: message });

    // Keep conversation history manageable (last 20 messages + system)
    const trimmedHistory = [
      history[0], // system message
      ...history.slice(-20)
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: trimmedHistory,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      stream: false,
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    // Store assistant reply in history
    history.push({ role: 'assistant', content: reply });
    conversations.set(id, history);

    res.json({
      reply,
      model: 'llama-3.3-70b-versatile',
      usage: chatCompletion.usage,
    });
  } catch (error) {
    console.error('Groq API Error:', error.message);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

// Clear conversation endpoint
app.post('/api/clear', (req, res) => {
  const { sessionId } = req.body;
  const id = sessionId || 'default';
  conversations.delete(id);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Nova AI Chatbot server running at http://localhost:${PORT}\n`);
});
