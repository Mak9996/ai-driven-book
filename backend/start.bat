@echo off
echo Starting AI Book RAG Chatbot Backend...
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo WARNING: Virtual environment not found!
    echo Please run: python -m venv venv
    echo.
)

REM Start FastAPI server
echo Starting server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
uvicorn app.main:app --reload --port 8000
