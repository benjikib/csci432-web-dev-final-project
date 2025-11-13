// API service for motion-related endpoints
import { API_BASE_URL, handleResponse, getHeaders } from '../config/api';

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
