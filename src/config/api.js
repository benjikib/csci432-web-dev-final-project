// API configuration
// In production (Vercel), use /api (relative path to serverless functions)
// In development, use localhost backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? 'http://localhost:3001' : '/api');
