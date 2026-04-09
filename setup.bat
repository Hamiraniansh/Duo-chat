@echo off
REM ChatSphere Setup Script for Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║    ChatSphere Setup Script             ║
echo ║    Real-Time Chat Application          ║
echo ╚════════════════════════════════════════╝
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version

echo.
echo Installing backend dependencies...
cd backend
call npm install

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

cd ..

echo.
echo ╔════════════════════════════════════════╗
echo ║    Setup Complete!                     ║
echo ╚════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Start the backend server:
echo    cd backend
echo    npm start
echo.
echo 2. In another terminal, serve the frontend:
echo    - Open index.html in your browser, OR
echo    - Use: npx http-server
echo    - Or use VS Code Live Server
echo.
echo 3. Open http://localhost:5000 or http://localhost:8000 in your browser
echo.
pause