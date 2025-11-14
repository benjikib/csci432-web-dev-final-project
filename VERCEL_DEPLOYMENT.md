# Vercel Deployment Guide

This guide explains how to deploy the Commie application to Vercel with the backend as serverless functions.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas database (or other MongoDB hosting service)

## Architecture

This deployment uses:
- **Frontend**: Static files built with Vite, served from the root
- **Backend**: Express.js API running as Vercel serverless functions in `/api`

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Configure Environment Variables

You need to add the following environment variables in your Vercel project settings:

#### MongoDB Configuration
- `MONGODB_URI` - Your MongoDB connection string (e.g., from MongoDB Atlas)

#### JWT Authentication Configuration
- `JWT_SECRET` - A strong, random secret key for JWT signing (generate with `openssl rand -hex 32`)
- `JWT_EXPIRES_IN` - JWT expiration time (default: `7d` for 7 days)

#### Application Configuration
- `NODE_ENV` - Set to `production`

**Note:** Both CORS and API URLs are automatically configured:
- **CORS**: Allows all `localhost` ports and `*.vercel.app` domains
- **API URL**: Uses `/api` in production, `http://localhost:3001` in development
- No additional configuration needed for Vercel deployments
- If you have a custom domain, optionally add `CORS_ORIGIN` with your domain URL

### 3. Deploy via GitHub (Recommended)

1. Push this branch to GitHub:
   ```bash
   git push origin vercel-deployment
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. Add all environment variables from step 2

7. Click "Deploy"

### 4. Deploy via Vercel CLI

From the project root:

```bash
vercel
```

Follow the prompts and add environment variables when asked.

For production deployment:

```bash
vercel --prod
```

## Post-Deployment

### 1. Test the Deployment

Visit your Vercel URL and test:
- Frontend loads correctly
- API endpoints are accessible at `/api/*`
- User registration and login work correctly
- JWT authentication is functioning
- Database operations work properly
- CORS is working (both production and preview deployments)

### 2. Create First User

Use the registration endpoint to create your first user:
```bash
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "Admin User",
    "communityCode": "YOUR_COMMUNITY_CODE"
  }'
```

## API Routes

All backend API routes are accessible under `/api`:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout (client should remove JWT token)
- `GET /api/auth/me` - Get current user info (requires JWT)
- `GET /api/auth/settings` - Get user settings (requires JWT)
- `PUT /api/auth/settings` - Update user settings (requires JWT)
- `PUT /api/auth/profile` - Update user profile (requires JWT)

### Committees
- `GET /api/committees/:page` - Get paginated committees
- `GET /api/committee/:id` - Get committee details
- `POST /api/committee/create` - Create new committee
- `PUT /api/committee/:id` - Update committee
- `DELETE /api/committee/:id` - Delete committee

### Motions
- `GET /api/committee/:id/motions/:page` - Get paginated motions
- `GET /api/committee/:id/motion/:motionId` - Get motion details
- `POST /api/committee/:id/motion/create` - Create new motion
- `PUT /api/committee/:id/motion/:motionId` - Update motion
- `DELETE /api/committee/:id/motion/:motionId` - Delete motion

### Comments
- `GET /api/committee/:id/motion/:motionId/comments/:page` - Get paginated comments
- `POST /api/committee/:id/motion/:motionId/comment/create` - Create comment
- `PUT /api/committee/:id/motion/:motionId/comment/:commentId` - Update comment
- `DELETE /api/committee/:id/motion/:motionId/comment/:commentId` - Delete comment

### Votes
- `GET /api/committee/:id/motion/:motionId/votes` - Get motion votes
- `POST /api/committee/:id/motion/:motionId/vote` - Cast vote
- `DELETE /api/committee/:id/motion/:motionId/vote` - Remove vote

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify environment variables are set correctly
- Check Vercel build logs for specific errors

### API Not Working
- Verify `/api/index.js` is present
- Check `vercel.json` routing configuration
- Ensure backend dependencies are installed
- Check environment variables are accessible

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from Vercel (0.0.0.0/0 for serverless)
- Check database user permissions
- Verify the database name in the connection string

### Authentication Errors
- Verify `JWT_SECRET` is set and matches across all environments
- Check that tokens are being sent in the `Authorization` header as `Bearer <token>`
- Ensure `JWT_EXPIRES_IN` is set (default: `7d`)
- Check password requirements (minimum 6 characters)

### CORS Errors
- CORS is automatically configured for `localhost` and `*.vercel.app` domains
- If using a custom domain, set `CORS_ORIGIN` environment variable to your domain
- Ensure credentials are included in frontend API requests
- Check browser console for specific CORS error messages
- Verify the origin is either localhost, ends with `.vercel.app`, or matches `CORS_ORIGIN`

## Local Development vs Vercel

The backend code detects the Vercel environment using `process.env.VERCEL`:

```javascript
if (process.env.VERCEL !== '1') {
  startServer(); // Only runs locally
}
```

This means:
- **Local**: Backend runs as a traditional Express server on port 3001
- **Vercel**: Backend runs as serverless functions at `/api`

## File Structure

```
/
├── api/
│   └── index.js              # Vercel serverless function entry point
├── backend/
│   ├── server.js             # Express app (exports for Vercel)
│   ├── routes/               # API routes
│   ├── models/               # Database models
│   └── middleware/           # Auth and other middleware
├── src/                      # Frontend React code
├── dist/                     # Built frontend (generated)
├── vercel.json              # Vercel configuration
├── .vercelignore            # Files to exclude from deployment
└── .env.example             # Environment variable template
```

## Authentication Flow

This application uses JWT (JSON Web Token) authentication:

1. **Registration**: User registers with email, password, and name
   - Password is hashed using bcrypt before storage
   - JWT token is generated and returned

2. **Login**: User logs in with email and password
   - Password is verified against the hashed version
   - JWT token is generated and returned

3. **Protected Routes**: Authenticated requests include JWT token
   - Token is sent in `Authorization: Bearer <token>` header
   - Backend middleware verifies token validity
   - User information is extracted from token

4. **Token Storage**: Frontend stores JWT token
   - Stored in localStorage or sessionStorage
   - Included in all authenticated API requests
   - Removed on logout

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [JWT Introduction](https://jwt.io/introduction)
- [Express.js Documentation](https://expressjs.com/)
- [React Router](https://reactrouter.com/)
