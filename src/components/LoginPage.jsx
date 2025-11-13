import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const { loginWithRedirect, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();

    // Redirect to committees if already authenticated
    useEffect(() => {
        async function handleAuthenticated() {
            if (isAuthenticated) {
                try {
                    // Get and store the Auth0 access token with explicit audience
                    const token = await getAccessTokenSilently({
                        authorizationParams: {
                            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                        }
                    });
                    localStorage.setItem('auth0_token', token);
                } catch (err) {
                    console.error('Error getting access token:', err);
                }
                navigate('/committees');
            }
        }
        handleAuthenticated();
    }, [isAuthenticated, navigate, getAccessTokenSilently]);

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

        {/* Right Section - Auth0 Login */}
        <div className="auth-section">
            <div className="login-container">
                <div className="login-card">
                    <h3 className="login-title">Join YOUR Community</h3>

                    <div className="input-row">
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                            Sign in or create an account to get started
                        </p>
                    </div>

                    <div className="flex justify-center w-full mb-2">
                        <button
                            onClick={() => loginWithRedirect()}
                            disabled={isLoading}
                            className="
                                rounded-lg border-[1px] border-transparent
                                px-[1.2em] py-[0.6em]
                                text-white bg-[#54966D] hover:bg-[#5ca377]
                                font-medium font-inherit
                                cursor-pointer
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all
                            "
                        >
                            {isLoading ? 'Loading...' : 'Continue with Auth0'}
                        </button>
                    </div>

                    <a className="terms">By signing in, you agree to our Terms of Service and Privacy Policy</a>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LoginPage
