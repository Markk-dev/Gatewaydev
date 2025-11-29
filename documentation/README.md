# Flask Backend for AI Chatbot

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
python app.py
```

The backend will run on http://localhost:5000

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/models` - Get available models
- `POST /api/chat` - Send chat messages

### Chat Request Format:
```json
{
  "model": "x-ai/grok-4.1-fast:free",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```
