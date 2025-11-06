# Auth0 Integration - Final Setup Steps

Your Auth0 integration is almost complete! Follow these final steps to get everything working.

## 1. Configure Auth0 Application Settings

Go to your Auth0 Dashboard → Applications → Your Application and update these settings:

### Allowed Callback URLs
Add both of these URLs:
```
http://localhost:5173/callback
http://localhost:5173
```

### Allowed Logout URLs
```
http://localhost:5173
```

### Allowed Web Origins
```
http://localhost:5173
```

### Allowed Origins (CORS)
```
http://localhost:5173
http://localhost:3001
```

Click **Save Changes** at the bottom.

## 2. Create Auth0 API (If You Haven't Already)

1. Go to Auth0 Dashboard → Applications → **APIs**
2. Click **Create API**
3. Fill in:
   - **Name**: `Commie API`
   - **Identifier**: `https://commie-api` (must match exactly)
   - **Signing Algorithm**: RS256
4. Click **Create**

## 3. Start Your Application

### Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend:
```bash
npm run dev
```

## 4. Test the Integration

1. Open http://localhost:5173 in your browser
2. Click the **Login** button in the header (or go to `/login`)
3. You'll be redirected to Auth0's login page
4. Sign up for a new account or log in with an existing one
5. After authentication, you'll be redirected back to your app
6. Your user will automatically be created in MongoDB!

## What's Been Integrated

### Frontend Changes:
- ✅ Auth0Provider configured in `src/main.jsx`
- ✅ Login page updated with Auth0 authentication (`src/components/LoginPage.jsx`)
- ✅ Header navigation shows user profile/logout when authenticated (`src/components/reusable/HeaderNav.jsx`)
- ✅ Callback route added to handle Auth0 redirects (`/callback`)
- ✅ Auth service created to sync users with backend (`src/services/authService.js`)

### Backend Changes:
- ✅ Auth0 middleware created (`backend/middleware/auth0.js`)
- ✅ Auth0 routes added:
  - `POST /auth/auth0/callback` - Syncs Auth0 users with MongoDB
  - `GET /auth/auth0/user` - Gets authenticated user profile
- ✅ User model updated with Auth0 support, roles, and permissions

## Authentication Flow

1. User clicks "Login" or "Sign Up"
2. User is redirected to Auth0's Universal Login
3. After authentication, Auth0 redirects to `/callback`
4. Frontend receives the Auth0 access token
5. Frontend calls `POST /auth/auth0/callback` with the token
6. Backend validates the token and creates/updates user in MongoDB
7. User is redirected to the home page

## Checking if Auth Works

### In the Frontend Console:
```javascript
// Check authentication status
import { useAuth0 } from '@auth0/auth0-react';
const { isAuthenticated, user } = useAuth0();
console.log('Authenticated:', isAuthenticated);
console.log('User:', user);
```

### In MongoDB:
After logging in, check your `users` collection - you should see a new user with:
- `auth0Id` - Your Auth0 user ID
- `email` - Your email
- `roles` - Default `['member']`
- `permissions` - Empty array by default

## Common Issues

### Issue: "Invalid redirect URI"
**Solution**: Make sure you added `http://localhost:5173/callback` to Allowed Callback URLs in Auth0 dashboard

### Issue: "Audience is required"
**Solution**: Make sure you created the Auth0 API and the identifier is exactly `https://commie-api`

### Issue: Backend returns 401
**Solution**: Check that your `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, and `AUTH0_ISSUER_BASE_URL` are correct in `backend/.env`

### Issue: CORS errors
**Solution**: Make sure `http://localhost:5173` is in the Allowed Origins (CORS) in Auth0 dashboard

## Next Steps

Now that authentication is working, you can:

1. **Protect Routes**: Add authentication checks to routes that require login
2. **Add Roles**: Assign roles to users (admin, chair, member, etc.)
3. **Add Permissions**: Give users specific permissions (create:motions, delete:committees, etc.)
4. **Update Profile**: Let users update their profile information
5. **Link Committees**: Associate users with committees they own/chair/are members of

## Need Help?

Check the `backend/AUTH0_SETUP.md` file for more detailed information about:
- Using Auth0 in API calls
- Protecting routes with authentication
- Adding roles and permissions
- Frontend integration examples
