# Vercel Deployment Guide

This guide explains how to deploy the Commie application to Vercel with the backend as serverless functions.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- MongoDB Atlas database (or other MongoDB hosting service)
- Auth0 account configured for your application

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
- `MONGODB_URI` - Your MongoDB connection string

#### Frontend Auth0 Configuration
- `VITE_AUTH0_DOMAIN` - Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Your Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Your Auth0 API audience

#### Backend Auth0 Configuration
- `AUTH0_DOMAIN` - Your Auth0 domain
- `AUTH0_CLIENT_ID` - Your Auth0 client ID
- `AUTH0_CLIENT_SECRET` - Your Auth0 client secret
- `AUTH0_AUDIENCE` - Your Auth0 API audience
- `AUTH0_ISSUER_BASE_URL` - Your Auth0 issuer base URL (e.g., `https://your-domain.auth0.com`)
- `AUTH0_SECRET` - A random secret for Auth0 session encryption

#### JWT Configuration
- `JWT_SECRET` - A strong secret key for JWT signing
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., `7d`)

#### Environment
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)

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

### 1. Update Auth0 Configuration

Add your Vercel deployment URL to Auth0:
- **Allowed Callback URLs**: `https://your-app.vercel.app/callback`
- **Allowed Logout URLs**: `https://your-app.vercel.app`
- **Allowed Web Origins**: `https://your-app.vercel.app`

### 2. Update CORS Origin

Make sure the `CORS_ORIGIN` environment variable in Vercel matches your deployment URL.

### 3. Test the Deployment

Visit your Vercel URL and test:
- Frontend loads correctly
- API endpoints are accessible at `/api/*`
- Authentication works
- Database operations function properly

## API Routes

All backend API routes are accessible under `/api`:

- Auth: `/api/auth/*`
- Committees: `/api/committee/*`
- Motions: `/api/committee/:id/motion/*`
- Comments: `/api/committee/:id/motion/:motionId/comment/*`
- Votes: `/api/committee/:id/motion/:motionId/vote/*`

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

### Auth0 Errors
- Verify all Auth0 environment variables
- Check Auth0 application settings match deployment URL
- Ensure callback URLs are configured correctly

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

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Auth0 Documentation](https://auth0.com/docs)
