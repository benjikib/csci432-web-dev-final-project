import { API_BASE_URL } from '../config/api.js';

/**
 * Second a motion
 */
export async function secondMotion(committeeId, motionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/motion-control/${committeeId}/${motionId}/second`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to second motion');
        }

        return await response.json();
    } catch (error) {
        console.error('Error seconding motion:', error);
        throw error;
    }
}

/**
 * Check voting eligibility for a motion
 */
export async function checkVotingEligibility(committeeId, motionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/motion-control/${committeeId}/${motionId}/voting-eligibility`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to check voting eligibility');
        }

        return await response.json();
    } catch (error) {
        console.error('Error checking voting eligibility:', error);
        throw error;
    }
}

/**
 * Open voting for a motion (Chair only)
 */
export async function openVoting(committeeId, motionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/motion-control/${committeeId}/${motionId}/open-voting`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to open voting');
        }

        return await response.json();
    } catch (error) {
        console.error('Error opening voting:', error);
        throw error;
    }
}

/**
 * Close voting for a motion (Chair only)
 */
export async function closeVoting(committeeId, motionId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/motion-control/${committeeId}/${motionId}/close-voting`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to close voting');
        }

        return await response.json();
    } catch (error) {
        console.error('Error closing voting:', error);
        throw error;
    }
}
