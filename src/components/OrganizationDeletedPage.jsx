import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyInviteCode, joinOrganization } from '../services/organizationApi';
import { deleteUser, getCurrentUser } from '../services/userApi';

function OrganizationDeletedPage() {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifiedOrg, setVerifiedOrg] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await getCurrentUser();
                setUser(res.user);
            } catch (err) {
                console.error('Error fetching user:', err);
            }
        };
        fetchUser();
    }, []);

    const handleVerifyCode = async () => {
        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await verifyInviteCode(inviteCode);
            
            if (result.valid) {
                setVerifiedOrg(result.organization);
            } else {
                setError('Invalid invite code. Please check and try again.');
                setVerifiedOrg(null);
            }
        } catch (err) {
            setError('Error verifying invite code');
            setVerifiedOrg(null);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinOrganization = async () => {
        if (!verifiedOrg) return;

        setLoading(true);
        setError('');

        try {
            const result = await joinOrganization(verifiedOrg._id, inviteCode);
            
            if (result.success) {
                // Refresh user data and redirect
                window.location.href = '/home';
            } else {
                setError(result.error || 'Failed to join organization');
            }
        } catch (err) {
            setError('Error joining organization');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account?\n\n' +
            'This will:\n' +
            '- Permanently remove your account\n' +
            '- Delete all your data\n' +
            '- Log you out immediately\n\n' +
            'This action CANNOT be undone!'
        );

        if (!confirmed) return;

        const confirmText = window.prompt('Type "DELETE MY ACCOUNT" to confirm:');

        if (confirmText !== 'DELETE MY ACCOUNT') {
            setError('Confirmation text did not match. Deletion cancelled.');
            return;
        }

        setLoading(true);

        try {
            const userResponse = await getCurrentUser();
            if (userResponse.success) {
                const result = await deleteUser(userResponse.user.id);
                
                if (result.success) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setError(result.message || 'Failed to delete account');
                }
            }
        } catch (err) {
            setError('Error deleting account');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrganization = () => {
        if (!user) {
            setError('User data not loaded. Please refresh the page.');
            return;
        }
        // Redirect to subscription/payment page with userId
        navigate('/organization/payment', { state: { userId: user._id } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                {/* Warning Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-5xl">warning</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Organization Removed
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        The organization you were part of has been deleted. Please choose an option below to continue.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Option 1: Join Another Organization */}
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">group_add</span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Join Another Organization
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter an invite code to join an existing organization
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value);
                                    setVerifiedOrg(null);
                                    setError('');
                                }}
                                placeholder="Enter invite code"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            {verifiedOrg && (
                                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                                        ✓ Valid code for: {verifiedOrg.name}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={handleVerifyCode}
                                    disabled={loading || !inviteCode.trim()}
                                    className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                                {verifiedOrg && (
                                    <button
                                        onClick={handleJoinOrganization}
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 !bg-blue-600 !text-white rounded-lg font-semibold hover:!bg-blue-700 transition-all !border-none disabled:opacity-50"
                                    >
                                        Join Organization
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Option 2: Create Your Own Organization */}
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-300 dark:hover:border-green-600 transition-all">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">add_business</span>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                    Create Your Own Organization
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Subscribe and start a new organization
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateOrganization}
                            disabled={loading}
                            className="w-full px-4 py-2 !bg-green-600 !text-white rounded-lg font-semibold hover:!bg-green-700 transition-all !border-none disabled:opacity-50"
                        >
                            Subscribe & Create Organization
                        </button>
                    </div>

                    {/* Option 3: Delete Account */}
                    <div className="border-2 border-red-200 dark:border-red-800 rounded-xl p-6 hover:border-red-300 dark:hover:border-red-700 transition-all bg-red-50/50 dark:bg-red-900/10">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">person_remove</span>
                            <div>
                                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-1">
                                    Delete My Account
                                </h3>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="w-full px-4 py-2 !bg-red-600 !text-white rounded-lg font-semibold hover:!bg-red-700 transition-all !border-none disabled:opacity-50"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>

                {/* Logout Option */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrganizationDeletedPage;
