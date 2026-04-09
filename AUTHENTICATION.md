# ChatSphere Authentication System

Complete authentication system with Email/Password signup, OAuth2 (Google, Facebook, GitHub, Instagram), and SSO support.

## Features

✅ **Email/Password Authentication**
- Secure signup with password validation
- bcryptjs password hashing
- Local login with credentials
- Password strength requirements

✅ **OAuth 2.0 Social Login**
- Google Login
- Facebook Login  
- GitHub Login
- Instagram Login

✅ **Enterprise SSO**
- SAML-based single sign-on
- Company email authentication
- Custom provider support

✅ **Security**
- JWT token-based authentication
- Secure session management
- CORS protection
- Input validation
- Password hashing with bcryptjs

✅ **User Profiles**
- Automatic profile creation from OAuth
- Profile customization
- Avatar generation from provider
- Bio and status management

---

## Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
```

Edit `.env` with your OAuth credentials (see [OAUTH_SETUP.md](./OAUTH_SETUP.md))

### 3. Start Backend Server
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 4. Open Frontend
```bash
# In browser, navigate to your frontend URL
http://localhost:3000  # if using a dev server
# or simply open index.html
```

---

## Authentication Methods

### Method 1: Email/Password Signup
1. Click "Email" tab on login page
2. Click "Create Account"
3. Enter username (3-20 characters)
4. Enter email address
5. Create password (min 6 characters)
6. Click "Create Account"
7. Log in with your credentials

### Method 2: Social Login
1. Click "Social" tab on login page
2. Click any provider (Google, Facebook, GitHub, Instagram)
3. Authorize the application on provider's site
4. You'll be automatically logged in and redirected

### Method 3: Enterprise SSO
1. Click "Social" tab
2. Scroll to "Enterprise SSO"
3. Enter your company email
4. Click "Continue with SSO"
5. Log in through your company's identity provider

### Method 4: Guest Login
1. Click "Guest" or "Lover" button
2. Instant login without authentication
3. No account needed

---

## File Structure

```
backend/
├── server.js              # Main server with OAuth setup
├── users.json            # User database
├── package.json          # Dependencies
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
└── OAUTH_SETUP.md        # OAuth configuration guide

frontend/
├── index.html            # Main HTML with auth forms
├── style.css             # Styles including auth UI
├── script.js             # Auth logic and handlers
└── README.md             # Frontend documentation
```

---

## API Reference

### Authentication Endpoints

#### Signup
**POST** `/api/signup`
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```
Response: `{ message: "Account created successfully", username: "john_doe" }`

#### Login
**POST** `/api/login`
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```
Response:
```json
{
  "message": "Login successful",
  "username": "john_doe",
  "profile": { ... }
}
```

#### Verify Token
**POST** `/api/auth/verify-token`
```json
{
  "token": "eyJhbGc..."
}
```
Response:
```json
{
  "valid": true,
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "profile": { ... }
  }
}
```

#### Get Current User
**GET** `/api/auth/me`
Headers: `Authorization: Bearer {token}`
Response:
```json
{
  "user": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "provider": "local",
    "profile": { ... }
  }
}
```

#### Logout
**POST** `/api/auth/logout`
Response: `{ message: "Logged out successfully" }`

#### OAuth Redirects
- **GET** `/api/auth/google` - Google OAuth
- **GET** `/api/auth/facebook` - Facebook OAuth
- **GET** `/api/auth/github` - GitHub OAuth
- **GET** `/api/auth/instagram` - Instagram OAuth
- **POST** `/api/auth/sso` - Enterprise SSO

---

## Configuration

### Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development
SESSION_SECRET=random-secret-string
JWT_SECRET=random-jwt-secret-string

# Google
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Facebook
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret

# GitHub
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# Instagram
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
```

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed setup instructions.

---

## Security Features

1. **Password Hashing**
   - bcryptjs with salt rounds: 10
   - Passwords never stored in plain text

2. **JWT Tokens**
   - 7-day expiration
   - Signed with JWT_SECRET
   - Used for API authentication

3. **Session Management**
   - Secure session cookies
   - HTTPS recommended in production
   - Session timeout: 24 hours

4. **Input Validation**
   - Username: 3-20 chars, alphanumeric + hyphen/underscore
   - Password: Minimum 6 characters
   - Email: Standard email format

5. **CORS Protection**
   - Configured for all origins (customizable)
   - Credentials support for OAuth

---

## User Data Structure

### User Object
```json
{
  "id": "1616161616",
  "username": "john_doe",
  "email": "john@example.com",
  "provider": "google|facebook|github|instagram|local",
  "providerId": "oauth_provider_id",
  "password": "$2a$10$... (hashed)", // Only for local auth
  "createdAt": "2024-01-15T10:30:00Z",
  "profile": {
    "displayName": "John Doe",
    "avatar": "👤",
    "bio": "ChatSphere user",
    "status": "online",
    "streak": 0,
    "color": "#667eea"
  }
}
```

---

##Frontend Authentication Flow

### Signup Flow
```
User Input → Validation → API Call → Response → Switch to Login
```

### Login Flow
```
User Input → Validation → API Call → Token Storage → Chat Join
```

### OAuth Flow
```
Click Button → Redirect to Provider → User Authorizes → Callback → Token → Join Chat
```

### SSO Flow
```
Enter Email → API Call → SSO Handler → Token → Join Chat
```

---

## Troubleshooting

### Signup Issues
- **"Username already taken"** - Choose a different username
- **"Password too short"** - Set minimum 6 characters
- **"Invalid characters"** - Username must be alphanumeric + hyphen/underscore

### Login Issues
- **"Invalid username or password"** - Check credentials
- **"Server error"** - Verify backend is running on port 5000

### OAuth Issues
- **"Redirect URI mismatch"** - Update in OAuth provider settings
- **"Invalid Client ID"** - Check .env credentials
- See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed troubleshooting

### Token Issues
- **"Token expired"** - Log in again
- **"Invalid token"** - Clear localStorage and try again

---

## Development vs Production

### Development
```bash
npm run dev  # Uses nodemon for auto-restart
NODE_ENV=development
Secure cookies disabled
CORS open to all origins
```

### Production
```bash
npm start
NODE_ENV=production
Set secure: true in session config
Use HTTPS only
Restrict CORS origins
Use strong secrets
```

---

## Best Practices

1. **Never commit .env** - Included in .gitignore
2. **Use strong secrets** - Generate 32+ character random strings
3. **Update dependencies** - Run `npm audit` regularly
4. **Monitor logs** - Check for failed login attempts
5. **Implement rate limiting** - Add express-rate-limit in production
6. **Use HTTPS** - Required for production

---

## Architecture

```
Authentication Flow
├── Email/Password
│   ├── Signup (POST /api/signup)
│   ├── Hash password (bcryptjs)
│   ├── Store user (users.json)
│   └── Login (POST /api/login)
│
├── OAuth 2.0
│   ├── Google (GET /api/auth/google)
│   ├── Facebook (GET /api/auth/facebook)
│   ├── GitHub (GET /api/auth/github)
│   ├── Instagram (GET /api/auth/instagram)
│   └── Callback → User creation/update
│
└── Enterprise SSO
    ├── Email submission (POST /api/auth/sso)
    ├── Provider validation
    └── User creation/update
```

---

## Support & Resources

- [Passport.js Docs](http://www.passportjs.org/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [JWT.io](https://jwt.io/)

---

## License

This authentication system is part of ChatSphere. See main project LICENSE file.
