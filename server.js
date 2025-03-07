import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Get API key from environment variables
const CLAUDE_API_KEY = process.env.VITE_CLAUDE_API_KEY;

// Check if API key is available
if (!CLAUDE_API_KEY) {
  console.error('ERROR: Claude API key is not set in environment variables');
  console.error('Please make sure you have a .env file with VITE_CLAUDE_API_KEY set');
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint to handle Claude API requests
app.post('/api/remix', async (req, res) => {
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({
      error: 'API key is not configured on the server'
    });
  }

  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    // Extract the necessary data from the request
    const { model, max_tokens, messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages format:', messages);
      return res.status(400).json({
        error: 'Invalid messages format. Expected non-empty array.'
      });
    }
    
    console.log('Using model:', model || "claude-3-7-sonnet-20250219");
    console.log('Using max_tokens:', max_tokens || 1024);
    console.log('Messages:', JSON.stringify(messages, null, 2));
    
    // Use the Anthropic SDK to create a message
    const response = await anthropic.messages.create({
      model: model || "claude-3-7-sonnet-20250219",
      max_tokens: max_tokens || 1024,
      messages: messages,
    });
    
    console.log('Claude API response received:', JSON.stringify({
      id: response.id,
      model: response.model,
      role: response.role,
      stop_reason: response.stop_reason,
      usage: response.usage
    }, null, 2));
    
    res.json(response);
  } catch (error) {
    console.error('Error calling Claude API:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    
    res.status(500).json({
      error: error.message || 'An error occurred while processing your request'
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API key configured: ${CLAUDE_API_KEY ? 'Yes' : 'No'}`);
}); 