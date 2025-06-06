import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import axios from 'axios';

const envPath = path.resolve(process.cwd(), '.env');
const dotEnvConfig = dotenv.config({ path: envPath, debug: process.env.NODE_ENV !== 'production' });

if (dotEnvConfig.error) {
  console.error('Error loading .env file:', dotEnvConfig.error);
}
console.log('Attempted to load .env from:', envPath);
console.log('Parsed .env variables (if any):', dotEnvConfig.parsed);
console.log('process.env.PORT after dotenv.config():', process.env.PORT);
console.log('process.env.OPENROUTER_API_KEY loaded:', !!process.env.OPENROUTER_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
console.log(`Attempting to start server on PORT: ${PORT} (process.env.PORT was: ${process.env.PORT})`);

const openRouterApiKey = process.env.OPENROUTER_API_KEY;
if (!openRouterApiKey) {
  console.error('FATAL ERROR: OPENROUTER_API_KEY is not set in the environment.');
}

app.post('/api/chat', async (req, res) => {
  try {
    if (!openRouterApiKey) {
      console.error('OPENROUTER_API_KEY is missing before API call!');
      return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    const { messages } = req.body;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "mistralai/mistral-7b-instruct",
      messages: messages,
    }, {
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": "https://stacxai.com", // Replace with your actual site URL
        "X-Title": "StacXai",
        "Content-Type": "application/json"
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('OpenRouter API error:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      error: 'Failed to get response from OpenRouter', 
      details: error.response ? error.response.data : error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StacXai API server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 StacXai API server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
}); 