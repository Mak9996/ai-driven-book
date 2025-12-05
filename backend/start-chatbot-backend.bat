@echo off
echo ========================================
echo Starting AI Chatbot Backend
echo ========================================
echo.

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet
echo.

REM Start the server
echo ========================================
echo Starting FastAPI server on port 8000...
echo.
echo The chatbot backend is now running!
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
