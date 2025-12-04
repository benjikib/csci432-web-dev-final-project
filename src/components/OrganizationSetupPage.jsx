import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';

function OrganizationSetupPage() {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { organizationId } = useParams();

    useEffect(() => {
        fetchOrganization();
    }, [organizationId]);

    const fetchOrganization = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/organizations/${organizationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch organization');

            const data = await response.json();
            setOrganization(data);
        } catch (error) {
            console.error('Error fetching organization:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(organization.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleContinue = () => {
        navigate('/committees');
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
    }

    if (!organization) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Organization not found</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, #2D5016 0%, #54966D 100%)'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                maxWidth: '700px',
                width: '100%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#2D5016' }}>
                        Organization Created!
                    </h1>
                    <p style={{ color: '#666', fontSize: '18px', fontWeight: '600' }}>
                        {organization.name}
                    </p>
                </div>

                <div style={{
                    background: '#f0f9f4',
                    border: '2px solid #54966D',
                    borderRadius: '8px',
                    padding: '24px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#2D5016', fontSize: '20px' }}>
                        📋 Your Organization Invite Code
                    </h3>
                    <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
                        Share this code with members to invite them to your organization. They'll need to enter this code when signing up.
                    </p>
                    
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            flex: 1,
                            background: 'white',
                            border: '2px solid #2D5016',
                            borderRadius: '8px',
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#2D5016',
                            textAlign: 'center',
                            letterSpacing: '2px'
                        }}>
                            {organization.inviteCode}
                        </div>
                        <button
                            onClick={copyInviteCode}
                            style={{
                                padding: '16px 24px',
                                background: copied ? '#10b981' : '#2D5016',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                <div style={{
                    background: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '32px'
                }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>⚠️ Important:</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#78350f' }}>
                        <li>Keep this code secure - anyone with it can join your organization</li>
                        <li>You can regenerate this code anytime from the admin panel</li>
                        <li>New members will have "member" role by default</li>
                        <li>You can promote members to admin in the system settings</li>
                    </ul>
                </div>

                <div style={{
                    background: '#eff6ff',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '32px'
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#1e40af' }}>🚀 Next Steps:</h4>
                    <ol style={{ margin: 0, paddingLeft: '20px', color: '#1e3a8a' }}>
                        <li>Share the invite code with your members</li>
                        <li>Create committees for different groups or topics</li>
                        <li>Set up your first motions and start voting</li>
                        <li>Customize organization settings in the admin panel</li>
                    </ol>
                </div>

                <button
                    onClick={handleContinue}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: '#2D5016',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#3f6b21'}
                    onMouseOut={(e) => e.target.style.background = '#2D5016'}
                >
                    Go to Dashboard
                </button>

                <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    You can always find this code in Admin Panel → System Settings
                </p>
            </div>
        </div>
    );
}

export default OrganizationSetupPage;
