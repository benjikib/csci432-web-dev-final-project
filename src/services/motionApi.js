// API service for motion-related endpoints
// Base URL for the API - adjust this based on your backend server
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

    // Auth disabled for now
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //     headers['Authorization'] = `Bearer ${token}`;
    // }

    return headers;
}

/**
 * Get all motions in a committee (paginated)
 * @param {string|number} committeeId - The committee ID
 * @param {number} page - Page number (default 1)
 * @returns {Promise} Response with motions data
 */
export async function getMotionsByCommittee(committeeId, page = 1) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}/motions/${page}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Get specific motion details
 * @param {string|number} committeeId - The committee ID
 * @param {string|number} motionId - The motion ID
 * @returns {Promise} Response with motion data
 */
export async function getMotionById(committeeId, motionId) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}/motion/${motionId}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Create a new motion
 * @param {string|number} committeeId - The committee ID
 * @param {Object} motionData - The motion data to create
 * @returns {Promise} Response with created motion data
 */
export async function createMotion(committeeId, motionData) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}/motion/create`,
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(motionData),
        }
    );
    return handleResponse(response);
}

/**
 * Update a motion
 * @param {string|number} committeeId - The committee ID
 * @param {string|number} motionId - The motion ID
 * @param {Object} motionData - The updated motion data
 * @returns {Promise} Response with updated motion data
 */
export async function updateMotion(committeeId, motionId, motionData) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}/motion/${motionId}`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(motionData),
        }
    );
    return handleResponse(response);
}

/**
 * Delete a motion
 * @param {string|number} committeeId - The committee ID
 * @param {string|number} motionId - The motion ID
 * @returns {Promise} Response confirming deletion
 */
export async function deleteMotion(committeeId, motionId) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${committeeId}/motion/${motionId}`,
        {
            method: 'DELETE',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

export default {
    getMotionsByCommittee,
    getMotionById,
    createMotion,
    updateMotion,
    deleteMotion,
};
