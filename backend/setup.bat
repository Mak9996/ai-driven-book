@echo off
echo ================================================
echo  AI Book RAG Chatbot Backend - Setup
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo Step 1: Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo ✓ Virtual environment created

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat
echo ✓ Virtual environment activated

echo.
echo Step 3: Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 4: Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file from template
    echo.
    echo IMPORTANT: Please edit .env and add your API keys:
    echo   - OPENAI_API_KEY
    echo   - QDRANT_URL
    echo   - QDRANT_API_KEY
    echo.
) else (
    echo ✓ .env file already exists
)

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo Next steps:
echo  1. Edit .env file with your API keys
echo  2. Run: ingest.bat (to load book content)
echo  3. Run: start.bat (to start the server)
echo.
pause
