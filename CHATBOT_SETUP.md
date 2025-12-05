# 🤖 Chatbot Setup Guide

## Quick Start (2 Steps!)

### Step 1: Start the Backend (One-Click)

Double-click this file:
```
backend/start-chatbot-backend.bat
```

This will:
- ✅ Create a Python virtual environment (if needed)
- ✅ Install all dependencies (OpenAI, Gemini, FastAPI)
- ✅ Start the backend server on port 8000

**Wait for this message:**
```
INFO:     Application startup complete.
```

### Step 2: Start the Frontend

In a new terminal:
```bash
npm start
```

## That's It! 🎉

Your chatbot is now ready to use!

### How to Use:

1. **Open your website** at http://localhost:3000/ai-driven-book/
2. **Click the chatbot button** (💬) in the bottom-right corner
3. **Click the ⚙️ Settings button**
4. **Choose your provider:**
   - **OpenAI** - Get API key from https://platform.openai.com/api-keys
   - **Gemini (FREE!)** - Get API key from https://aistudio.google.com/apikey
5. **Paste your API key** and click "Save & Start Chatting"
6. **Start chatting!** 🚀

## Features:

### ✨ Smart Features
- **Text Selection**: Select any text on the page and use quick actions (Explain, Examples, Simplify)
- **Chapter Summaries**: Get summaries of any chapter
- **Compare Concepts**: Compare two concepts side-by-side
- **Learning Roadmap**: Get a personalized learning path
- **Code Helper**: Get help with code

### 🔒 Privacy
- Your API key is stored **locally** in your browser
- Keys are **never** sent to our servers
- Only used to make API calls on your behalf

## Troubleshooting:

### Backend won't start?
1. Make sure Python 3.9+ is installed: `python --version`
2. Try manually:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```

### Chatbot shows error?
1. Make sure the backend is running (check terminal)
2. Check your API key is valid
3. Try refreshing the page

### CORS errors?
The backend is configured to accept requests from localhost:3000. If you're running on a different port, update `backend/app/config.py`

## API Providers:

### OpenAI
- **Cost**: Pay-as-you-go ($0.0025-0.01 per 1K tokens)
- **Models**: GPT-4o, GPT-4o-mini, GPT-4-Turbo, o1-preview, o1-mini
- **Best for**: Advanced reasoning, complex tasks
- **Get key**: https://platform.openai.com/api-keys

### Google Gemini
- **Cost**: **FREE!** (60 requests/minute)
- **Model**: Gemini 1.5 Flash
- **Best for**: Quick questions, learning, FREE usage!
- **Get key**: https://aistudio.google.com/apikey

## Need Help?

- Backend docs: http://localhost:8000/docs
- Check backend logs in the terminal
- Make sure both frontend and backend are running

Happy chatting! 🎉
