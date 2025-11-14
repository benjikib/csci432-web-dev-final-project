// Vercel serverless function entry point
const backendApp = require('../backend/server');

// Middleware to strip /api prefix from the URL
module.exports = (req, res) => {
  // Strip /api prefix from the path
  req.url = req.url.replace(/^\/api/, '') || '/';

  // Forward to the backend app
  backendApp(req, res);
};
