# Quick Start Guide - ChatSphere

## 🚀 5-Minute Setup

### For Windows:
```bash
# Simply run:
setup.bat
```

### For macOS/Linux:
```bash
# Make the script executable:
chmod +x setup.sh

# Then run:
./setup.sh
```

### Manual Setup:
```bash
# 1. Install backend dependencies
cd backend
npm install

# 2. Start the server (Terminal 1)
npm start
# Output: Server running on port 5000

# 3. In another terminal, start frontend (Terminal 2)
npx http-server
# Output: http://127.0.0.1:8000
```

## 📝 How to Use

1. **Enter your username** (max 20 characters)
2. **Click "Join Chat"** or press Enter
3. **Type your message** in the input box
4. **Press Enter or click Send** to send
5. **See online users** in the left sidebar
6. **Click the exit button** to leave

## 🌐 Ports

- **Backend Server**: http://localhost:5000
- **Frontend (if using http-server)**: http://localhost:8000

## 🐛 Troubleshooting

**Issue**: "Cannot connect to server"
- ✅ Make sure `npm start` is running in the backend folder
- ✅ Check that port 5000 is not blocked by firewall

**Issue**: "Username already taken"
- ✅ Choose a different username
- ✅ Other users might be using that name

**Issue**: Messages not sending
- ✅ Check browser console (F12) for errors
- ✅ Verify backend is still running

## 🎨 Features Overview

| Feature | Status |
|---------|--------|
| Real-time messaging | ✅ |
| Online user list | ✅ |
| User join/leave notifications | ✅ |
| Modern UI | ✅ |
| Responsive design | ✅ |
| Custom animations | ✅ |
| Auto-reconnection | ✅ |

## 📦 What's Included

```
chat-app/
├── Frontend (HTML/CSS/JS)
├── Backend (Express + Socket.IO)
├── Setup scripts (Windows/Mac/Linux)
├── Comprehensive documentation
└── Ready to deploy!
```

## 🔧 Tech Stack

- **Frontend**: Vanilla JS + Socket.IO + Modern CSS
- **Backend**: Node.js + Express + Socket.IO
- **Styling**: CSS3 with gradients and animations
- **Communication**: WebSocket (Socket.IO)

## 📚 Documentation

See **README.md** for:
- Detailed API documentation
- Socket.IO event reference
- Development setup
- Deployment guidelines

## 🎉 You're All Set!

Your ChatSphere chat app is ready to use. Start chatting with friends and family!