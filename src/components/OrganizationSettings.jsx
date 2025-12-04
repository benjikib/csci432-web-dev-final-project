import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

function OrganizationSettings() {
    const [organization, setOrganization] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchOrganizationData();
    }, []);

    const fetchOrganizationData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            if (!user.organizationId) {
                setError('No organization found for this user');
                setLoading(false);
                return;
            }

            // Fetch organization details
            const orgResponse = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!orgResponse.ok) throw new Error('Failed to fetch organization');

            const orgData = await orgResponse.json();
            setOrganization(orgData);
            setFormData({
                name: orgData.name,
                description: orgData.description
            });

            // Fetch organization members
            const membersResponse = await fetch(`${API_BASE_URL}/organizations/${user.organizationId}/members`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                setMembers(membersData);
            }

        } catch (err) {
            console.error('Error fetching organization:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    name: formData.name,
                    description: formData.description
                })
            });

            if (!response.ok) throw new Error('Failed to update organization');

            const updatedOrg = await response.json();
            setOrganization(updatedOrg);
            alert('Organization updated successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(organization.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const regenerateInviteCode = async () => {
        if (!confirm('Are you sure you want to regenerate the invite code? The old code will no longer work.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}/invite-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ userId: user.id })
            });

            if (!response.ok) throw new Error('Failed to regenerate invite code');

            const data = await response.json();
            setOrganization({ ...organization, inviteCode: data.inviteCode });
            alert('Invite code regenerated successfully!');
        } catch (err) {
            alert('Error regenerating invite code: ' + err.message);
        }
    };

    const promoteToAdmin = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}/admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestUserId: user.id,
                    targetUserId: userId
                })
            });

            if (!response.ok) throw new Error('Failed to promote user');

            await fetchOrganizationData();
            alert('User promoted to admin successfully!');
        } catch (err) {
            alert('Error promoting user: ' + err.message);
        }
    };

    const demoteAdmin = async (userId) => {
        if (!confirm('Are you sure you want to demote this admin to member?')) return;

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}/admins/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestUserId: user.id })
            });

            if (!response.ok) throw new Error('Failed to demote admin');

            await fetchOrganizationData();
            alert('Admin demoted to member successfully!');
        } catch (err) {
            alert('Error demoting admin: ' + err.message);
        }
    };

    const removeMember = async (userId) => {
        if (!confirm('Are you sure you want to remove this member from the organization?')) return;

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');
            const user = JSON.parse(userStr);

            const response = await fetch(`${API_BASE_URL}/organizations/${organization._id}/members/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ requestUserId: user.id })
            });

            if (!response.ok) throw new Error('Failed to remove member');

            await fetchOrganizationData();
            alert('Member removed successfully!');
        } catch (err) {
            alert('Error removing member: ' + err.message);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading organization settings...</div>;
    }

    if (error && !organization) {
        return <div style={{ padding: '20px', color: '#991b1b' }}>Error: {error}</div>;
    }

    if (!organization) {
        return (
            <div style={{ padding: '20px' }}>
                <p>No organization found. You need to create an organization first.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1000px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '600' }}>
                Organization Settings
            </h2>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #ef4444',
                    color: '#991b1b',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            {/* Organization Details */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                    Organization Details
                </h3>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Organization Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            resize: 'vertical'
                        }}
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        padding: '10px 20px',
                        background: saving ? '#9ca3af' : '#2D5016',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Invite Code */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    Organization Invite Code
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
                    Share this code with new members to invite them to your organization.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                        flex: 1,
                        background: 'var(--input-bg)',
                        border: '2px solid #2D5016',
                        borderRadius: '6px',
                        padding: '12px',
                        fontFamily: 'monospace',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#2D5016',
                        textAlign: 'center',
                        letterSpacing: '1px'
                    }}>
                        {organization.inviteCode}
                    </div>
                    <button
                        onClick={copyInviteCode}
                        style={{
                            padding: '12px 20px',
                            background: copied ? '#10b981' : '#2D5016',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                </div>

                <button
                    onClick={regenerateInviteCode}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: '#dc2626',
                        border: '1px solid #dc2626',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Regenerate Code
                </button>
            </div>

            {/* Subscription Info */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    Subscription
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                            {organization.subscription.status}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Plan</div>
                        <div style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                            {organization.subscription.plan}
                        </div>
                    </div>
                </div>
                {organization.subscription.trialEndsAt && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '6px' }}>
                        <strong>Trial ends:</strong> {new Date(organization.subscription.trialEndsAt).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Members List */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                    Members ({members.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {members.map(member => (
                        <div
                            key={member._id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                    src={member.picture}
                                    alt={member.name}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600' }}>{member.name}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {member.email}
                                    </div>
                                </div>
                                {member.isOwner && (
                                    <span style={{
                                        padding: '4px 8px',
                                        background: '#fbbf24',
                                        color: '#78350f',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        Owner
                                    </span>
                                )}
                                {member.isAdmin && !member.isOwner && (
                                    <span style={{
                                        padding: '4px 8px',
                                        background: '#3b82f6',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        Admin
                                    </span>
                                )}
                            </div>

                            {!member.isOwner && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!member.isAdmin && (
                                        <button
                                            onClick={() => promoteToAdmin(member._id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#2D5016',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Promote to Admin
                                        </button>
                                    )}
                                    {member.isAdmin && (
                                        <button
                                            onClick={() => demoteAdmin(member._id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#f59e0b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Demote
                                        </button>
                                    )}
                                    <button
                                        onClick={() => removeMember(member._id)}
                                        style={{
                                            padding: '6px 12px',
                                            background: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OrganizationSettings;
