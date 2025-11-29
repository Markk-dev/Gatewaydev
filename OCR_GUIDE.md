# OCR Integration Guide

## Overview
The chatbot now supports OCR (Optical Character Recognition) to extract text from images using OCR.space API.

## How to Use

### 1. Upload an Image
- Click the paperclip icon in the chat input
- Select an image file (JPG, PNG, GIF, etc.)
- The system will automatically extract text from the image

### 2. Text Extraction
- Extracted text is automatically added to your message
- Format: `[Image text]: <extracted text>`
- You can edit or add more context before sending

### 3. Ask Questions About the Image
After OCR completes, you can:
- Ask the AI to explain the text
- Request translation
- Ask for summarization
- Get analysis of the content

## API Endpoint

**POST** `/api/ocr`

### Upload File:
```bash
curl -X POST http://localhost:5000/api/ocr \
  -F "file=@image.jpg"
```

### Use Image URL:
```bash
curl -X POST http://localhost:5000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}'
```

### Response:
```json
{
  "success": true,
  "text": "Extracted text from image...",
  "full_result": { }
}
```

## Configuration

OCR settings are in `backend/.env`:
```env
NEXT_OCR_API_KEY=your_api_key_here
NEXT_OCR_ENDPOINT=https://api.ocr.space/parse/image
```

## Supported Formats (OCR.space)
- **JPEG/JPG** - Standard image format
- **PNG** - Portable Network Graphics
- **PDF** - Portable Document Format (first page only)

## Features
- Automatic language detection
- Support for multiple languages
- Fast processing
- High accuracy text extraction

## Example Use Cases
1. **Extract text from screenshots**
2. **Read text from photos of documents**
3. **Convert handwritten notes to digital text**
4. **Extract data from receipts or invoices**
5. **Read text from memes or social media images**
