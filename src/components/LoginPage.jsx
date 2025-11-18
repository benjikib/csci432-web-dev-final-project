import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.js';
import { useTheme } from '../context/ThemeContext';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(false); // Default to signup
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        communityCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refetchSettings } = useTheme();

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/committees');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    email: formData.email,
                    password: formData.password,
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    communityCode: formData.communityCode
                };

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Fetch user settings (including theme) after login
            await refetchSettings();

            // Navigate to committees
            navigate('/committees');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            communityCode: ''
        });
    };

    return (
        <div className="integrated-landing-page">
            {/* Left Section - Branding */}
            <div className="branding-section">
                <div className="branding-content">
                    <span className="main-logo-font site-name">Commie</span>
                    <img src="/logo.png" alt="Logo" className="main-logo"></img>
                    <p className="tagline">Collaborate and make decisions with ease on a single, simple platform.</p>
                    <p className="attribution">Based on Robert's Rules of Order (RONR)</p>
                </div>
            </div>

            {/* Right Section - Login/Signup Form */}
            <div className="auth-section">
                <div className="login-container">
                    <div className="login-card">
                        <h3 className="login-title">
                            Join YOUR Community
                        </h3>

                        {/* Tabs */}
                        <div className="input-row" style={{marginBottom: '24px'}}>
                            <div
                                onClick={() => setIsLogin(false)}
                                className={`login-option ${!isLogin ? 'active' : ''}`}
                            >
                                Join
                            </div>
                            <div
                                onClick={() => setIsLogin(true)}
                                className={`login-option ${isLogin ? 'active' : ''}`}
                            >
                                Log In
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{width: '100%'}}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="login-input"
                            />

                            {!isLogin && (
                                <div style={{display: 'flex', gap: '10px', marginBottom: '16px'}}>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="login-input"
                                        style={{flex: 1}}
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="login-input"
                                        style={{flex: 1}}
                                    />
                                </div>
                            )}

                            {!isLogin && (
                                <input
                                    type="text"
                                    name="communityCode"
                                    placeholder="Community Code"
                                    value={formData.communityCode}
                                    onChange={handleInputChange}
                                    className="login-input"
                                />
                            )}

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength={6}
                                className="login-input"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    marginTop: '20px',
                                    padding: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
                            </button>
                        </form>

                        <p className="terms">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
