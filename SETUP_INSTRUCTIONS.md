# Esports Tournament Manager - Google Sign-In Setup

## ✅ Changes Made

The application has been updated to use **Google Sign-In only** for authentication. Traditional email/password login and signup pages have been removed.

### Backend Changes:
- ✅ Installed `google-auth-library` package
- ✅ Updated User model to support Google OAuth (added `googleId` field, made `password` nullable)
- ✅ Added `googleSignIn` endpoint in auth controller
- ✅ Added Google OAuth configuration
- ✅ Updated auth routes to include `/auth/google-signin`

### Frontend Changes:
- ✅ Installed `@react-oauth/google` package
- ✅ Created new `GoogleSignInPage` component
- ✅ Updated `AuthContext` to support Google Sign-In
- ✅ Removed traditional `LoginPage` and `SignupPage`
- ✅ Updated routing to use `/auth` for Google Sign-In
- ✅ Updated Navbar to show "Sign In with Google" button
- ✅ Wrapped app with `GoogleOAuthProvider`

---

## 🚀 How to Run the Application

### Prerequisites:
1. **Docker Desktop** - Must be running (for Redis and PostgreSQL)
2. **Node.js** - Installed on your system
3. **Google OAuth Client ID** - See setup instructions below

### Step 1: Start Docker Desktop
**IMPORTANT:** Start Docker Desktop first to ensure Redis and PostgreSQL containers are running.

### Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure OAuth consent screen (if needed)
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:3001`
   - Authorized redirect URIs: `http://localhost:3001`
7. Copy your **Client ID**

### Step 3: Update Environment Variables

#### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

#### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
```

**Note:** Replace `your_actual_google_client_id_here` with your actual Google Client ID from Step 2.

### Step 4: Run Database Migration (First Time Only)

If this is your first time running with Google OAuth, run the migration:

```bash
# Connect to your PostgreSQL database and run:
psql -U postgres -d tournament_db -f esports-tournament-backend/migrations/add_google_oauth.sql
```

Or the migration will happen automatically when the backend starts (if using Sequelize sync).

### Step 5: Start Backend Server

```bash
cd esports-tournament-backend
npm run dev
```

Backend will start on: `http://localhost:3000`

### Step 6: Start Frontend Server

```bash
cd esports-tournament-frontend
npm run dev
```

Frontend will start on: `http://localhost:3001` (or the port shown in terminal)

---

## 🎮 Using the Application

1. Open your browser and go to the frontend URL (e.g., `http://localhost:3001`)
2. Click on **"Sign In with Google"** button in the navbar
3. You'll be redirected to `/auth` page
4. Click the Google Sign-In button
5. Complete Google authentication
6. You'll be redirected to `/dashboard` automatically

---

## 📁 File Structure Changes

### New Files:
- `esports-tournament-backend/src/config/google.js` - Google OAuth config
- `esports-tournament-backend/migrations/add_google_oauth.sql` - Database migration
- `esports-tournament-frontend/src/pages/GoogleSignInPage.jsx` - Google Sign-In page
- `GOOGLE_OAUTH_SETUP.md` - Detailed OAuth setup guide
- `SETUP_INSTRUCTIONS.md` - This file

### Modified Files:
- `esports-tournament-backend/src/models/User.js` - Added googleId field
- `esports-tournament-backend/src/controllers/authController.js` - Added googleSignIn function
- `esports-tournament-backend/src/routes/authRoutes.js` - Added Google Sign-In route
- `esports-tournament-backend/.env` - Added GOOGLE_CLIENT_ID
- `esports-tournament-frontend/src/App.jsx` - Updated routes
- `esports-tournament-frontend/src/main.jsx` - Added GoogleOAuthProvider
- `esports-tournament-frontend/src/contexts/AuthContext.jsx` - Added googleLogin function
- `esports-tournament-frontend/src/api/auth.js` - Added googleSignIn API call
- `esports-tournament-frontend/src/components/common/Navbar.jsx` - Updated auth buttons
- `esports-tournament-frontend/src/components/auth/ProtectedRoute.jsx` - Updated redirect
- `esports-tournament-frontend/src/api/client.js` - Updated redirect path
- `esports-tournament-frontend/.env` - Added VITE_GOOGLE_CLIENT_ID

### Removed (No longer used):
- Traditional login/signup forms still exist in files but are not used in routing
- `/auth/login` and `/auth/signup` routes removed

---

## 🔧 Troubleshooting

### "Invalid Client" Error
- Verify your Google Client ID is correct in both `.env` files
- Ensure authorized JavaScript origins include your frontend URL

### "Redirect URI Mismatch" Error
- Check that authorized redirect URIs in Google Console match your frontend URL exactly

### Backend Won't Start
- Ensure Docker Desktop is running
- Check that PostgreSQL and Redis containers are running
- Verify database credentials in `.env`

### Frontend Won't Start
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that `VITE_GOOGLE_CLIENT_ID` is set in `.env`

### User Not Created After Sign-In
- Check backend logs for errors
- Verify database migration ran successfully
- Ensure `google_id` column exists in users table

---

## 📝 Important Notes

1. **Same Client ID**: Use the same Google Client ID for both backend and frontend
2. **Environment Variables**: Never commit `.env` files to version control
3. **HTTPS in Production**: For production, use HTTPS and update authorized origins
4. **Docker First**: Always start Docker Desktop before running backend/frontend
5. **Port Configuration**: Backend runs on port 3000, frontend typically on 3001

---

## 🔐 Security Considerations

- Google handles password security
- JWT tokens are used for session management
- Tokens expire after 7 days (configurable in `.env`)
- Users can only sign in with Google - no password-based auth
- Existing users with email/password can link their Google account

---

## 📚 Additional Resources

- See `GOOGLE_OAUTH_SETUP.md` for detailed Google OAuth setup
- Check backend logs for API errors
- Check browser console for frontend errors
