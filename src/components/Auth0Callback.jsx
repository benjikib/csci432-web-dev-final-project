import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { syncAuth0User } from '../services/authService';

/**
 * Auth0 Callback Component
 * This component handles the redirect after Auth0 authentication
 * and syncs the user with the backend database
 */
export default function Auth0Callback() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      if (isLoading) return;

      if (isAuthenticated && user) {
        try {
          // Sync user with backend
          const syncedUser = await syncAuth0User(user);

          // Redirect to committees page
          navigate('/committees');
        } catch (err) {
          console.error('Error during callback:', err);
          setError(err.message);
        }
      } else if (!isLoading && !isAuthenticated) {
        // If not authenticated, redirect to login
        navigate('/');
      }
    }

    handleCallback();
  }, [isAuthenticated, user, isLoading, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#54966D] hover:bg-[#5ca377] text-white rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#54966D] mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Completing authentication...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    </div>
  );
}
