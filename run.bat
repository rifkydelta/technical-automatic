@echo off
title IDX Terminal Launcher
color 0A
cls
echo ==============================================================================
echo                 IDX TERMINAL - LAUNCHING APPLICATION
echo       Pro Algorithmic Market Intelligence & Smart Money Concepts Engine
echo ==============================================================================
echo.

:: 1. Check if setup was executed
if not exist "%~dp0backend\venv" (
    color 0E
    echo [NOTICE] Python virtual environment was not found.
    echo Running automated setup first...
    echo.
    call "%~dp0setup.bat"
)

:: 2. Kill existing processes on Ports 8000 and 3000
echo [*] Cleaning up any existing processes on Port 8000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo     [-] Terminating old Backend process (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo     [-] Terminating old Frontend process (PID: %%a)
    taskkill /f /pid %%a >nul 2>&1
)
echo [+] Ports are clean!
echo.

:: 3. Start Backend in dedicated window
echo [*] Launching Backend API Server (FastAPI on Port 8000)...
start "IDX Terminal - Backend API (:8000)" cmd /k "title IDX Backend Server && cd /d "%~dp0backend" && call venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

:: 4. Wait for backend to initialize
timeout /t 2 /nobreak >nul

:: 5. Start Frontend in dedicated window
echo [*] Launching Frontend UI (Next.js on Port 3000)...
start "IDX Terminal - Frontend UI (:3000)" cmd /k "title IDX Frontend Next.js && cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==============================================================================
echo                   ALL SERVICES LAUNCHED SUCCESSFULLY!
echo ==============================================================================
echo.
echo  - Frontend Web UI  : http://localhost:3000  (Access the Terminal here)
echo  - Backend REST API : http://localhost:8000  (Swagger Docs at /docs)
echo.
echo  Keep the opened command windows running while using the terminal.
echo  To shut down, simply close both command windows.
echo ==============================================================================
echo.
pause
