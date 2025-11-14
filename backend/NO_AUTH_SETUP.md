# Backend Setup (No Authentication)

The backend has been configured to work **without authentication** for now. You can freely create and fetch committees and motions from MongoDB.

## 🚀 Getting Started

### 1. Start the Backend Server

```bash
cd backend
npm start
```

The server will run on **http://localhost:3001**

### 2. Seed the Database (Optional)

If you want to start with some sample data:

```bash
npm run seed
```

This creates:
- 3 committees (Finance, Landscaping, Safety & Security)
- 6 motions (2 per committee)

## 📋 Available Endpoints (No Auth Required!)

### Committees

```bash
# Get all committees (page 1)
GET http://localhost:3001/committees/1

# Get specific committee
GET http://localhost:3001/committee/{committeeId}

# Create a new committee
POST http://localhost:3001/committee/create
Body: {
  "title": "New Committee",
  "description": "Committee description"
}

# Update a committee
PUT http://localhost:3001/committee/{committeeId}
Body: {
  "title": "Updated Title",
  "description": "Updated description"
}

# Delete a committee
DELETE http://localhost:3001/committee/{committeeId}
```

### Motions

```bash
# Get all motions for a committee (page 1)
GET http://localhost:3001/committee/{committeeId}/motions/1

# Get specific motion
GET http://localhost:3001/committee/{committeeId}/motion/{motionId}

# Create a new motion
POST http://localhost:3001/committee/{committeeId}/motion/create
Body: {
  "title": "Motion Title",
  "description": "Motion description",
  "fullDescription": "Detailed description (optional)"
}

# Update a motion
PUT http://localhost:3001/committee/{committeeId}/motion/{motionId}
Body: {
  "title": "Updated title",
  "description": "Updated description"
}

# Delete a motion
DELETE http://localhost:3001/committee/{committeeId}/motion/{motionId}
```

## 🧪 Testing with curl

### Create a Committee

```bash
curl -X POST http://localhost:3001/committee/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Committee",
    "description": "This is a test committee"
  }'
```

### Create a Motion

```bash
# Replace {committeeId} with actual committee ID
curl -X POST http://localhost:3001/committee/{committeeId}/motion/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Motion",
    "description": "I move that we test this motion",
    "fullDescription": "This is a detailed test motion description"
  }'
```

### Get All Committees

```bash
curl http://localhost:3001/committees/1
```

### Get Motions for a Committee

```bash
# Replace {committeeId} with actual committee ID
curl http://localhost:3001/committee/{committeeId}/motions/1
```

## 🎯 Frontend Integration

Your frontend is already configured to work with the backend at `http://localhost:3001`.

### Important Notes:

1. **MongoDB IDs**: Unlike the mock data which used numeric IDs (1, 2, 3), MongoDB uses 24-character hex string IDs like `69098f080dc09f4245dd5b5f`

2. **Use Real Committee IDs**: When navigating to committees in your frontend, use the actual MongoDB ObjectIds returned from the API, not the old numeric IDs.

3. **Frontend Already Updated**: The frontend API service (`src/services/motionApi.js`) has been updated to not require authentication tokens.

## ✅ What's Changed

- ✅ Removed authentication middleware from all committee and motion routes
- ✅ Made `owner` and `author` fields optional in database models
- ✅ Updated frontend API service to not send auth tokens
- ✅ Created seed script to populate database with test data
- ✅ Backend ready to create and fetch committees/motions without login

## 🔄 Adding Authentication Back Later

When you're ready to add authentication back:

1. Uncomment auth middleware in route files (`routes/committees.js`, `routes/motions.js`)
2. Uncomment auth token handling in frontend (`src/services/motionApi.js`)
3. Make `owner` and `author` fields required again in models
4. Implement login/register flow in frontend

The auth routes (`/auth/register`, `/auth/login`) are still available if you want to use them!

## 📝 Example Workflow

1. **Start backend**: `npm start`
2. **Seed database** (optional): `npm run seed`
3. **Start frontend**: (in parent directory) `npm run dev`
4. **Fetch committees** via API and use their IDs
5. **Create/view motions** for those committees

## 🐛 Troubleshooting

### "Committee not found" error
- Make sure you're using valid MongoDB ObjectId format
- Run `npm run seed` to create test committees
- Check committee IDs with: `curl http://localhost:3001/committees/1`

### CORS errors
- Ensure backend is running on port 3001
- Check that CORS_ORIGIN in `.env` matches your frontend URL

### Connection errors
- Verify MongoDB connection string in `.env`
- Check internet connection (for MongoDB Atlas)

## 🎉 You're Ready!

Your backend is now running **without authentication**. You can freely create and fetch committees and motions from MongoDB!
