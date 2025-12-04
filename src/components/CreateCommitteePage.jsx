import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { createCommittee } from '../services/committeeApi';
import { getUsersList, getCurrentUser, isAdmin } from '../services/userApi';
import { useNavigationBlock } from '../context/NavigationContext';

function CreateCommitteePage() {
    const navigate = useNavigate();
    const [searchedTerm, setSearchedTerm] = useState("");
    const { blockNavigation, unblockNavigation, confirmNavigation } = useNavigationBlock();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        members: []
    });

    const [potentialUsers, setPotentialUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]); // { _id, name, email, role }
    const [isAdminUser, setIsAdminUser] = useState(false);

    // Check if form has been modified
    const checkIfModified = (data) => {
        return data.title.trim() !== "" ||
               data.description.trim() !== "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = {
            ...formData,
            [name]: value
        };
        setFormData(newFormData);
        const isModified = checkIfModified(newFormData);
        setHasUnsavedChanges(isModified);

        // Block/unblock navigation based on whether form is modified
        if (isModified) {
            blockNavigation();
        } else {
            unblockNavigation();
        }
    };

    // Warn user before leaving page with unsaved changes (browser close/refresh)
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    // Clean up navigation blocking when component unmounts
    useEffect(() => {
        return () => {
            unblockNavigation();
        };
    }, [unblockNavigation]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdminUser) {
            alert('Only administrators can create committees');
            return;
        }

        // Validate form
        if (!formData.title.trim() || !formData.description.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            // Create new committee
            // Build members and chair from selectedMembers
            // Build role-aware members, as objects { userId, role }
            const members = selectedMembers.map(sm => ({ userId: sm._id || sm.id, role: sm.role || 'member' }));
            const chairObj = selectedMembers.find(sm => sm.role === 'chair');
            const newCommittee = {
                title: formData.title,
                description: formData.description,
                members,
                chair: chairObj ? (chairObj._id || chairObj.id) : null
            };

            // Add committee via API
            const result = await createCommittee(newCommittee);
            const createdCommittee = result.committee;

            // Clear unsaved changes and unblock navigation
            setHasUnsavedChanges(false);
            unblockNavigation();

            // Navigate to the new committee page using slug if available
            setTimeout(() => {
                navigate(`/committee/${createdCommittee.slug || createdCommittee._id}`);
            }, 0);
        } catch (error) {
            console.error('Error creating committee:', error);
            alert(`Failed to create committee: ${error.message}`);
        }
    };

    // Fetch potential users for selection (admin-only)
    useEffect(() => {
        let mounted = true;
        async function fetchUsers() {
            try {
                // Check current user role
                const current = await getCurrentUser();
                const admin = current && current.user && isAdmin(current.user);
                if (mounted) {
                    setIsAdminUser(Boolean(admin));
                    // Redirect non-admin users away from this page
                    if (!admin) {
                        navigate('/committees');
                        return;
                    }
                }

                const res = await getUsersList(userSearch, 1, 50);
                if (res && res.success && mounted) {
                    // Filter out any already-selected members
                    const filtered = res.users.filter(u => !selectedMembers.some(sm => String(sm._id || sm.id) === String(u._id)));
                    setPotentialUsers(filtered);
                }
            } catch (err) {
                console.error('Error fetching users list:', err);
                navigate('/login');
            }
        }

        fetchUsers();
        return () => { mounted = false; };
    }, [userSearch, selectedMembers, navigate]);

    const addSelectedMember = (user, role = 'member') => {
        setSelectedMembers(prev => [...prev, { _id: user._id, name: user.name, email: user.email, role }]);
        setPotentialUsers(prev => prev.filter(u => String(u._id) !== String(user._id)));
    };

    const removeSelectedMember = (userId) => {
        setSelectedMembers(prev => prev.filter(s => String(s._id) !== String(userId)));
    };

    const handleCancel = () => {
        if (hasUnsavedChanges && !confirmNavigation()) {
            return;
        }
        unblockNavigation();
        navigate('/committees');
    };

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="max-w-4xl">
                    <h2 className="section-title dark:text-gray-100">Create New Committee</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Add a new committee to organize motions and discussions
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Field */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Committee Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Finance Committee"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        {/* Description Field */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Committee Description <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Describe the purpose and responsibilities of this committee
                            </p>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="e.g., Oversees budget, financial planning, and expense approvals for the community."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        {/* Action Buttons */}
                        {isAdminUser ? (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Add Members</label>

                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Search users to add"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full px-3 py-2 border rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </div>

                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Members</div>
                                    <div className="space-y-2">
                                        {selectedMembers.map(member => (
                                            <div key={member._id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{member.name} <span className="text-xs text-gray-500">({member.role})</span></div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => removeSelectedMember(member._id)} className="px-2 py-1 bg-red-600 text-white rounded text-sm">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Add from users</div>
                                <div className="space-y-2 max-h-48 overflow-auto">
                                    {potentialUsers.map(user => (
                                        <div key={user._id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                            <div>
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select defaultValue="member" id={`role-${user._id}`} className="mr-2 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-sm">
                                                    <option value="member">Member</option>
                                                    <option value="guest">Guest</option>
                                                    <option value="chair">Chair</option>
                                                </select>
                                                <button type="button" onClick={() => {
                                                    const sel = document.getElementById(`role-${user._id}`);
                                                    const role = sel ? sel.value : 'member';
                                                    addSelectedMember(user, role);
                                                }} className="px-3 py-1 bg-darker-green text-white rounded text-sm">Add</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Only administrators can add members during committee creation. You can add members later in the committee settings.</p>
                            </div>
                        )}
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isAdminUser}
                                className={"px-6 py-2 !bg-lighter-green !text-white rounded-lg font-semibold transition-all hover:scale-105 !border-none " + (isAdminUser ? 'hover:!bg-darker-green' : 'opacity-50 cursor-not-allowed')}
                            >
                                Create Committee
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateCommitteePage;
