import { useState, useEffect } from "react"
import HeaderNav from './reusable/HeaderNav'
import SideBar from './reusable/SideBar'
import { getCurrentUser } from '../services/userApi'

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState("");
    const [isEditing, setIsEditing] = useState({ displayName: false, fullName: false });
    const [editedValues, setEditedValues] = useState({ displayName: '', fullName: '' });
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch user data from API when component mounts
    useEffect(() => {
        async function fetchUser() {
            try {
                setLoading(true);
                setError(null);
                const response = await getCurrentUser();
                if (response.success) {
                    setUser(response.user);
                    setEditedValues({
                        displayName: response.user.settings?.displayName || response.user.name || '',
                        fullName: response.user.name || ''
                    });
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError(err.message || 'Failed to load user data');
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    const handleEdit = (field) => {
        setIsEditing({ ...isEditing, [field]: true });
    };

    const handleCancel = (field) => {
        setIsEditing({ ...isEditing, [field]: false });
        // Reset to original values
        setEditedValues({
            ...editedValues,
            [field]: field === 'displayName'
                ? (user.settings?.displayName || user.name || '')
                : (user.name || '')
        });
    };

    const handleSave = async (field) => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage("");

            const updateData = {};
            if (field === 'displayName') {
                updateData.displayName = editedValues.displayName;
            } else if (field === 'fullName') {
                updateData.name = editedValues.fullName;
            }

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth0_token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Profile update error:', response.status, errorData);
                throw new Error(errorData.message || `Failed to update profile (${response.status})`);
            }

            const data = await response.json();

            // Update local user state
            setUser(data.user);
            setIsEditing({ ...isEditing, [field]: false });
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="text-gray-600 dark:text-gray-400">Loading profile...</div>
                </div>
            </>
        );
    }

    if (error || !user) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="max-w-4xl">
                        <h2 className="section-title dark:text-gray-100">My Profile</h2>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
                            Failed to load profile
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="max-w-4xl">
                    <h2 className="section-title dark:text-gray-100">My Profile</h2>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                            {successMessage}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        {user.picture ? (
                            <img
                                src={user.picture}
                                alt={user.settings?.displayName || user.name}
                                className="w-20 h-20 rounded-full border-4 border-lighter-green"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-lighter-green flex items-center justify-center text-white text-2xl font-bold">
                                {(user.settings?.displayName || user.name || 'U')[0].toUpperCase()}
                            </div>
                        )}
                        <div className="ml-6">
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                {user.settings?.displayName || user.name || 'User'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 capitalize">
                                {user.roles?.join(', ') || 'Member'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Display Name - Editable */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Display Name</p>
                            {isEditing.displayName ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editedValues.displayName}
                                        onChange={(e) => setEditedValues({ ...editedValues, displayName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        disabled={saving}
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">This name will appear on motions you create.</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave('displayName')}
                                            disabled={saving}
                                            className="px-4 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all !border-none disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => handleCancel('displayName')}
                                            disabled={saving}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-800 dark:text-gray-100 font-medium">
                                        {user.settings?.displayName || user.name || 'Not set'}
                                    </p>
                                    <button
                                        className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                        onClick={() => handleEdit('displayName')}
                                    >
                                        <span className="material-symbols-outlined">edit_square</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Full Name - Editable */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Full Name</p>
                            {isEditing.fullName ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editedValues.fullName}
                                        onChange={(e) => setEditedValues({ ...editedValues, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        disabled={saving}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave('fullName')}
                                            disabled={saving}
                                            className="px-4 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all !border-none disabled:opacity-50"
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={() => handleCancel('fullName')}
                                            disabled={saving}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-gray-800 dark:text-gray-100 font-medium">{user.name || 'Not set'}</p>
                                    <button
                                        className="absolute top-4 right-4 text-lighter-green hover:text-darker-green"
                                        onClick={() => handleEdit('fullName')}
                                    >
                                        <span className="material-symbols-outlined">edit_square</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Email - Non-editable */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email</p>
                            <p className="text-gray-800 dark:text-gray-100 font-medium">{user.email}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email is managed by Auth0 and cannot be changed here.</p>
                        </div>

                        {user.phoneNumber && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                                <p className="text-gray-800 dark:text-gray-100 font-medium">{user.phoneNumber}</p>
                            </div>
                        )}

                        {user.address && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Address</p>
                                <p className="text-gray-800 dark:text-gray-100 font-medium">{user.address}</p>
                            </div>
                        )}

                        {user.communityCode && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Community Code</p>
                                <p className="text-gray-800 dark:text-gray-100 font-medium">{user.communityCode}</p>
                            </div>
                        )}

                        {user.bio && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bio</p>
                                <p className="text-gray-800 dark:text-gray-100 font-medium">{user.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Account Information */}
                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Account Information</h3>
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Account Created</p>
                                <p className="text-gray-800 dark:text-gray-100 font-medium">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'N/A'}
                                </p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Roles</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role, index) => (
                                            <span
                                                key={index}
                                                className={`px-3 py-1 text-white rounded-full text-sm capitalize font-semibold ${
                                                    role === 'admin'
                                                        ? 'bg-red-600'
                                                        : 'bg-lighter-green'
                                                }`}
                                            >
                                                {role}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</span>
                                    )}
                                </div>
                            </div>

                            {user.permissions && user.permissions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Permissions</p>
                                    <div className="space-y-1">
                                        {user.permissions.map((permission, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-lighter-green">✓</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {permission.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile
