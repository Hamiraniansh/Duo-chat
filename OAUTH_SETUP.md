# ChatSphere Authentication Setup Guide

This guide explains how to set up OAuth authentication for ChatSphere with Google, Facebook, GitHub, Instagram, and SSO.

## Prerequisites

- Node.js and npm installed
- Backend server running on port 5000
- Frontend running on your domain

## Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

Edit `.env` and fill in your OAuth credentials.

---

## OAuth Provider Setup Instructions

### 1. Google OAuth Setup

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set Authorized redirect URI to: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret

**In `.env`:**
```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

### 2. Facebook OAuth Setup

**Steps:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. In Settings > Basic, copy App ID and App Secret
5. In Settings > Basic, set App Domains to your domain
6. In Facebook Login > Settings, set Valid OAuth Redirect URIs to: `http://localhost:5000/api/auth/facebook/callback`

**In `.env`:**
```
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

---

### 3. GitHub OAuth Setup

**Steps:**
1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in Application name
4. Set Authorization callback URL to: `http://localhost:5000/api/auth/github/callback`
5. Copy Client ID and Client Secret

**In `.env`:**
```
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
```

---

### 4. Instagram OAuth Setup

**Steps:**
1. Go to [Instagram Graph API](https://www.instagram.com/graph/instagram-basic-display/)
2. Create an app in Meta for Developers
3. Set up Instagram Basic Display
4. Configure Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/instagram/callback`
5. Copy App ID and App Secret

**Note:** Instagram requires specific app review. For testing, create a test app.

**In `.env`:**
```
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
```

---

### 5. SSO (SAML) Setup (Optional)

For enterprise SSO with SAML:

1. Configure your SAML Identity Provider
2. Set up the following endpoints:
   - Single Sign-On URL: `http://your-domain/api/auth/sso`
   - Audience URI: `chatsphere`

**In `.env`:**
```
SAML_ENTRY_POINT=your-sso-entry-point
SAML_ISSUER=your-issuer
SAML_CERTIFICATE=path-to-certificate
```

---

## Environment Variables Explained

```
# Server Configuration
PORT=5000                           # Server port
NODE_ENV=development               # development or production
SESSION_SECRET=your-secret          # Random secret for sessions
JWT_SECRET=your-jwt-secret         # Random secret for JWT tokens

# OAuth Credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...

# SAML/SSO (Optional)
SAML_ENTRY_POINT=...
SAML_ISSUER=...
SAML_CERTIFICATE=...
```

---

## Development vs Production

### Development
```
NODE_ENV=development
Secure cookies: false (HTTPS not required)
Session timeout: 24 hours
```

### Production
1. Use HTTPS
2. Set `secure: true` in session config
3. Increase SESSION_SECRET entropy
4. Use strong JWT_SECRET
5. Update OAuth redirect URIs to your production domain

---

## Testing Authentication

### 1. Email/Password Signup & Login
- Go to the app
- Click "Email" tab
- Sign up with username/password
- Log in with credentials

### 2. Social Login
- Click "Social" tab
- Click any provider button
- Authorize the application
- You'll be redirected back and logged in

### 3. Guest Login
- Click "Guest" or "Lover" button
- Instant login without authentication

---

## API Endpoints

### Authentication

**POST /api/signup**
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**POST /api/login**
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**POST /api/auth/sso**
```json
{
  "email": "user@company.com",
  "provider": "sso",
  "providerId": "unique-id"
}
```

**POST /api/auth/verify-token**
```json
{
  "token": "jwt-token"
}
```

**GET /api/auth/google**
- Redirects to Google OAuth login

**GET /api/auth/facebook**
- Redirects to Facebook OAuth login

**GET /api/auth/github**
- Redirects to GitHub OAuth login

**GET /api/auth/instagram**
- Redirects to Instagram OAuth login

**GET /api/auth/me**
- Returns current authenticated user

**POST /api/auth/logout**
- Logs out the current user

---

## Troubleshooting

### "Redirect URI mismatch"
- Ensure redirect URIs match exactly in provider settings
- Check for trailing slashes
- Verify protocol (http vs https)

### "Invalid Client ID"
- Double-check credentials in .env
- Ensure .env file exists and is loaded
- Restart server after updating .env

### Token Expired
- Tokens are set to 7-day expiry
- User will need to log in again
- Consider implementing refresh tokens for production

### Social login not working
- Verify application is not in review (Facebook, Instagram)
- Check user permissions are granted
- Ensure email from provider is accessible

---

## Security Considerations

1. **Never commit .env file** - Already in .gitignore
2. **Use strong secrets** - Generate random strings
3. **Use HTTPS in production** - Required for secure cookies
4. **Validate all inputs** - Handled by Passport strategies
5. **Implement rate limiting** - Consider adding express-rate-limit
6. **Update dependencies** - Regularly run `npm audit`

---

## Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [OAuth 2.0 Flow](https://auth0.com/intro-to-iam/oauth-2-0)
- [Express.js Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Support

For issues or questions, refer to:
- Provider's developer documentation
- Passport.js GitHub repositories
- ChatSphere documentation
