# 🤖 StacXai - OpenAI API Integration Setup

## 🚨 IMPORTANT SECURITY NOTICE
**The API key you shared in your message has been exposed and should be revoked immediately!**

1. Go to https://platform.openai.com/account/api-keys
2. Find and revoke the exposed key: `sk-proj-4weTy7iEl8PgwTyfTdUeHAprWIk6MeBVpmo5OVGwDzDT...`
3. Create a new API key

## 🛠️ Setup Instructions

### 1. Create Environment File
Create a `.env` file in your project root:

```bash
# Copy the example and edit with your API key
echo "OPENAI_API_KEY=your_new_api_key_here" > .env
echo "PORT=3001" >> .env
```

### 2. Add Your New API Key
Edit the `.env` file and replace `your_new_api_key_here` with your actual OpenAI API key.

### 3. Start the Backend Server
In one terminal, run:
```bash
npm run server
```

You should see:
```
🚀 StacXai API server running on http://localhost:3001
📡 Health check: http://localhost:3001/api/health
```

### 4. Start the Frontend
In another terminal, run:
```bash
npm run dev
```

## 🎯 How It Works

- **Frontend (React)**: Runs on `http://localhost:3000`
- **Backend (Express)**: Runs on `http://localhost:3001`
- **API Models**: 
  - "Chat Model" → uses `gpt-3.5-turbo`
  - "Reasoning Model" → uses `gpt-4`

## 🔒 Security Features

✅ API key stored securely in backend environment  
✅ CORS enabled for frontend communication  
✅ Error handling for API failures  
✅ No API key exposure in browser  

## 🚀 Usage

1. Select your preferred model (Chat Model or Reasoning Model)
2. Type your message and hit Send
3. StacXai will respond using the selected OpenAI model

## 🛠️ Troubleshooting

**Error: "OpenAI API key not configured"**
- Make sure your `.env` file exists and contains a valid `OPENAI_API_KEY`

**Error: "Cannot connect to AI service"**
- Ensure the backend server is running on port 3001
- Check that the frontend is trying to reach `localhost:3001`

**Network errors**
- Both frontend and backend must be running simultaneously
- Check firewall settings if needed

## 💰 API Costs
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.06 per 1K tokens

Monitor your usage at https://platform.openai.com/usage

## 🔧 Customization

You can modify the AI behavior by editing the system prompt in `server.js`:

```javascript
{
  role: 'system',
  content: 'You are StacXai, a helpful AI assistant. Provide clear, accurate, and helpful responses.'
}
``` 