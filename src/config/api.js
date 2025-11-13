/**
 * API configuration
 * In production (Vercel), uses relative /api path
 * In development, uses localhost:3001 or VITE_API_BASE_URL if set
 */

const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // In production, use relative /api path
  if (import.meta.env.PROD) {
    return '/api';
  }

  // In development, default to localhost backend
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper function to handle API responses
 */
export async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Helper function to create request headers
 */
export function getHeaders() {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Get Auth0 token from localStorage
  const token = localStorage.getItem('auth0_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export default {
  API_BASE_URL,
  handleResponse,
  getHeaders
};
