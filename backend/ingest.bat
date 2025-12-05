@echo off
echo Running Document Ingestion Script...
echo.

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

REM Run ingestion script
python scripts\ingest_docs.py

echo.
echo Done! Press any key to exit...
pause
