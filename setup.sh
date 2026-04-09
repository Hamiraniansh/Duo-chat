#!/bin/bash

# ChatSphere Setup Script for macOS/Linux

echo ""
echo "╔════════════════════════════════════════╗"
echo "║    ChatSphere Setup Script             ║"
echo "║    Real-Time Chat Application          ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install from: https://nodejs.org/"
    exit 1
fi

echo "Node.js is installed:"
node --version

echo ""
echo "Installing backend dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

cd ..

echo ""
echo "╔════════════════════════════════════════╗"
echo "║    Setup Complete!                     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2. In another terminal, serve the frontend:"
echo "   - Open index.html in your browser, OR"
echo "   - Use: npx http-server"
echo "   - Or use VS Code Live Server"
echo ""
echo "3. Open http://localhost:5000 or http://localhost:8000 in your browser"
echo ""