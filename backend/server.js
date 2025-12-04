const express = require('express');
const cors = require('cors');
const path = require('path');

// Only load dotenv in non-Vercel environments (local development)
if (process.env.VERCEL !== '1') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

const { connectDB } = require('./config/database');
const { checkAndNotifyVotingDeadlines } = require('./utils/votingDeadlineNotifications');

// Import routes
const authRoutes = require('./routes/auth');
const committeeRoutes = require('./routes/committees');
const motionRoutes = require('./routes/motions');
const commentRoutes = require('./routes/comments');
const voteRoutes = require('./routes/votes');
const notificationsRoutes = require('./routes/notifications');
const motionControlRoutes = require('./routes/motionControl');
const organizationRoutes = require('./routes/organizations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration for Vercel (supports production, preview, and local)
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS Request from:', origin || 'no-origin');

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow custom domain from env variable
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) {
      return callback(null, true);
    }

    // Log rejected origin for debugging
    console.warn('⚠️  CORS rejected origin:', origin);
    // Reject gracefully instead of throwing error
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database before handling requests
let dbConnected = false;

async function ensureDbConnection() {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
}

// Middleware to ensure DB connection for each request (serverless)
app.use(async (req, res, next) => {
  try {
    console.log(`📥 ${req.method} ${req.url}`);
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 25000)
    );

    await Promise.race([ensureDbConnection(), timeout]);
    next();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test route to check body parsing
app.post('/test', (req, res) => {
  console.log('🧪 Test POST - Body:', req.body);
  console.log('🧪 Test POST - Headers:', req.headers);
  res.json({
    success: true,
    received: req.body,
    headers: req.headers
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/', committeeRoutes);
app.use('/', motionRoutes);
app.use('/', commentRoutes);
app.use('/', voteRoutes);
app.use('/', notificationsRoutes);
app.use('/motion-control', motionControlRoutes);
app.use('/organizations', organizationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to database and start server (only for local development)
async function startServer() {
  try {
    await connectDB();
    dbConnected = true;

    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`\n📋 Available endpoints:`);
      console.log(`   Auth:       POST   /auth/register`);
      console.log(`   Auth:       POST   /auth/login`);
      console.log(`   Auth:       POST   /auth/logout`);
      console.log(`   Auth:       GET    /auth/me`);
      console.log(`   Committees: GET    /committees/my-chairs`);
      console.log(`   Committees: GET    /committees/:page`);
      console.log(`   Committees: GET    /committee/:id`);
      console.log(`   Committees: GET    /committee/:id/settings`);
      console.log(`   Committees: PATCH  /committee/:id/settings`);
      console.log(`   Committees: POST   /committee/create`);
      console.log(`   Committees: PUT    /committee/:id`);
      console.log(`   Committees: DELETE /committee/:id`);
      console.log(`   Motions:    GET    /committee/:id/motions/:page?type=&status=&targetMotion=`);
      console.log(`   Motions:    GET    /committee/:id/motion/:motionId`);
      console.log(`   Motions:    GET    /committee/:id/motion/:motionId/subsidiaries`);
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
    
    // Start periodic voting deadline check (every 30 minutes)
    console.log('⏰ Starting voting deadline notification scheduler...');
    checkAndNotifyVotingDeadlines(); // Run immediately on startup
    setInterval(checkAndNotifyVotingDeadlines, 30 * 60 * 1000); // Then every 30 minutes
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  startServer();
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Export for Vercel serverless
module.exports = app;
