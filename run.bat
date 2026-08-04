@echo off
echo ===================================================
echo Starting IDX Technical Analysis Dashboard...
echo ===================================================
echo.

:: Kill existing services (Port 8000 and 3000)
echo Cleaning up existing services...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    echo Killing Backend process PID: %%a
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo Killing Frontend process PID: %%a
    taskkill /f /pid %%a 2>nul
)
echo.

:: Start Backend
echo Starting Backend API...
start "Backend API" cmd /k "cd backend && call venv\Scripts\activate.bat && uvicorn main:app --reload"

:: Wait a brief moment before starting frontend
timeout /t 2 /nobreak >nul

:: Start Frontend
echo Starting Frontend Next.js...
start "Frontend UI" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Application has been launched in separate windows!
echo - Backend API running at: http://localhost:8000 (default)
echo - Frontend UI running at: http://localhost:3000 (default)
echo ===================================================
echo.
pause
