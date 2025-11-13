// API service for committee-related endpoints
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

    // Get Auth0 token from localStorage
    const token = localStorage.getItem('auth0_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Get all committees (paginated)
 * @param {number} page - Page number (default 1)
 * @returns {Promise} Response with committees data
 */
export async function getCommittees(page = 1) {
    const response = await fetch(
        `${API_BASE_URL}/committees/${page}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Get specific committee details
 * @param {string} id - The committee ID
 * @returns {Promise} Response with committee data
 */
export async function getCommitteeById(id) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${id}`,
        {
            method: 'GET',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

/**
 * Create a new committee
 * @param {Object} committeeData - The committee data to create
 * @returns {Promise} Response with created committee data
 */
export async function createCommittee(committeeData) {
    const response = await fetch(
        `${API_BASE_URL}/committee/create`,
        {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(committeeData),
        }
    );
    return handleResponse(response);
}

/**
 * Update a committee
 * @param {string} id - The committee ID
 * @param {Object} committeeData - The updated committee data
 * @returns {Promise} Response with updated committee data
 */
export async function updateCommittee(id, committeeData) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${id}`,
        {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(committeeData),
        }
    );
    return handleResponse(response);
}

/**
 * Delete a committee
 * @param {string} id - The committee ID
 * @returns {Promise} Response confirming deletion
 */
export async function deleteCommittee(id) {
    const response = await fetch(
        `${API_BASE_URL}/committee/${id}`,
        {
            method: 'DELETE',
            headers: getHeaders(),
        }
    );
    return handleResponse(response);
}

export default {
    getCommittees,
    getCommitteeById,
    createCommittee,
    updateCommittee,
    deleteCommittee,
};
