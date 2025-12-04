import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';
import { getCurrentUser } from '../services/userApi';

function OrganizationPaymentPage() {
    const [formData, setFormData] = useState({
        organizationName: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initializePage = async () => {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Always fetch current user to get userId
            try {
                const response = await getCurrentUser();
                // console.log('getCurrentUser response:', response);
                if (response && response.user) {
                    // Use 'id' field from the user object
                    const userIdValue = response.user._id || response.user.id;
                    // console.log('Setting userId:', userIdValue);
                    setUserId(userIdValue);
                } else {
                    console.error('No user in response');
                    navigate('/login');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                navigate('/login');
            }
        };
        
        initializePage();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // console.log('Submitting with userId:', userId);
        
        if (!userId) {
            setError('User information not loaded. Please refresh the page.');
            return;
        }
        
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // console.log('Creating organization with:', {
            //     name: formData.organizationName,
            //     description: formData.description,
            //     userId: userId
            // });
            
            // Create organization (mock payment - will integrate Stripe later)
            const response = await fetch(`${API_BASE_URL}/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.organizationName,
                    description: formData.description,
                    userId: userId,
                    subscriptionData: {
                        status: 'trial',
                        plan: 'basic'
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization');
            }

            // Update user in localStorage with organization info
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.organizationId = data._id;
                user.organizationRole = 'admin';
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Use window.location to force full page reload and refresh user session
            window.location.href = `/organization/${data._id}/setup`;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#2D5016' }}>
                        🎉 Create Your Organization
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        Start your 30-day free trial (No payment required yet)
                    </p>
                </div>

                <div style={{
                    background: '#f0f9f4',
                    border: '2px solid #54966D',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '32px'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#2D5016' }}>✨ What's Included:</h3>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
                        <li>Up to 50 users</li>
                        <li>10 committees</li>
                        <li>Unlimited motions and voting</li>
                        <li>Full Robert's Rules of Order compliance</li>
                        <li>Email notifications</li>
                        <li>Basic reporting</li>
                    </ul>
                </div>

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

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Organization Name *
                        </label>
                        <input
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleInputChange}
                            required
                            placeholder="e.g., Maple Street HOA, Community Board"
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Brief description of your organization..."
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !userId}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: (loading || !userId) ? '#9ca3af' : '#2D5016',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            fontWeight: '600',
                            cursor: (loading || !userId) ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => !loading && userId && (e.target.style.background = '#3f6b21')}
                        onMouseOut={(e) => !loading && userId && (e.target.style.background = '#2D5016')}
                    >
                        {loading ? 'Creating...' : !userId ? 'Loading...' : 'Start Free Trial'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                    💳 Payment will be required after the trial period ends.
                    <br />
                    Cancel anytime during the trial with no charges.
                </p>
            </div>
        </div>
    );
}

export default OrganizationPaymentPage;
