import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        communityCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                    name: formData.name,
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
            name: '',
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
                            {isLogin ? 'Welcome Back' : 'Join YOUR Community'}
                        </h3>

                        <div className="input-row">
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                                {isLogin
                                    ? 'Sign in to your account'
                                    : 'Create an account to get started'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full">
                            {!isLogin && (
                                <div className="input-row mb-4">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required={!isLogin}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54966D] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="input-row mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54966D] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            <div className="input-row mb-4">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54966D] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>

                            {!isLogin && (
                                <div className="input-row mb-4">
                                    <input
                                        type="text"
                                        name="communityCode"
                                        placeholder="Community Code (optional)"
                                        value={formData.communityCode}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#54966D] dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            )}

                            <div className="flex justify-center w-full mb-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="
                                        rounded-lg border-[1px] border-transparent
                                        px-[1.2em] py-[0.6em]
                                        text-white bg-[#54966D] hover:bg-[#5ca377]
                                        font-medium font-inherit
                                        cursor-pointer
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transition-all
                                        w-full
                                    "
                                >
                                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                </button>
                            </div>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="text-[#54966D] hover:text-[#5ca377] underline"
                                >
                                    {isLogin
                                        ? "Don't have an account? Sign up"
                                        : 'Already have an account? Sign in'}
                                </button>
                            </div>
                        </form>

                        <a className="terms">By signing in, you agree to our Terms of Service and Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
