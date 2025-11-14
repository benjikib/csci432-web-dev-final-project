// API service for user-related endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Helper function to handle API responses
 */
async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * Helper function to create request headers
 */
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Get current user info
 * @returns {Promise} Response with user data
 */
export async function getCurrentUser() {
    const response = await fetch(
        `${API_BASE_URL}/auth/me`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Get current user's settings
 * @returns {Promise} Response with settings data
 */
export async function getUserSettings() {
    const response = await fetch(
        `${API_BASE_URL}/auth/settings`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Update current user's settings
 * @param {Object} settings - The settings to update (theme, notifications, displayName)
 * @returns {Promise} Response with updated settings
 */
export async function updateUserSettings(settings) {
    const response = await fetch(
        `${API_BASE_URL}/auth/settings`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(settings),
        }
    );
    return handleResponse(response);
}

/**
 * Helper function to check if the current user has a specific role
 * @param {Object} user - User object from getCurrentUser()
 * @param {string} role - Role to check for (e.g., 'admin')
 * @returns {boolean}
 */
export function hasRole(user, role) {
    return user && user.roles && user.roles.includes(role);
}

/**
 * Helper function to check if the current user has a specific permission
 * @param {Object} user - User object from getCurrentUser()
 * @param {string} permission - Permission to check for
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
    return user && user.permissions && user.permissions.includes(permission);
}

/**
 * Helper function to check if user is admin (can do anything)
 * @param {Object} user - User object from getCurrentUser()
 * @returns {boolean}
 */
export function isAdmin(user) {
    return hasRole(user, 'admin');
}

export default {
    getCurrentUser,
    getUserSettings,
    updateUserSettings,
    hasRole,
    hasPermission,
    isAdmin,
};
