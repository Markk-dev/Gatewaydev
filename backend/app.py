from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import json
from pathlib import Path

# Get the project root directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from both .env.local and backend/.env
load_dotenv(BASE_DIR / '.env.local')
load_dotenv(Path(__file__).resolve().parent / '.env')

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv('NEXT_OPENROUTER_API')
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

OCR_API_KEY = os.getenv('NEXT_OCR_API_KEY')
OCR_ENDPOINT = os.getenv('NEXT_OCR_ENDPOINT')

# Load available models
with open(BASE_DIR / 'botModel.json', 'r') as f:
    bot_models = json.load(f)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend is running'})

@app.route('/api/models', methods=['GET'])
def get_models():
    return jsonify(bot_models)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        model = data.get('model')
        messages = data.get('messages', [])
        
        if not model or not messages:
            return jsonify({'error': 'Model and messages are required'}), 400
        
        # Add system prompt if not present
        if not messages or messages[0].get('role') != 'system':
            system_prompt = {
                'role': 'system',
                'content': 'You are a helpful AI assistant. Keep your responses concise and to the point - aim for 2-3 sentences maximum unless the user specifically asks for more details, a detailed explanation, or says "explain in detail". If asked "who is the father of modern computer", give a brief answer like "Alan Turing is often called the father of modern computer science." Only provide lengthy explanations when explicitly requested.'
            }
            messages = [system_prompt] + messages
        
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AI Chatbot'
        }
        
        payload = {
            'model': model,
            'messages': messages
        }
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({'error': response.text}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ocr', methods=['POST'])
def ocr():
    try:
        # Check if image file or URL is provided
        if 'file' in request.files:
            # Handle file upload
            file = request.files['file']
            
            payload = {
                'apikey': OCR_API_KEY,
                'language': 'eng',
                'isOverlayRequired': False,
            }
            
            files = {
                'file': (file.filename, file.stream, file.content_type)
            }
            
            response = requests.post(OCR_ENDPOINT, data=payload, files=files)
            
        elif 'url' in request.json:
            # Handle image URL
            image_url = request.json.get('url')
            
            payload = {
                'apikey': OCR_API_KEY,
                'url': image_url,
                'language': 'eng',
                'isOverlayRequired': False,
            }
            
            response = requests.post(OCR_ENDPOINT, data=payload)
        else:
            return jsonify({'error': 'No image file or URL provided'}), 400
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('IsErroredOnProcessing'):
                return jsonify({'error': result.get('ErrorMessage', ['Unknown error'])[0]}), 400
            
            # Extract text from OCR result
            parsed_text = ''
            if result.get('ParsedResults'):
                parsed_text = result['ParsedResults'][0].get('ParsedText', '')
            
            return jsonify({
                'success': True,
                'text': parsed_text,
                'full_result': result
            })
        else:
            return jsonify({'error': 'OCR API request failed'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
