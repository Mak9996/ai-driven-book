# AI Book RAG Chatbot Backend

**Powered by Google Gemini (FREE!)**

FastAPI backend for the AI-Driven Development book's intelligent chatbot using RAG (Retrieval-Augmented Generation).

## Quick Start

### 1. Setup

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
```

### 2. Get API Keys

**Google Gemini (FREE):**
1. Visit: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Copy the key

**Qdrant (FREE tier available):**
1. Visit: https://cloud.qdrant.io/
2. Create account
3. Create cluster
4. Copy URL and API key

### 3. Configure .env

Edit `.env` and add your keys:

```env
GOOGLE_API_KEY=your-gemini-key-here
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-key
```

### 4. Load Book Content

```powershell
python scripts\ingest_docs_gemini.py
```

This processes all markdown files and uploads to Qdrant (takes 5-10 minutes).

### 5. Start Server

```powershell
uvicorn app.main:app --reload --port 8000
```

Visit: **http://localhost:8000/docs**

## API Endpoints

### Chat with RAG
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is spec-driven development?",
  "context": "optional selected text"
}
```

### Search Only
```http
POST /api/search?query=FastAPI&top_k=5
```

### Health Check
```http
GET /health
```

## Project Structure

```
backend/
├── app/
│   ├── config.py      # Configuration
│   └── main.py        # FastAPI application
├── scripts/
│   └── ingest_docs_gemini.py  # Document processing
├── requirements.txt    # Dependencies
├── .env               # Your API keys (not committed)
└── README.md          # This file
```

## Features

✅ **RAG-Powered Answers** - Searches book content for relevant context
✅ **Google Gemini** - FREE API with generous limits
✅ **Vector Search** - Qdrant for semantic search
✅ **Source Citations** - Shows where answers come from
✅ **Context-Aware** - Supports user-selected text
✅ **Auto Documentation** - Swagger UI at `/docs`
✅ **CORS Enabled** - Ready for frontend integration

## Why Gemini?

- **FREE** - 60 requests per minute on free tier
- **Fast** - Cloud-based, no local installation
- **Reliable** - Works on restricted networks
- **Quality** - GPT-3.5 level responses
- **No Setup** - Just API key needed

## Troubleshooting

### "GOOGLE_API_KEY not set"
Add your key to `.env` file

### "Qdrant collection not found"
Run `python scripts\ingest_docs_gemini.py`

### CORS errors
Frontend URL is already configured in `.env` as `localhost:3000`

## Development

Start in dev mode with auto-reload:
```powershell
uvicorn app.main:app --reload
```

## Testing

Test with cURL:
```powershell
curl -X POST http://localhost:8000/api/chat `
  -H "Content-Type: application/json" `
  -d '{\"message\": \"What is RAG?\"}'
```

Or use the interactive docs at http://localhost:8000/docs

## License

Same as the main AI-Driven Development Book project.
