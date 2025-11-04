const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const committeeRoutes = require('./routes/committees');
const motionRoutes = require('./routes/motions');
const commentRoutes = require('./routes/comments');
const voteRoutes = require('./routes/votes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/', committeeRoutes);
app.use('/', motionRoutes);
app.use('/', commentRoutes);
app.use('/', voteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   Auth:       POST   /auth/register`);
      console.log(`   Auth:       POST   /auth/login`);
      console.log(`   Auth:       POST   /auth/logout`);
      console.log(`   Auth:       GET    /auth/me`);
      console.log(`   Committees: GET    /committees/:page`);
      console.log(`   Committees: GET    /committee/:id`);
      console.log(`   Committees: POST   /committee/create`);
      console.log(`   Committees: PUT    /committee/:id`);
      console.log(`   Committees: DELETE /committee/:id`);
      console.log(`   Motions:    GET    /committee/:id/motions/:page`);
      console.log(`   Motions:    GET    /committee/:id/motion/:motionId`);
      console.log(`   Motions:    POST   /committee/:id/motion/create`);
      console.log(`   Motions:    PUT    /committee/:id/motion/:motionId`);
      console.log(`   Motions:    DELETE /committee/:id/motion/:motionId`);
      console.log(`   Comments:   GET    /committee/:id/motion/:motionId/comments/:page`);
      console.log(`   Comments:   POST   /committee/:id/motion/:motionId/comment/create`);
      console.log(`   Comments:   PUT    /committee/:id/motion/:motionId/comment/:commentId`);
      console.log(`   Comments:   DELETE /committee/:id/motion/:motionId/comment/:commentId`);
      console.log(`   Votes:      GET    /committee/:id/motion/:motionId/votes`);
      console.log(`   Votes:      POST   /committee/:id/motion/:motionId/vote`);
      console.log(`   Votes:      DELETE /committee/:id/motion/:motionId/vote\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});
