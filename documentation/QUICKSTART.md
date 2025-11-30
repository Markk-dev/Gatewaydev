# Quick Start Guide - AI Chatbot with Flask Backend

## Your Setup is Complete! ✅

The Flask backend is integrated with OpenRouter API and ready to use.

## Start the Application

### 1. Start Flask Backend (Terminal 1)
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend will run on: http://localhost:5000

### 2. Start Next.js Frontend (Terminal 2)
```cmd
npm run dev
```

Frontend will run on: http://localhost:3000

## Test the Backend

Run the test script to verify OpenRouter connection:
```cmd
cd backend
venv\Scripts\activate
python test_api.py
```

## API Endpoints Available

- **GET** `/api/health` - Check if backend is running
- **GET** `/api/models` - Get list of available AI models
- **POST** `/api/chat` - Send messages to AI

## Example Chat Request

```javascript
import { sendChatMessage } from '@/lib/api'

const response = await sendChatMessage(
  'x-ai/grok-4.1-fast:free',
  [
    { role: 'user', content: 'Hello!' }
  ]
)
```

## Available Models (from botModel.json)

1. x-ai/grok-4.1-fast:free
2. openai/gpt-oss-20b:free
3. google/gemma-3n-e2b-it:free
4. qwen/qwen3-4b:free
5. mistralai/mistral-small-3.1-24b-instruct:free

## Next Steps

1. Use the `ChatExample` component in your pages
2. Import API functions from `lib/api.ts` in your components
3. Build your chat UI using the provided utilities

Your OpenRouter API key is configured and ready to use! 🚀
