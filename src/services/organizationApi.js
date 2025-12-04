import { API_BASE_URL } from '../config/api';

/**
 * Organization API Service
 * Handles all organization-related API calls
 */

/**
 * Create a new organization
 */
export async function createOrganization(organizationData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/organizations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(organizationData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create organization');
        }

        return { success: true, organization: data };
    } catch (error) {
        console.error('Create organization error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get organization by ID or slug
 */
export async function getOrganization(organizationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch organization');
        }

        return { success: true, organization: data };
    } catch (error) {
        console.error('Get organization error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Update organization details
 */
export async function updateOrganization(organizationId, updates) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                ...updates
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update organization');
        }

        return { success: true, organization: data };
    } catch (error) {
        console.error('Update organization error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Verify invite code
 */
export async function verifyInviteCode(inviteCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/organizations/verify-invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inviteCode })
        });

        const data = await response.json();

        return { 
            success: response.ok, 
            valid: data.valid,
            organization: data.organization,
            error: data.error 
        };
    } catch (error) {
        console.error('Verify invite code error:', error);
        return { success: false, valid: false, error: error.message };
    }
}

/**
 * Join organization with invite code
 */
export async function joinOrganization(organizationId, inviteCode) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                inviteCode
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to join organization');
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error('Join organization error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(organizationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch members');
        }

        return { success: true, members: data };
    } catch (error) {
        console.error('Get members error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Regenerate invite code
 */
export async function regenerateInviteCode(organizationId) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/invite-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: user.id })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to regenerate invite code');
        }

        return { success: true, inviteCode: data.inviteCode };
    } catch (error) {
        console.error('Regenerate invite code error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Promote member to admin
 */
export async function promoteToAdmin(organizationId, targetUserId) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/admins`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                requestUserId: user.id,
                targetUserId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to promote user');
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error('Promote user error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Demote admin to member
 */
export async function demoteAdmin(organizationId, targetUserId) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/admins/${targetUserId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestUserId: user.id })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to demote admin');
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error('Demote admin error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove member from organization
 */
export async function removeMember(organizationId, targetUserId) {
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}/members/${targetUserId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestUserId: user.id })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to remove member');
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error('Remove member error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete organization and all associated data
 */
export async function deleteOrganization(organizationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete organization');
        }

        return { success: true, message: data.message, stats: data.stats };
    } catch (error) {
        console.error('Delete organization error:', error);
        return { success: false, error: error.message };
    }
}
