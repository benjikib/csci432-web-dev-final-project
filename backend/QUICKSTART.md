# Backend Quick Start Guide

## Running the Backend Server

### Step 1: Install Dependencies (First Time Only)
```bash
cd backend
npm install
```

### Step 2: Start the Server

**Option A: Regular Mode**
```bash
npm start
```

**Option B: Development Mode (auto-restart on changes)**
```bash
npm run dev
```

The server will start on **http://localhost:3001**

### Step 3: Verify It's Running

Open a new terminal and run:
```bash
curl http://localhost:3001/health
```

You should see:
```json
{"status":"ok","message":"Server is running"}
```

## Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

This returns a JWT token. Save it for the next steps!

### 2. Create a Committee
```bash
curl -X POST http://localhost:3001/committee/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Finance Committee",
    "description": "Manages community finances"
  }'
```

### 3. Create a Motion
```bash
curl -X POST http://localhost:3001/committee/COMMITTEE_ID/motion/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Motion to Approve Budget",
    "description": "I move that we approve the annual budget",
    "fullDescription": "This motion proposes to approve the community budget for 2025..."
  }'
```

## Environment Variables

The backend is configured in `backend/.env`:

```env
PORT=3001                          # Server port
MONGODB_URI=mongodb+srv://...      # MongoDB connection string
JWT_SECRET=your-secret-key         # JWT signing secret (CHANGE IN PRODUCTION!)
JWT_EXPIRES_IN=7d                  # Token expiration
CORS_ORIGIN=http://localhost:5173  # Frontend URL
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a secure random string in production!

## Connecting Frontend to Backend

The frontend is already configured to connect to `http://localhost:3001`.

Make sure both servers are running:
1. **Backend**: `cd backend && npm start` (port 3001)
2. **Frontend**: `cd .. && npm run dev` (port 5173)

## Common Issues

### Port Already in Use
If port 3001 is already in use, change the PORT in `.env` to something else (e.g., 3002).

### MongoDB Connection Failed
- Check your internet connection
- Verify the MONGODB_URI in `.env` is correct
- Ensure MongoDB Atlas allows connections from your IP

### CORS Errors
- Make sure CORS_ORIGIN in `.env` matches your frontend URL
- Default is `http://localhost:5173`

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Next Steps

1. **Authentication**: The frontend needs to store JWT tokens after login
2. **Seeding Data**: Create some test committees and motions via the API
3. **Testing**: Use the frontend to create and view motions

See the full [README.md](./README.md) for complete API documentation.
