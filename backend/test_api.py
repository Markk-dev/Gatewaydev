import requests
import json


BASE_URL = 'http://localhost:5000/api'

def test_health():
    print("Testing health endpoint...")
    response = requests.get(f'{BASE_URL}/health')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")

def test_models():
    print("Testing models endpoint...")
    response = requests.get(f'{BASE_URL}/models')
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")

def test_chat():
    print("Testing chat endpoint...")
    payload = {
        "model": "x-ai/grok-4.1-fast:free",
        "messages": [
            {"role": "user", "content": "Say hello in one sentence"}
        ]
    }
    response = requests.post(f'{BASE_URL}/chat', json=payload)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"AI Response: {data['choices'][0]['message']['content']}\n")
    else:
        print(f"Error: {response.text}\n")

if __name__ == '__main__':
    print("=== Flask Backend API Test ===\n")
    test_health()
    test_models()
    test_chat()
