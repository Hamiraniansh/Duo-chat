# ChatSphere - Deployment Guide

Complete guide to deploy ChatSphere to production environments.

---

## Quick Start - Local Testing

Before deploying to production, test locally first.

### Prerequisites
- Node.js 18+
- Backend: `cd backend && npm install`

### Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend (Python server):**
```bash
python -m http.server 8000
```

Open: `http://localhost:8000`

Test with two browser windows/tabs to verify chat works.

---

## Production Deployment Checklist

- [ ] All bugs fixed (see BUG_FIXES.md)
- [ ] Environment variables configured
- [ ] HTTPS certificate obtained
- [ ] Domain name ready
- [ ] Database/Hosting provider selected
- [ ] Backups configured (if applicable)
- [ ] Error logging setup
- [ ] Performance monitoring ready

---

## Option 1: Heroku Deployment (EASIEST)

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli

### Step 1: Prepare Project

Create file: `Procfile` in project root:
```
web: node backend/server.js
```

Create file: `backend/package-lock.json` (if not exists):
```bash
cd backend
npm install  # Creates package-lock.json
```

### Step 2: Create Heroku App

```bash
heroku login
heroku create your-chatsphere-app
```

### Step 3: Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
```

### Step 4: Deploy

```bash
# Make sure you're in project root
git init
git add .
git commit -m "Initial ChatSphere deployment"
git push heroku main  # or 'master' if using older git
```

### Step 5: Test Production

```bash
heroku open
```

Should open your deployed ChatSphere app!

### Monitoring & Logs

```bash
# View logs
heroku logs -t

# View app info
heroku info

# Restart app
heroku restart
```

---

## Option 2: Railway Deployment

### Step 1: Create Account
- Go to: https://railway.app/
- Sign up with GitHub

### Step 2: Connect Repository

1. New Project → Import Git Repository
2. Select your ChatSphere repo
3. Click Import

### Step 3: Configure

Railway should auto-detect Node.js.

Add environment variables:
- `NODE_ENV` = `production`
- `PORT` = `5000`

### Step 4: Deploy

Click "Deploy" - Railway handles everything automatically!

### Monitoring

- View logs in Railway dashboard
- Automatic deployment on git push

---

## Option 3: DigitalOcean Deployment

### Step 1: Create Droplet

1. Login to DigitalOcean
2. Create → Droplets
3. Choose: Ubuntu 22.04 LTS
4. Choose: $6/month plan (adequate)
5. Select region closest to users
6. Create

### Step 2: Connect to Droplet

```bash
ssh root@your_droplet_ip
```

### Step 3: Install Dependencies

```bash
# Update system
apt-get update && apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Verify
node --version
npm --version
```

### Step 4: Deploy Code

```bash
# Clone repository (if public)
git clone https://github.com/yourusername/ChatSphere.git
cd ChatSphere

# Install backend dependencies
cd backend
npm install

cd ..

# Install frontend static server
npm install -g serve
```

### Step 5: Start Application

```bash
# Terminal 1: Start backend with PM2
cd ChatSphere/backend
pm2 start server.js --name "chatsphere-api"

# Terminal 2: Serve frontend
cd ChatSphere
serve -l 3000

# OR use nginx (see below)
```

### Step 6: Setup Nginx (Recommended)

```bash
apt-get install -y nginx

# Create nginx config
cat > /etc/nginx/sites-available/chatsphere << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /root/ChatSphere;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {
        proxy_pass http://localhost:5000;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/chatsphere /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Start nginx
systemctl start nginx
```

### Step 7: Setup HTTPS (Let's Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx

certbot --nginx -d your-domain.com

# Auto-renew
certbot renew --dry-run
```

### Logs & Monitoring

```bash
# View PM2 logs
pm2 logs

# View nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart chatsphere-api
systemctl restart nginx
```

---

## Option 4: AWS EC2 Deployment

### Step 1: Launch EC2 Instance

1. AWS Console → EC2
2. Launch Instance
3. Choose: Ubuntu Server 22.04 LTS
4. Instance type: t3.micro (free tier)
5. Configure security group:
   - SSH (Port 22): Your IP
   - HTTP (Port 80): 0.0.0.0/0
   - HTTPS (Port 443): 0.0.0.0/0
   - Custom TCP (5000): 0.0.0.0/0 (for direct backend)

### Step 2: Connect

```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Steps 3-7: Same as DigitalOcean above

---

## Option 5: Vercel Deployment

### Step 1: Setup Backend (Cannot use Vercel)

Consider Railway or Heroku for backend.

### Step 2: Deploy Frontend to Vercel

```bash
npm install -g vercel
vercel
```

### Step 3: Configure Backend URL

In `script.js`, update:
```javascript
const socketURL = 'https://your-backend-deployed.herokuapp.app';
```

---

## Custom Domain Setup

### For Heroku:
```bash
heroku domains:add www.your-domain.com
```

### For DigitalOcean:
1. Update DNS records at registrar:
   - Point A record to your droplet IP
   - Point www CNAME to your domain

2. Update nginx config with domain name

### For AWS:
1. Register domain (Route 53 or external)
2. Create Elastic IP for consistency
3. Update DNS records to point to Elastic IP

---

## Monitoring & Maintenance

### Essential Monitoring

```bash
# CPU/Memory usage
top

# Disk space
df -h

# Logs for errors
# Backend logs:
pm2 logs

# Frontend logs
tail -f /var/log/nginx/error.log
```

### Automated Backups

For production systems, implement:

1. **Message Backups**: Save messageHistory to database
2. **User Profile Backups**: Regular export to JSON/CSV
3. **Server Backups**: Weekly snapshots (DigitalOcean/AWS)

### Health Checks

Add monitoring service:

```javascript
// In backend/server.js
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        users: connectedUsers.size,
        messages: messageHistory.length
    });
});
```

Access: `https://your-domain.com/api/health`

---

## Environment Variables Reference

### Frontend (.js file)
```javascript
// Auto-detected from window.location
const socketURL = isDevelopment 
    ? 'http://localhost:5000' 
    : window.location.origin;
```

### Backend (.env file)
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

---

## Troubleshooting Deployment

### Socket.IO Not Connecting

**Check**:
1. Backend running? `curl http://localhost:5000/api/health`
2. Firewall allows port 5000?
3. URL in code correct?

**Fix**:
```bash
# Check port is listening
netstat -tlnp | grep 5000

# Check backend logs
pm2 logs chatsphere-api
```

### CORS Errors

**Fix in backend/server.js**:
```javascript
const io = socketIO(server, {
    cors: {
        origin: "https://your-domain.com",
        methods: ["GET", "POST"]
    }
});
```

### High Memory Usage

**Solution**:
1. Check messageHistory size (max 100 messages)
2. Add memory limits to Node.js: `node --max-old-space-size=2048`
3. Restart service: `pm2 restart all`

### High CPU Usage

**Check**:
1. Too many simultaneous connections?
2. Infinite loops in code?
3. Database queries too slow?

---

## Performance Optimization

### Frontend
- Minify JavaScript: `terser script.js -o script.min.js`
- Minify CSS: `cleancss style.css -o style.min.css`
- Enable compression in nginx

### Backend
- Add caching for user lists
- Implement message pagination
- Use Redis for session management (advanced)

### Infrastructure
- Use CDN for static files (Cloudflare)
- Enable gzip compression
- Use load balancer for multiple instances

---

## Security Checklist

- [ ] Use HTTPS only (Let's Encrypt)
- [ ] Set secure headers (CORS properly configured)
- [ ] Validate all inputs (server-side)
- [ ] Sanitize messages to prevent XSS
- [ ] Don't expose sensitive data in logs
- [ ] Use environment variables for secrets
- [ ] Regular security updates for OS/Node.js
- [ ] Implement rate limiting if needed
- [ ] Monitor for unusual activity

---

## Support & Issues

- Backend crashes? Check: `pm2 logs`
- Socket errors? Check browser console (F12)
- Performance issues? Check: `top` command
- Deployment stuck? Check: Platform-specific docs

---

**Your ChatSphere is now live! 🚀💬**

Monitor the logs, stay secure, and happy chatting!
