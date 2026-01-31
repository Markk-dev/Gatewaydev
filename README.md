# Solaris.dev

Multi-Mode Chatbot with Document Extraction

## Overview

Solaris.dev is a full-stack AI chat application that supports multiple language models with three distinct modes: Standard, Reasoning, and Navigation. The application includes OCR capabilities for extracting text from images and PDF documents, conversation history management, and a responsive interface.

## Features

- **Multi-Model Support**: Access to various AI models including Grok, GPT, Gemma, Mistral, Llama, and DeepSeek through OpenRouter API
- **Three Chat Modes**:
  - Standard: General conversational AI
  - Reasoning: Shows the AI's thought process before providing answers
  - Navigation: Location-based assistance (customizable for specific venues)
- **Document Processing**: OCR text extraction from images and PDF files
- **User Authentication**: Secure login and registration via Appwrite
- **Conversation Management**: Save, retrieve, and delete chat histories
- **File Storage**: Upload and manage document attachments
- **Responsive Design**: Mobile-friendly interface with collapsible sidebar

## Tech Stack

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Appwrite SDK

**Backend:**
- Flask (Python)
- OpenRouter API
- OCR.space API

**UI Components:**
- Radix UI
- shadcn/ui
- Framer Motion
- Lucide Icons

## Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd solaris-dev
```

### 2. Frontend Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Configure the environment variables (see Environment Variables section below).

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Configure the backend environment variables (see Environment Variables section below).

## Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_appwrite_bucket_id
```

### Backend (backend/.env)

```
NEXT_OPENROUTER_API=your_openrouter_api_key
NEXT_OCR_API_KEY=your_ocr_space_api_key
NEXT_OCR_ENDPOINT=https://api.ocr.space/parse/image
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_SECRET=your_appwrite_api_secret
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_appwrite_bucket_id
```

### Required API Keys

1. **Appwrite**: Create a project at [appwrite.io](https://appwrite.io)
   - Set up authentication
   - Create a database for conversations and messages
   - Create a storage bucket for file uploads

2. **OpenRouter API**: Get your API key at [openrouter.ai](https://openrouter.ai)
   - Provides access to multiple AI models

3. **OCR.space API**: Register at [ocr.space](https://ocr.space/ocrapi)
   - Free tier available for text extraction

## Running the Application

### Start the Backend Server

```bash
cd backend
python app.py
```

The Flask server will run on `http://localhost:5000`

### Start the Frontend Development Server

In a new terminal, from the root directory:

```bash
npm run dev
```

The Next.js application will run on `http://localhost:3000`

## Appwrite Configuration

### Database Structure

Create a database with the following collections:

**Conversations Collection:**
- `user_id` (string, required)
- `title` (string, required)
- `created_at` (datetime, required)

**Messages Collection:**
- `conversation_id` (string, required)
- `sender` (string, required) - Values: "user" or "bot"
- `message` (string, required)
- `file_id` (string, optional)
- `created_at` (datetime, required)

### Storage Bucket

Create a storage bucket for file uploads with appropriate permissions for authenticated users.

## Customizing Navigation Mode

The Navigation mode is currently configured for a specific location (ST. ANNE COLLEGE LUCENA). To customize it for your own use case:

1. Open `lib/navigation-system-prompt.txt`
2. Replace the location data with your own venue information
3. Update the structure to match your building layout
4. Modify the response format as needed

Example structure for your custom location:

```
You are a navigation assistant for [YOUR VENUE NAME], located in [LOCATION].

CRITICAL RULES:
- This is [YOUR VENUE NAME] in [LOCATION]
- ONLY use the location data provided below
- Be direct and concise
- Format directions with emojis: 📍 (start), 🪜 (stairs), ➡️ (walk), 🎯 (destination)

[YOUR VENUE DATA]:

FLOOR 1:
- Room A: Description
- Room B: Description

FLOOR 2:
- Room C: Description
- Room D: Description

[Add your custom data structure here]
```

## Project Structure

```
solaris-dev/
├── app/                    # Next.js app directory
│   ├── chat/              # Chat page
│   └── page.tsx           # Landing page
├── backend/               # Flask backend
│   ├── app.py            # Main Flask application
│   └── requirements.txt  # Python dependencies
├── components/            # React components
│   ├── chat-*.tsx        # Chat-related components
│   └── ui/               # UI components
├── lib/                   # Utility functions and configurations
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication logic
│   ├── conversations.ts  # Conversation management
│   ├── file-storage.ts   # File upload logic
│   └── navigation-system-prompt.txt  # Navigation mode configuration
└── public/               # Static assets
```

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## Credits

If you find this project useful, please consider starring the repository.

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
