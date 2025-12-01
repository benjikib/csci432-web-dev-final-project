import { API_BASE_URL } from '../config/api.js';

export async function getCommentsByMotion(committeeId, motionId, page = 1, limit = 50) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/comments/${page}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch comments');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
}

export async function createComment(committeeId, motionId, commentData) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/comment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create comment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating comment:', error);
        throw error;
    }
}

export async function deleteComment(committeeId, motionId, commentId) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/committee/${committeeId}/motion/${motionId}/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete comment');
        }

        return await response.json();
    } catch (error) {
        console.error('Error deleting comment:', error);
        throw error;
    }
}
