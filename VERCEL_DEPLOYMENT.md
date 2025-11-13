# Deploying to Vercel

This guide will help you deploy your full-stack application to Vercel.

## Project Structure

Your project is now configured as a monorepo with:
- **Frontend**: React + Vite application (root directory)
- **API**: Serverless functions in `/api` directory
- **Database**: MongoDB Atlas (cloud database)
- **Authentication**: Auth0

## Prerequisites

1. A Vercel account (https://vercel.com)
2. MongoDB Atlas account with a database cluster
3. Auth0 account with an application configured
4. Your repository pushed to GitHub, GitLab, or Bitbucket

## Step 1: Environment Variables

You'll need to configure the following environment variables in Vercel:

### Required Environment Variables

1. **Database Configuration**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
     - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
     - Get this from MongoDB Atlas → Databases → Connect → Connect your application

2. **Auth0 Configuration**
   - `VITE_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-app.us.auth0.com`)
   - `VITE_AUTH0_CLIENT_ID` - Your Auth0 application client ID
   - `VITE_AUTH0_AUDIENCE` - Your Auth0 API identifier
   - `AUTH0_DOMAIN` - Same as VITE_AUTH0_DOMAIN (for backend)
   - `AUTH0_AUDIENCE` - Same as VITE_AUTH0_AUDIENCE (for backend)

3. **JWT Configuration** (if using custom JWT)
   - `JWT_SECRET` - A secure random string for signing JWT tokens
   - `JWT_EXPIRES_IN` - Token expiration time (default: `7d`)

4. **CORS Configuration**
   - `CORS_ORIGIN` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
     - Note: You can set this after first deployment

### How to Add Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - Enter the **Name** (e.g., `MONGODB_URI`)
   - Enter the **Value**
   - Select which environments (Production, Preview, Development)
   - Click **Save**

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect the framework (Vite)
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (should be auto-filled)
   - **Output Directory**: `dist` (should be auto-filled)
   - **Install Command**: `npm install`
5. Add all environment variables (see Step 1)
6. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? Choose your account
   - Link to existing project? **No** (first time)
   - What's your project's name? Enter a name
   - In which directory is your code located? `./`
   - Auto-detected settings? **Yes**

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Update Auth0 Configuration

After deployment, update your Auth0 application settings:

1. Go to Auth0 Dashboard → Applications → Your Application
2. Update **Allowed Callback URLs**:
   ```
   https://your-app.vercel.app/callback
   http://localhost:5173/callback
   ```

3. Update **Allowed Logout URLs**:
   ```
   https://your-app.vercel.app
   http://localhost:5173
   ```

4. Update **Allowed Web Origins**:
   ```
   https://your-app.vercel.app
   http://localhost:5173
   ```

## Step 4: Update CORS_ORIGIN

1. Go back to Vercel → Settings → Environment Variables
2. Update `CORS_ORIGIN` to your deployment URL: `https://your-app.vercel.app`
3. Redeploy for changes to take effect

## API Endpoints

Your API will be available at:
- **Auth**: `https://your-app.vercel.app/api/auth`
- **Committees**: `https://your-app.vercel.app/api/committees`
- **Motions**: `https://your-app.vercel.app/api/motions`
- **Comments**: `https://your-app.vercel.app/api/comments`
- **Votes**: `https://your-app.vercel.app/api/votes`

## Local Development

To test the serverless functions locally:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env
   ```

4. Run development server:
   ```bash
   vercel dev
   ```

This will start a local development server that emulates the Vercel environment.

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Ensure `package.json` has the correct build script
- Check build logs in Vercel dashboard for specific errors

### API Returns 500 Errors

- Check Function Logs in Vercel dashboard
- Verify `MONGODB_URI` is correct and MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Ensure Auth0 credentials are correct

### CORS Errors

- Update `CORS_ORIGIN` environment variable to match your deployment URL
- Redeploy after updating environment variables

### Database Connection Issues

- Verify MongoDB Atlas network access allows all IPs (0.0.0.0/0) or Vercel IPs
- Check that database user has correct permissions
- Ensure connection string is properly formatted

## Environment Variables Checklist

Before deploying, ensure you have:
- [ ] `MONGODB_URI`
- [ ] `VITE_AUTH0_DOMAIN`
- [ ] `VITE_AUTH0_CLIENT_ID`
- [ ] `VITE_AUTH0_AUDIENCE`
- [ ] `AUTH0_DOMAIN`
- [ ] `AUTH0_AUDIENCE`
- [ ] `JWT_SECRET` (if using)
- [ ] `CORS_ORIGIN` (can be added after first deployment)

## Monitoring

After deployment:
1. Monitor your application in Vercel Dashboard
2. Check Function Logs for API errors
3. Set up error monitoring (optional): Sentry, LogRocket, etc.

## Continuous Deployment

Once connected to Git, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Run builds and tests before deployment

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Auth0 Documentation](https://auth0.com/docs)
