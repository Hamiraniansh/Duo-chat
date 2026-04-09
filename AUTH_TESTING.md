# Authentication Testing Guide

Complete testing procedures for all authentication methods in ChatSphere.

## Prerequisites

- Backend running: `npm run dev` in `/backend` directory
- Frontend accessible in browser
- OAuth credentials configured in `.env` (for social login testing)

---

## Test 1: Email/Password Signup

### Setup
1. Go to frontend (e.g., `http://localhost:3000`)
2. Click "Email" tab

### Test Steps
1. **Verify form displays**
   - Username input visible
   - Email input visible
   - Password inputs visible
   - "Create Account" button visible

2. **Test with valid data**
   - Username: `testuser_001`
   - Email: `test@example.com`
   - Password: `SecurePass123`
   - Confirm Password: `SecurePass123`
   - Click "Create Account"
   - Expected: "Account created successfully!" message
   - Check localStorage for stored token

3. **Test duplicate username**
   - Try to sign up with `testuser_001` again
   - Expected: "Username already taken" error

4. **Test password mismatch**
   - Try signup with mismatched passwords
   - Expected: "Passwords do not match" alert

5. **Test weak password**
   - Try password: `short`
   - Expected: Error or validation message

### Success Criteria
✓ New user can be created
✓ Duplicate prevention works
✓ Password validation works
✓ Token is stored after successful signup

---

## Test 2: Email/Password Login

### Setup
1. Go to frontend
2. Click "Email" tab
3. Click "Already have an account? Log in"

### Test Steps
1. **Login with valid credentials**
   - Username: `testuser_001`
   - Password: `SecurePass123`
   - Click "Log In"
   - Expected: Redirected to chat screen

2. **Verify user data loaded**
   - Check console for user profile
   - Verify username displays in chat
   - Check localStorage for authToken

3. **Test with invalid password**
   - Username: `testuser_001`
   - Password: `WrongPassword`
   - Click "Log In"
   - Expected: "Invalid username or password" error

4. **Test with non-existent user**
   - Username: `nonexistent_user`
   - Password: `AnyPassword123`
   - Click "Log In"
   - Expected: "Invalid username or password" error

5. **Test empty fields**
   - Leave username or password empty
   - Click "Log In"
   - Expected: "Please enter username and password" alert

### Success Criteria
✓ Valid users can log in
✓ Invalid credentials rejected
✓ User profile loaded after login
✓ Chat screen displays
✓ Token stored in localStorage

---

## Test 3: Guest Login

### Setup
1. Go to frontend
2. Look for guest login buttons

### Test Steps
1. **Test Guest button**
   - Click "Guest" button
   - Expected: Logged in as `Guest_XXXX`
   - Chat screen displays immediately

2. **Test Lover button**
   - Click "Lover" button
   - Expected: Logged in as `Lover_XXXX`
   - Chat screen displays immediately

3. **Verify guest features**
   - Can send and receive messages
   - Can use couple features
   - No profile authentication needed

### Success Criteria
✓ Guest login works instantly
✓ Random username generated
✓ Chat functions available
✓ No authentication prompt

---

## Test 4: Google OAuth Login

### Prerequisites
- Google OAuth credentials in `.env`:
  ```
  GOOGLE_CLIENT_ID=xxx...
  GOOGLE_CLIENT_SECRET=xxx...
  ```
- Backend restarted after .env update

### Test Steps
1. **Click Google button**
   - Click "Google" in Social tab
   - Expected: Redirected to Google login page

2. **Authorize application**
   - Log in with Google account if needed
   - Click "Allow" on permissions screen
   - Expected: Redirected back to app

3. **Verify login successful**
   - Check chat screen displays
   - Verify username matches Google email
   - Check profile avatar from Google

4. **Verify token stored**
   - Open browser console
   - Check localStorage has `authToken`
   - Check `authProvider` set to "google"

5. **Leave and rejoin**
   - Click "Leave Chat"
   - Refresh page
   - Complete OAuth again
   - Should rejoin successfully

### Success Criteria
✓ Google login flow works
✓ User created with Google data
✓ Profile populated from Google
✓ Token stored correctly
✓ Can rejoin after refresh

---

## Test 5: Facebook OAuth Login

### Prerequisites
- Facebook OAuth credentials in `.env`:
  ```
  FACEBOOK_APP_ID=xxx...
  FACEBOOK_APP_SECRET=xxx...
  ```
- Redirect URI added to Facebook app settings
- Backend restarted after .env update

### Test Steps
1. **Click Facebook button**
   - Click "Facebook" in Social tab
   - Expected: Redirected to Facebook login

2. **Authorize application**
   - Log in with Facebook if needed
   - Grant email and profile permissions
   - Expected: Redirected back to app

3. **Verify successful login**
   - Chat screen displays
   - Username from Facebook email
   - Avatar from Facebook profile

4. **Check stored data**
   - Open DevTools > Storage > LocalStorage
   - Verify `authToken` present
   - Verify `authProvider` = "facebook"

### Success Criteria
✓ Facebook OAuth flow works
✓ User created with Facebook data
✓ Permissions requested correctly
✓ Profile data synced
✓ Can use chat immediately

---

## Test 6: GitHub OAuth Login

### Prerequisites
- GitHub OAuth credentials in `.env`:
  ```
  GITHUB_CLIENT_ID=xxx...
  GITHUB_CLIENT_SECRET=xxx...
  ```
- Backend restarted

### Test Steps
1. **Click GitHub button**
   - Click "GitHub" in Social tab
   - Expected: Redirected to GitHub

2. **Authorize application**
   - Log in to GitHub if needed
   - Click "Authorize" on app authorization page
   - Expected: Redirected back to app

3. **Verify GitHub data**
   - Username should be GitHub username
   - Avatar from GitHub profile
   - Bio from GitHub profile if available

4. **Verify storage**
   - Check `authProvider` = "github"
   - Verify token stored

### Success Criteria
✓ GitHub OAuth works
✓ Username from GitHub
✓ Profile data loaded
✓ Avatar correctly displayed

---

## Test 7: Instagram OAuth Login

### Prerequisites
- Instagram OAuth credentials in `.env`:
  ```
  INSTAGRAM_APP_ID=xxx...
  INSTAGRAM_APP_SECRET=xxx...
  ```
- App approved by Instagram (or test mode)
- Backend restarted

### Test Steps
1. **Click Instagram button**
   - Click "Instagram" in Social tab
   - Expected: Redirected to Instagram

2. **Authorize application**
   - Log in if needed
   - Grant profile access
   - Expected: Redirected back

3. **Verify login**
   - Username from Instagram
   - Profile avatar from Instagram
   - Bio from Instagram profile

### Success Criteria
✓ Instagram OAuth works
✓ User created correctly
✓ Profile data synced

---

## Test 8: Enterprise SSO

### Setup
1. Go to frontend
2. Click "Social" tab
3. Scroll to "Enterprise SSO" section

### Test Steps
1. **Enter company email**
   - Email: `user@company.com`
   - Click "Continue with SSO"
   - Expected: SSO handler processes email

2. **Verify SSO flow**
   - Should create/find user with company email
   - User profile created
   - Chat screen displays

3. **Check stored data**
   - `authProvider` = "sso"
   - Username from email prefix
   - Profile initialized

### Success Criteria
✓ SSO endpoint called correctly
✓ User created with email
✓ Chat accessible after SSO

---

## Test 9: Tab Switching

### Test Steps
1. **Switch between Email and Social tabs**
   - Click "Email" tab
   - Verify signup/login forms show
   - Click "Social" tab
   - Verify social buttons show
   - Click "Email" again
   - Previous form state preserved

2. **Toggle between Signup/Login**
   - In Email tab, click "Already have account?"
   - Login form shows
   - Click "Don't have account?"
   - Signup form shows

### Success Criteria
✓ Tab switching works smoothly
✓ Forms switch correctly
✓ No console errors

---

## Test 10: Token Verification

### Test Steps
1. **Verify JWT token**
   - After login, check localStorage
   - Copy the `authToken` value
   - Decode it on [jwt.io](https://jwt.io)
   - Should contain user ID and username

2. **Test token verification**
   - Call API: `POST /api/auth/verify-token`
   - Body: `{ "token": "token-value" }`
   - Expected: 200 response with user data

3. **Test expired token**
   - Wait 7 days (or manually set old date in localStorage)
   - Try to verify token
   - Expected: 401 Unauthorized response

### Success Criteria
✓ Token structure valid
✓ Token verification works
✓ Expiry enforced

---

## Test 11: Data Persistence

### Test Steps
1. **Sign up and check users.json**
   - Sign up new user
   - Check `/backend/users.json`
   - New user entry should exist

2. **Verify profile saved**
   - Check user object has profile data
   - Verify hashed password field
   - Check createdAt timestamp

3. **Refresh and re-login**
   - Close browser/clear cache
   - Log in again
   - User data should load successfully

### Success Criteria
✓ Users persisted to database
✓ Passwords properly hashed
✓ Data survives app restart

---

## Test 12: Error Handling

### Test Steps
1. **Stop backend server**
   - Stop `npm run dev`
   - Try to log in
   - Expected: Connection/network error

2. **Resume backend**
   - Start server again
   - Try login
   - Should work normally

3. **Test with invalid JSON in OAuth**
   - Manually craft bad OAuth request
   - Expected: Graceful error handling

### Success Criteria
✓ Errors handled gracefully
✓ User friendly error messages
✓ No console crashes

---

## Performance Tests

### Test Steps
1. **Multiple rapid logins**
   - Sign up 5 users quickly
   - Log in/out rapidly
   - Expected: Smooth performance

2. **Large user database**
   - Manually add 1000 users to users.json
   - Try to log in
   - Expected: Reasonable response time

3. **Token validation under load**
   - Call /api/auth/verify-token 100 times rapidly
   - Expected: No crashes, consistent responses

### Success Criteria
✓ System handles load
✓ Response times acceptable
✓ No memory leaks

---

## Security Tests

### Test Steps
1. **SQL Injection attempt**
   - Try username: `admin' --`
   - Expected: Treated as literal username

2. **Password in logs**
   - Check console logs
   - Password should NOT appear in logs
   - Only user ID/username should log

3. **CORS validation**
   - Try API call from different origin
   - Should work or be properly restricted

4. **Token tampering**
   - Modify token in localStorage
   - Try API call with bad token
   - Expected: 401 Unauthorized

### Success Criteria
✓ No SQL injection vulnerability
✓ Passwords not logged
✓ CORS working correctly
✓ Token validation strict

---

## Checklist Summary

### Authentication Methods
- [ ] Email/Password Signup
- [ ] Email/Password Login
- [ ] Guest Login
- [ ] Google OAuth
- [ ] Facebook OAuth
- [ ] GitHub OAuth
- [ ] Instagram OAuth
- [ ] Enterprise SSO

### Features
- [ ] Token generation and storage
- [ ] User profile creation
- [ ] Tab switching
- [ ] Form validation
- [ ] Error handling
- [ ] Data persistence
- [ ] Session management

### Security
- [ ] Passwords hashed (bcryptjs)
- [ ] JWT tokens validated
- [ ] Input sanitized
- [ ] CORS configured
- [ ] Secure session cookies

### Performance
- [ ] Fast login/signup
- [ ] Responsive UI
- [ ] No memory leaks
- [ ] Scaling to multiple users

---

## Reporting Issues

If you find any issues:
1. Note the exact steps to reproduce
2. Include error messages from console
3. Check .env configuration
4. Verify backend is running
5. Review AUTHENTICATION.md and OAUTH_SETUP.md
6. Check that all dependencies are installed
