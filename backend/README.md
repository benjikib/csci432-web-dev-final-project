# Commie Backend Server

Backend API server for the Commie HOA Motion Management Platform.

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or cloud)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - The `.env` file is already configured with MongoDB connection
   - Update `JWT_SECRET` for production use
   - Adjust `CORS_ORIGIN` if your frontend runs on a different port

### Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and receive JWT token
- `POST /auth/logout` - Logout (invalidate token)
- `GET /auth/me` - Get current user info

### Committees
- `GET /committees/my-chairs` - Get committees where current user is chair
- `GET /committees/:page` - Get all committees (paginated)
- `GET /committee/:id` - Get specific committee details
- `GET /committee/:id/settings` - Get committee procedural settings only
- `PATCH /committee/:id/settings` - Update committee procedural settings
- `POST /committee/create` - Create a new committee
- `PUT /committee/:id` - Update a committee
- `DELETE /committee/:id` - Delete a committee

### Motions
- `GET /committee/:id/motions/:page` - Get all motions in committee (paginated, supports filtering)
  - Query params: `?type=motionType&status=active&targetMotion=motionId`
- `GET /committee/:id/motion/:motionId` - Get specific motion details
- `GET /committee/:id/motion/:motionId/subsidiaries` - Get all subsidiary motions affecting this motion
- `POST /committee/:id/motion/create` - Create a new motion (includes Robert's Rules metadata)
- `PUT /committee/:id/motion/:motionId` - Update a motion
- `DELETE /committee/:id/motion/:motionId` - Delete a motion

### Comments
- `GET /committee/:id/motion/:motionId/comments/:page` - Get all comments (paginated)
- `POST /committee/:id/motion/:motionId/comment/create` - Create a comment
- `PUT /committee/:id/motion/:motionId/comment/:commentId` - Update a comment
- `DELETE /committee/:id/motion/:motionId/comment/:commentId` - Delete a comment

### Voting
- `GET /committee/:id/motion/:motionId/votes` - Get vote summary and details
- `POST /committee/:id/motion/:motionId/vote` - Cast or update a vote
- `DELETE /committee/:id/motion/:motionId/vote` - Remove your vote

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── User.js              # User model
│   ├── Committee.js         # Committee model
│   ├── Motion.js            # Motion model
│   ├── Comment.js           # Comment model
│   └── Vote.js              # Vote model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── committees.js        # Committee routes
│   ├── motions.js           # Motion routes
│   ├── comments.js          # Comment routes
│   └── votes.js             # Voting routes
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── .env                     # Environment variables (DO NOT COMMIT)
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

To get a token:
1. Register: `POST /auth/register` with email, password, and name
2. Login: `POST /auth/login` with email and password
3. Use the returned token in subsequent requests

## Database Collections

- **users** - User accounts and profiles
- **committees** - Committee information
- **motions** - Motions within committees
- **comments** - Comments on motions
- **votes** - User votes on motions

## Error Handling

All endpoints return JSON responses with the following format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Development

Run with auto-restart on file changes:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when you make changes.

## Health Check

Check if the server is running:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```
