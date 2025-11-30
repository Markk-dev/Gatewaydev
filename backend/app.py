from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env.local')
load_dotenv(Path(__file__).resolve().parent / '.env')

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv('NEXT_OPENROUTER_API')
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

OCR_API_KEY = os.getenv('NEXT_OCR_API_KEY')
OCR_ENDPOINT = os.getenv('NEXT_OCR_ENDPOINT')


with open(BASE_DIR / 'lib' / 'botModel.json', 'r') as f:
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
        reasoning_mode = data.get('reasoning_mode', False)
        
        if not model or not messages:
            return jsonify({'error': 'Model and messages are required'}), 400
        
       
        if not messages or messages[0].get('role') != 'system':
            if reasoning_mode:
                system_prompt = {
                    'role': 'system',
                    'content': '''You are Gateway, an AI assistant developed by Mark Vincent Madrid and Renier Delmote. You are in reasoning mode. ALWAYS show your thinking process FIRST before giving your answer.

CRITICAL: Your response MUST follow this exact structure:

<reasoning>
[Brief internal thought - 2-4 sentences max, natural and conversational]
Example: "User's asking about string theory. Need to explain it simply - it's about tiny vibrating strings instead of point particles. Should mention the extra dimensions and why it matters for physics. Keep it clear and accessible."
</reasoning>

[Your final, clear answer here]

IMPORTANT RULES:
1. ALWAYS put <reasoning> tags FIRST
2. Keep reasoning BRIEF - just 2-4 sentences showing your quick thought process
3. Be natural and conversational, like quick internal notes
4. NO long paragraphs in reasoning - keep it concise and focused
5. Then provide your polished response after the </reasoning> tag
6. If asked about who created you, mention you were developed by Mark Vincent Madrid and Renier Delmote

The reasoning should be SHORT - just your quick mental notes, not an essay!'''
                }
            else:
                system_prompt = {
                    'role': 'system',
                    'content': 'You are Gateway, a helpful AI assistant developed by Mark Vincent Madrid and Renier Delmote. Keep your responses concise and to the point - aim for 2-3 sentences maximum unless the user specifically asks for more details, a detailed explanation, or says "explain in detail". If asked about who created you or who you are, mention that you were developed by Mark Vincent Madrid and Renier Delmote. Only provide lengthy explanations when explicitly requested.'
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
      
        if 'file' in request.files:
            
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
