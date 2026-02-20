# Google OAuth Setup Instructions

This application uses Google Sign-In for authentication. Follow these steps to set it up:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API for your project

## 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure the OAuth consent screen if prompted:
   - User Type: External (for testing) or Internal (for organization use)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if using External type

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Your app name (e.g., "Esports Tournament Manager")
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain (when deploying)
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain (when deploying)

5. Click **Create** and copy your **Client ID**

## 3. Configure Environment Variables

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Note:** Use the same Client ID for both backend and frontend.

## 4. Update Database Schema

The User model has been updated to support Google authentication. Run database migrations if needed:

```bash
# The google_id column should be added to the users table
# This happens automatically when you start the server with sync enabled
```

## 5. Test the Integration

1. Start the backend server:
   ```bash
   cd esports-tournament-backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd esports-tournament-frontend
   npm run dev
   ```

3. Navigate to `http://localhost:5173/auth`
4. Click the "Sign in with Google" button
5. Complete the Google authentication flow
6. You should be redirected to the dashboard

## Security Notes

- Never commit your `.env` files to version control
- Keep your Client ID secure
- For production, use HTTPS and update the authorized origins/redirect URIs
- Consider implementing additional security measures like CSRF protection

## Troubleshooting

### "Invalid Client" Error
- Verify your Client ID is correct in both `.env` files
- Check that your authorized JavaScript origins include your current domain

### "Redirect URI Mismatch" Error
- Ensure your redirect URIs in Google Console match your application URL exactly

### User Not Created
- Check backend logs for errors
- Verify database connection
- Ensure the `google_id` column exists in the users table
