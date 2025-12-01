// API service for committee settings/procedural controls
import { API_BASE_URL } from '../config/api.js';

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
 * Get committee settings (procedural controls)
 * @param {string|number} committeeId - The committee ID or slug
 * @returns {Promise} Response with settings data
 */
export async function getCommitteeSettings(committeeId) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    const data = await handleResponse(response);
    
    // Return just the settings from the committee object
    return {
        success: true,
        settings: data.committee?.settings || {}
    };
}

/**
 * Update committee settings (procedural controls)
 * @param {string|number} committeeId - The committee ID or slug
 * @param {Object} settings - The complete settings object to save
 * @returns {Promise} Response with updated committee data
 */
export async function updateCommitteeSettings(committeeId, settings) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ settings }),
        }
    );
    return handleResponse(response);
}

/**
 * Get committees where the current user is chair
 * Uses optimized backend endpoint that filters server-side
 * @returns {Promise} Response with committees data
 */
export async function getChairCommittees() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false,
                committees: [],
                message: 'Not authenticated'
            };
        }

        // Use dedicated endpoint for chair committees
        const response = await fetch(
            `${API_BASE_URL}/committees/my-chairs`,
            {
                method: 'GET',
                headers: getHeaders(),
            }
        );
        
        const data = await handleResponse(response);
        
        return {
            success: true,
            committees: data.committees || []
        };
    } catch (error) {
        console.error('Error fetching chair committees:', error);
        return {
            success: false,
            committees: [],
            message: error.message
        };
    }
}

export default {
    getCommitteeSettings,
    updateCommitteeSettings,
    getChairCommittees,
};
