@echo off
title IDX Terminal - Automated Initial Setup
color 0B
cls
echo ==============================================================================
echo                 IDX TERMINAL - AUTOMATED INITIAL SETUP
echo       Pro Algorithmic Market Intelligence & Smart Money Concepts Engine
echo ==============================================================================
echo.
echo [1/4] Checking Prerequisites (Python & Node.js)...
echo ------------------------------------------------------------------------------

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not installed or not added to PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add python.exe to PATH" during installation.
    pause
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo [+] Found Python version: %PYTHON_VERSION%

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not added to PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [+] Found Node.js version: %NODE_VERSION%
echo.

echo [2/4] Setting up Python Virtual Environment (backend/venv)...
echo ------------------------------------------------------------------------------
cd /d "%~dp0backend"
if not exist "venv" (
    echo [*] Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [+] Virtual environment created successfully!
) else (
    echo [+] Virtual environment already exists at backend\venv.
)
echo.

echo [3/4] Installing Python Backend Dependencies (requirements.txt)...
echo ------------------------------------------------------------------------------
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
echo [*] Installing requirements (FastAPI, Uvicorn, Pandas, yfinance, TA-Lib, etc.)...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Some pip dependencies had issues. Continuing setup...
)
echo [+] Backend Python environment ready!
echo.

echo [4/4] Installing Frontend Dependencies (npm install)...
echo ------------------------------------------------------------------------------
cd /d "%~dp0frontend"
echo [*] Running npm install in frontend directory...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b 1
)
echo [+] Frontend Node.js modules installed successfully!
echo.

cd /d "%~dp0"
color 0A
echo ==============================================================================
echo                      SETUP COMPLETED SUCCESSFULLY!
echo ==============================================================================
echo.
echo You are now ready to launch IDX Terminal!
echo.
echo To start the entire application (Backend & Frontend):
echo   -> Simply double-click "run.bat"
echo.
echo - Backend API will run at:  http://localhost:8000
echo - Frontend UI will run at:   http://localhost:3000
echo ==============================================================================
echo.
pause
