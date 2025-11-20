import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import Tabs from './reusable/Tabs';
import { getCurrentUser, isAdmin } from '../services/userApi';
import { API_BASE_URL } from '../config/api.js';

function AdminPanel() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [committees, setCommittees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [activeTab, setActiveTab] = useState("users");

    // Check if user is admin and fetch data
    useEffect(() => {
        async function checkAdminAndFetchData() {
            try {
                setLoading(true);
                const userData = await getCurrentUser();

                if (!isAdmin(userData)) {
                    navigate('/home');
                    return;
                }

                setCurrentUser(userData);

                // Fetch all users
                const usersResponse = await fetch(`${API_BASE_URL}/auth/users`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!usersResponse.ok) {
                    throw new Error('Failed to fetch users');
                }

                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);

                // Fetch all committees
                const committeesResponse = await fetch(`${API_BASE_URL}/committees/1`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (committeesResponse.ok) {
                    const committeesData = await committeesResponse.json();
                    setCommittees(committeesData.committees || []);
                }
            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }

        checkAdminAndFetchData();
    }, [navigate]);

    const handleEditUser = (user) => {
        setEditingUser({
            id: user.id,
            name: user.name,
            roles: user.roles || [],
            permissions: user.permissions || []
        });
        setSuccessMessage("");
        setError(null);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    const handleRoleToggle = (role) => {
        setEditingUser(prev => {
            const hasRole = prev.roles.includes(role);
            return {
                ...prev,
                roles: hasRole
                    ? prev.roles.filter(r => r !== role)
                    : [...prev.roles, role]
            };
        });
    };

    const handleSaveUser = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccessMessage("");

            const response = await fetch(`${API_BASE_URL}/auth/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    roles: editingUser.roles,
                    permissions: editingUser.permissions
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const data = await response.json();

            // Update local users list
            setUsers(users.map(u =>
                u.id === editingUser.id
                    ? { ...u, roles: data.user.roles, permissions: data.user.permissions }
                    : u
            ));

            setSuccessMessage('User updated successfully!');
            setTimeout(() => setSuccessMessage(""), 3000);
            setEditingUser(null);
        } catch (err) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-20 px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="text-gray-600 dark:text-gray-400">Loading...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-20 px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="max-w-6xl mx-auto">
                    <h2 className="section-title dark:text-gray-100">Admin Panel</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Manage users, committees, and system settings</p>

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

                    {/* Tabs */}
                    <Tabs
                        tabs={[
                            { id: "users", label: "Users" },
                            { id: "committees", label: "Committees" },
                            { id: "system", label: "System" }
                        ]}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div>
                            {/* Users Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Roles
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {user.picture ? (
                                                        <img
                                                            src={user.picture}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full mr-3"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-lighter-green flex items-center justify-center text-white font-semibold mr-3">
                                                            {user.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.settings?.displayName || 'No display name'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles?.map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                                role === 'admin'
                                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            }`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-lighter-green hover:text-darker-green font-medium"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No users found
                        </div>
                    )}
                        </div>
                    )}

                    {/* Committees Tab */}
                    {activeTab === "committees" && (
                        <div>
                            {/* Committees Table */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Committee
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Slug
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Members
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Motions
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {committees.map((committee) => (
                                                <tr key={committee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {committee.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {committee.description?.substring(0, 50) || 'No description'}
                                                            {committee.description?.length > 50 ? '...' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {committee.slug || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {committee.members?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                        {committee.motions?.length || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            onClick={() => navigate(`/committee/${committee.slug || committee._id}`)}
                                                            className="text-lighter-green hover:text-darker-green font-medium"
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {committees.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No committees found
                                </div>
                            )}
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === "system" && (
                        <div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Settings</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    System configuration and settings will be available here.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Edit User Roles & Permissions
                            </h3>

                            <div className="space-y-6">
                                {/* Roles Section */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        Roles
                                    </label>
                                    <div className="space-y-2">
                                        {['admin', 'member', 'chair', 'guest'].map(role => (
                                            <label key={role} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={editingUser.roles.includes(role)}
                                                    onChange={() => handleRoleToggle(role)}
                                                    className="mr-2 h-4 w-4 text-lighter-green focus:ring-lighter-green border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                                    {role}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={saving}
                                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveUser}
                                        disabled={saving}
                                        className="px-4 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all !border-none disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminPanel;
