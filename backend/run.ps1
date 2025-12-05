# FastAPI Backend - PowerShell Runner
# Run this from VS Code terminal: .\run.ps1

param(
    [Parameter(Position=0)]
    [ValidateSet('setup', 'ingest', 'start', 'help')]
    [string]$Command = 'help'
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AI Book RAG Chatbot Backend" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

switch ($Command) {
    'setup' {
        Write-Host "🔧 Setting up backend environment...`n" -ForegroundColor Yellow

        # Check Python
        Write-Host "Checking Python installation..." -ForegroundColor Gray
        $pythonVersion = python --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Python not found!" -ForegroundColor Red
            Write-Host "Please install Python 3.9+ from https://www.python.org/`n" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Found: $pythonVersion`n" -ForegroundColor Green

        # Create venv
        Write-Host "Creating virtual environment..." -ForegroundColor Gray
        python -m venv venv
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to create virtual environment`n" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Virtual environment created`n" -ForegroundColor Green

        # Activate and install
        Write-Host "Installing dependencies..." -ForegroundColor Gray
        .\venv\Scripts\Activate.ps1
        pip install --upgrade pip --quiet
        pip install -r requirements.txt
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies`n" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Dependencies installed`n" -ForegroundColor Green

        # Create .env
        if (!(Test-Path .env)) {
            Copy-Item .env.example .env
            Write-Host "✅ Created .env file`n" -ForegroundColor Green
            Write-Host "⚠️  IMPORTANT: Edit .env and add your API keys:`n" -ForegroundColor Yellow
            Write-Host "   - OPENAI_API_KEY" -ForegroundColor White
            Write-Host "   - QDRANT_URL" -ForegroundColor White
            Write-Host "   - QDRANT_API_KEY`n" -ForegroundColor White
        } else {
            Write-Host "✅ .env file already exists`n" -ForegroundColor Green
        }

        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Setup Complete! 🎉" -ForegroundColor Cyan
        Write-Host "========================================`n" -ForegroundColor Cyan
        Write-Host "Next steps:" -ForegroundColor White
        Write-Host "  1. Edit .env with your API keys" -ForegroundColor White
        Write-Host "  2. Run: .\run.ps1 ingest" -ForegroundColor White
        Write-Host "  3. Run: .\run.ps1 start`n" -ForegroundColor White
    }

    'ingest' {
        Write-Host "📚 Running document ingestion...`n" -ForegroundColor Yellow

        if (!(Test-Path venv)) {
            Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
            Write-Host "Run: .\run.ps1 setup`n" -ForegroundColor Red
            exit 1
        }

        .\venv\Scripts\Activate.ps1
        python scripts\ingest_docs.py

        Write-Host "`n✅ Ingestion complete!`n" -ForegroundColor Green
    }

    'start' {
        Write-Host "🚀 Starting FastAPI server...`n" -ForegroundColor Yellow

        if (!(Test-Path venv)) {
            Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
            Write-Host "Run: .\run.ps1 setup`n" -ForegroundColor Red
            exit 1
        }

        Write-Host "Server: http://localhost:8000" -ForegroundColor Green
        Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

        .\venv\Scripts\Activate.ps1
        uvicorn app.main:app --reload --port 8000
    }

    'help' {
        Write-Host "Usage: .\run.ps1 <command>`n" -ForegroundColor White
        Write-Host "Commands:" -ForegroundColor White
        Write-Host "  setup   - Install dependencies and create .env" -ForegroundColor White
        Write-Host "  ingest  - Load book content into vector database" -ForegroundColor White
        Write-Host "  start   - Start the FastAPI server" -ForegroundColor White
        Write-Host "  help    - Show this help message`n" -ForegroundColor White
        Write-Host "Examples:" -ForegroundColor Gray
        Write-Host "  .\run.ps1 setup" -ForegroundColor Gray
        Write-Host "  .\run.ps1 ingest" -ForegroundColor Gray
        Write-Host "  .\run.ps1 start`n" -ForegroundColor Gray
    }
}
