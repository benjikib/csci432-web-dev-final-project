// Vercel serverless function entry point
const express = require('express');
const backendApp = require('../backend/server');

// Create a wrapper app that mounts the backend at /api
const app = express();

// Mount the backend app at /api to strip the prefix
app.use('/api', backendApp);

// Export the Express app as a serverless function handler
module.exports = app;
