// Vercel serverless function entry point
const app = require('../backend/server');

// Export the Express app as a serverless function handler
module.exports = app;
