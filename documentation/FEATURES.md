# AI Chatbot Features

## ✅ Implemented Features

### 1. Real OpenRouter Integration
- Flask backend connects to OpenRouter API
- All 5 models from botModel.json are available
- Real AI responses (no more mock data)

### 2. Correct Model Logos
Each model displays its proper logo:
- **Grok 4.1 Fast** → `/models/grok.png`
- **GPT OSS 20B** → `/models/gpt.png`
- **Gemma 3N** → `/models/gemini.png`
- **Qwen3 4B** → `/models/Qwen.png`
- **Mistral Small** → `/models/Mistral.png`

### 3. Smart Model Fallback System
When a model fails or times out:
1. Shows user-friendly message:
   - "The model was taking longer than expected to respond. Automatically switching..."
   - "The model encountered a problem. Automatically switching..."
2. Automatically tries the next available model
3. Updates the UI to show the new model
4. Continues until a model responds or all models are exhausted

### 4. Request Timeout
- 30-second timeout per model request
- Prevents indefinite waiting
- Triggers automatic fallback

### 5. Model Switching
- User can manually switch models from dropdown
- Selected model persists across messages
- Conversation history maintained when switching

### 6. Centralized Model Management
- All model info in `lib/models.ts`
- Easy to add/remove models
- Consistent across all components

## How It Works

```
User sends message
    ↓
Try current model (30s timeout)
    ↓
Success? → Show response
    ↓
Fail/Timeout? → Show warning + Switch to next model
    ↓
Repeat until success or all models tried
```

## Model Order (Fallback Chain)
1. Grok 4.1 Fast
2. GPT OSS 20B
3. Gemma 3N
4. Qwen3 4B
5. Mistral Small

If all fail, shows: "All models are currently unavailable."
