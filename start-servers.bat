@echo off
echo Starting Drift Detector Servers...
echo.

echo Starting Rails Backend on port 3001...
start "Rails Backend" cmd /k "cd drift-rails && rails server -p 3001"

echo Waiting for Rails to start...
timeout /t 5 /nobreak > nul

echo Starting Next.js Frontend on port 3000...
start "Next.js Frontend" cmd /k "cd drift-web && npm run dev"

echo.
echo Both servers are starting up!
echo - Rails Backend: http://localhost:3001
echo - Next.js Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
