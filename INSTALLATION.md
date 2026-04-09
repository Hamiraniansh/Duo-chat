# ChatSphere - Installation & Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)

---

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
  - Download: https://nodejs.org/
  - Verify: Run `node --version` in terminal
  
- **npm**: Usually comes with Node.js
  - Verify: Run `npm --version` in terminal
  
- **Git**: Version 2.30 or higher (optional, for cloning)
  - Download: https://git-scm.com/

---

## Installation Steps

### Step 1: Clone or Download the Project

**Using Git:**
```bash
git clone https://github.com/yourusername/ChatSphere.git
cd ChatSphere
```

**Or Download ZIP:**
- Download from GitHub
- Extract the ZIP file
- Open terminal in the extracted folder

### Step 2: Install Frontend Dependencies

The frontend is built with vanilla JavaScript (no dependencies needed).

**Optional**: If you want any build tools, you can add them later.

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- **express**: Web server framework
- **socket.io**: Real-time WebSocket library
- **cors**: Cross-origin resource sharing middleware
- **nodemon** (dev): Auto-restart on file changes

### Step 4: Verify Installation

Check that `node_modules` folder was created in the `backend` directory:

```bash
# Windows
dir backend\node_modules

# macOS/Linux
ls backend/node_modules
```

---

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the `backend` directory for production settings:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

**Default values** (if .env not created):
- PORT: 5000
- HOST: localhost
- NODE_ENV: development

### Frontend Configuration

No configuration needed! The frontend automatically detects:
- **Development**: Uses `http://localhost:5000`
- **Production**: Uses current domain URL

---

## Running the Application

### Development Mode (Local Testing)

#### Terminal 1 - Start Backend Server:
```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:5000
✓ WebSocket connected
```

#### Terminal 2 - Start Frontend:

**Option A: Using Python's built-in server (recommended)**
```bash
# From project root
python -m http.server 8000
# Or Python 3:
python3 -m http.server 8000
```

Open browser: `http://localhost:8000`

**Option B: Using Node.js static server**
```bash
npm install -g http-server
http-server .
```

**Option C: Using VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

### Full Stack Mode

Both frontend and backend run together:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
python -m http.server 8000
```

---

## Testing the Application

### Verify Installation:

1. **Backend is running**:
   - Open browser: `http://localhost:5000`
   - Should see: Plain text or error (expected)

2. **Frontend loads**:
   - Open browser: `http://localhost:8000`
   - Should see: ChatSphere login screen with loader animation

3. **Real-time connection**:
   - Open login screen
   - Check browser console (F12) for: "Socket.IO connected" or "Socket.IO disconnected"

### Test Chat Functionality:

1. Use **two browser windows** or **two browser tabs**
2. **Window 1**: 
   - Username: "Alice"
   - Click "Join Chat"
3. **Window 2**:
   - Username: "Bob"
   - Click "Join Chat"
4. **Window 1**: Send a message
5. **Window 2**: Should receive the message immediately

---

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution**: Backend dependencies not installed
```bash
cd backend
npm install
```

### Issue: "Server failed to start on port 5000"

**Solution 1**: Port already in use
```bash
# Change port in backend/server.js:
// FROM: const PORT = process.env.PORT || 5000;
// TO:   const PORT = process.env.PORT || 5001;
```

**Solution 2**: Kill conflicting process
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: "Socket connection failed"

**Solution 1**: Backend not running
- Check Terminal 1 for "Server running on http://localhost:5000"
- If not running, start it: `npm start` in `backend` folder

**Solution 2**: Wrong URL in code
- Check browser console (F12)
- Look for connection attempt
- Verify `localhost:5000` is accessible

**Solution 3**: Firewall blocking
- Check if firewall allows port 5000
- On Windows: Check Windows Defender Firewall
- On Mac: Check System Preferences > Security & Privacy

### Issue: "Messages not sending"

**Checklist**:
- [ ] Two users logged in (different usernames)
- [ ] Socket.IO shows "connected" in console
- [ ] No errors in console (F12)
- [ ] Message text not empty
- [ ] Message text less than 500 characters

### Issue: "Profile not saving"

**Solution**: Clear localStorage and retry
```javascript
// In browser console (F12):
localStorage.clear();
location.reload();
```

### Issue: "Couple mode not working"

**Requirements**:
- Both users must be online
- Each user must set up couple mode separately
- Partner username must be exact match (case-sensitive)

---

## Production Deployment

### Preparing for Production

1. **Add environment variables** (`.env` file):
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

2. **Update backend URL** in `script.js`:
If deploying to custom domain, update:
```javascript
const socketURL = window.location.origin;
```

3. **Add SSL certificate** for security:
Use HTTPS for production (recommended)

### Deployment Options

#### Option 1: Heroku

1. Install Heroku CLI
2. Create `Procfile` in root:
```
web: node backend/server.js
```

3. Deploy:
```bash
heroku create your-app-name
git push heroku main
```

#### Option 2: Railway

1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

#### Option 3: DigitalOcean

1. Create droplet (Ubuntu 20.04+)
2. Install Node.js: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
3. Clone repository
4. Run: `npm install && npm start`

#### Option 4: AWS/Azure/GCP

Same steps as DigitalOcean, use cloud provider's documentation.

---

## Build for Production

### Create Production Build:

1. **Minify frontend** (optional):
```bash
npm install -g terser
terser script.js -o script.min.js
# Update index.html to use script.min.js
```

2. **Install production dependencies only**:
```bash
cd backend
npm install --production
```

3. **Start server**:
```bash
NODE_ENV=production npm start
```

---

## Additional Resources

- **Socket.IO Documentation**: https://socket.io/docs/
- **Express.js Documentation**: https://expressjs.com/
- **HTML/CSS/JavaScript Guides**: https://developer.mozilla.org/
- **Git Guide**: https://git-scm.com/book/en/v2

---

## Getting Help

If you encounter issues:

1. **Check the console** (F12 in browser):
   - Look for red error messages
   - Copy the error message

2. **Review BUG_FIXES.md** for known issues

3. **Check backend logs**:
   - Terminal running backend should show connection logs

4. **Create an GitHub Issue** with:
   - Error message (full text from console)
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

---

## Next Steps

After successful installation:

1. Read the [README.md](README.md) for features overview
2. Customize the chat (colors, themes, features)
3. Deploy to production
4. Share with friends & family
5. Consider Adding your own features!

---

**Happy Chatting! 💬💖**
