import { API_BASE_URL } from '../config/api.js';

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function getVotes(committeeId, motionId) {
    const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/votes`, {
        method: 'GET',
        headers: getHeaders()
    });
    return handleResponse(response);
}

export async function castVote(committeeId, motionId, vote, isAnonymous = false) {
    const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/vote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ vote, isAnonymous })
    });
    return handleResponse(response);
}

export async function removeVote(committeeId, motionId) {
    const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/vote`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(response);
}

export default { getVotes, castVote, removeVote };
