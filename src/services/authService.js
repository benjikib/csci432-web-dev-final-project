import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Sync Auth0 user with backend database
 * This should be called after a user successfully authenticates with Auth0
 */
export async function syncAuth0User(auth0User) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/auth0/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth0Id: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name,
        picture: auth0User.picture,
        emailVerified: auth0User.email_verified
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to sync user with backend');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error syncing Auth0 user:', error);
    throw error;
  }
}

/**
 * Get current user profile from backend by auth0Id
 */
export async function getUserByAuth0Id(auth0Id) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/auth0/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        auth0Id,
        email: 'temp@temp.com', // Will be ignored if user exists
        name: 'Temp' // Will be ignored if user exists
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

/**
 * Custom hook to handle Auth0 user synchronization
 * Use this in your components to automatically sync users with the backend
 */
export function useAuth0Sync() {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [backendUser, setBackendUser] = useState(null);

  const syncUser = async (getAccessTokenSilently) => {
    try {
      setSyncStatus('syncing');
      const token = await getAccessTokenSilently();
      const user = await syncAuth0User(token);
      setBackendUser(user);
      setSyncStatus('success');
      return user;
    } catch (error) {
      setSyncStatus('error');
      console.error('Failed to sync user:', error);
      return null;
    }
  };

  return { syncStatus, backendUser, syncUser };
}
