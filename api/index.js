// Vercel serverless function entry point
const backendApp = require('../backend/server');

// Serverless function handler
module.exports = (req, res) => {
  console.log('Serverless function called:', req.method, req.url);

  // Strip /api prefix from the path
  const originalUrl = req.url;
  req.url = req.url.replace(/^\/api/, '') || '/';

  console.log('URL rewrite:', originalUrl, '->', req.url);

  // Forward to the backend app
  backendApp(req, res);
};
