# Auth0 Integration Setup Guide

This guide will help you set up Auth0 authentication for your application.

## 1. Create an Auth0 Account

1. Go to [Auth0](https://auth0.com/) and sign up for a free account
2. Create a new tenant (e.g., `your-app-name`)

## 2. Create an Auth0 Application

1. In your Auth0 dashboard, go to **Applications** > **Applications**
2. Click **Create Application**
3. Choose a name (e.g., "Commie App")
4. Select **Single Page Web Applications** as the application type
5. Click **Create**

## 3. Configure Application Settings

In your application settings, configure the following:

### Allowed Callback URLs
```
http://localhost:5173/callback
http://localhost:3001/auth/auth0/callback
```

### Allowed Logout URLs
```
http://localhost:5173
http://localhost:3001
```

### Allowed Web Origins
```
http://localhost:5173
http://localhost:3001
```

### Allowed Origins (CORS)
```
http://localhost:5173
http://localhost:3001
```

## 4. Create an Auth0 API

1. In your Auth0 dashboard, go to **Applications** > **APIs**
2. Click **Create API**
3. Give it a name (e.g., "Commie API")
4. Set an identifier (e.g., `https://commie-api`)
   - This will be your `AUTH0_AUDIENCE`
5. Click **Create**

## 5. Update Environment Variables

Copy the following values from your Auth0 dashboard to your `.env` file:

### From Application Settings:
- **Domain** → `AUTH0_DOMAIN` and `AUTH0_ISSUER_BASE_URL`
- **Client ID** → `AUTH0_CLIENT_ID`
- **Client Secret** → `AUTH0_CLIENT_SECRET`

### From API Settings:
- **Identifier** → `AUTH0_AUDIENCE`

### Generate a Random Secret:
For `AUTH0_SECRET`, generate a long random string (at least 32 characters):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Your `.env` file should look like:
```env
# Auth0 Configuration
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
AUTH0_AUDIENCE=https://commie-api
AUTH0_ISSUER_BASE_URL=https://your-tenant.us.auth0.com
AUTH0_BASE_URL=http://localhost:3001
AUTH0_SECRET=your_generated_random_secret_here
```

## 6. API Endpoints

### Auth0 Authentication Endpoints

#### POST `/auth/auth0/callback`
Syncs an Auth0 user with the database after authentication.

**Headers:**
```
Authorization: Bearer <auth0_access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User authenticated successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["member"],
    "permissions": []
  }
}
```

#### GET `/auth/auth0/user`
Get the current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <auth0_access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "auth0Id": "auth0|123456",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["member"],
    "permissions": [],
    "ownedCommittees": [],
    "chairedCommittees": [],
    "memberCommittees": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

### Legacy JWT Endpoints (Still Supported)

The existing `/auth/register`, `/auth/login`, and `/auth/me` endpoints continue to work with custom JWT tokens.

## 7. Frontend Integration

### Install Auth0 React SDK

For React/Vite frontend:
```bash
npm install @auth0/auth0-react
```

### Configure Auth0Provider

In your main React app file:

```javascript
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <Auth0Provider
      domain="your-tenant.us.auth0.com"
      clientId="your_client_id"
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback',
        audience: 'https://commie-api',
        scope: 'openid profile email'
      }}
    >
      {/* Your app components */}
    </Auth0Provider>
  );
}
```

### Create Login/Logout Buttons

```javascript
import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return <button onClick={() => loginWithRedirect()}>Log In</button>;
}

function LogoutButton() {
  const { logout } = useAuth0();
  return <button onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button>;
}
```

### Make Authenticated API Calls

```javascript
import { useAuth0 } from '@auth0/auth0-react';

function MyComponent() {
  const { getAccessTokenSilently } = useAuth0();

  const callAPI = async () => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch('http://localhost:3001/auth/auth0/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={callAPI}>Get Profile</button>;
}
```

## 8. Testing

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Start your frontend application

3. Click the "Log In" button - you should be redirected to Auth0

4. Sign up or log in with an Auth0 account

5. After authentication, call the `/auth/auth0/callback` endpoint with your access token

6. The user will be automatically created in your MongoDB database

## 9. User Roles and Permissions

After a user is created, you can assign roles and permissions using the User model methods:

```javascript
// Add a role
await User.addRole(userId, 'admin');

// Add a permission
await User.addPermission(userId, 'delete:committees');

// Check if user has role
const isAdmin = await User.hasRole(userId, 'admin');

// Check if user has permission
const canDelete = await User.hasPermission(userId, 'delete:committees');
```

## 10. Protecting Routes

You can use the Auth0 middleware to protect routes:

```javascript
const { validateAuth0Token, syncAuth0User, requireRole } = require('./middleware/auth0');

// Require authentication
router.get('/protected', validateAuth0Token, syncAuth0User, (req, res) => {
  res.json({ user: req.user });
});

// Require specific role
router.delete('/admin', validateAuth0Token, syncAuth0User, requireRole('admin'), (req, res) => {
  // Only admins can access this
});
```

## Need Help?

- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 React SDK](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 API Documentation](https://auth0.com/docs/api)
