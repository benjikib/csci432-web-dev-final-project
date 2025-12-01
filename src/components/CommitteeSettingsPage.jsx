import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getCommitteeById, updateCommittee, deleteCommittee, getCommitteeMembers, getPotentialMembers, addMember, removeMember } from "../services/committeeApi"
import { getCurrentUser } from '../services/userApi'
import NoAccessPage from './NoAccessPage'

function CommitteeSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [committee, setCommittee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState("");

    // Local state for committee settings
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [members, setMembers] = useState([]);
    const [potentialMembers, setPotentialMembers] = useState([]);
    const [addRoleSelection, setAddRoleSelection] = useState({});
    const [memberSearch, setMemberSearch] = useState('');
    const [potentialSearch, setPotentialSearch] = useState('');
    const [membersLoading, setMembersLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(null);

    // Helper: normalize and check various name fields for search
    function userMatchesSearch(u, search) {
        if (!search) return true;
        const s = (search || '').toLowerCase().trim();
        if (!s) return true;

        // Compose candidate display name values
        const candidates = [];
        if (u.name) candidates.push(u.name);
        if (u.settings && u.settings.displayName) candidates.push(u.settings.displayName);
        if (u.username) candidates.push(u.username);
        // support older/sample fields first_name/last_name
        if (u.first_name || u.last_name) candidates.push(`${u.first_name || ''} ${u.last_name || ''}`.trim());

        // Check candidates
        for (const c of candidates) {
            if (!c) continue;
            if (String(c).toLowerCase().includes(s)) return true;
        }

        // Check email
        if (u.email && String(u.email).toLowerCase().includes(s)) return true;

        return false;
    }

    // Helper: determine if a member is a guest for this committee
    function memberIsGuest(member) {
        try {
            // Prefer role-aware field from server (committeeRole property set by endpoint)
            if (member.committeeRole) return member.committeeRole === 'guest';
            const gc = member.guestCommittees || member.guest || [];
            const cid = String((committee && (committee._id || committee.id)) || id);
            if (!Array.isArray(gc)) return false;
            return gc.map(String).includes(cid);
        } catch (e) {
            return false;
        }
    }

    // Fetch committee from API
    useEffect(() => {
        async function fetchCommittee() {
            try {
                setLoading(true);
                const data = await getCommitteeById(id);
                const fetchedCommittee = data.committee || data;
                setCommittee(fetchedCommittee);
                setTitle(fetchedCommittee.title || "");
                setDescription(fetchedCommittee.description || "");
                // Fetch members and potential members
                // Ensure we pass a string id (ObjectId may be returned as object)
                const committeeId = fetchedCommittee._id ? String(fetchedCommittee._id) : id;
                fetchMembers(committeeId);
            } catch (err) {
                console.error('Error fetching committee:', err);
                setError(err.message || 'Failed to load committee');
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchCommittee();
        }
    }, [id]);

    // Fetch members and potential members
    async function fetchMembers(committeeId) {
        try {
            setMembersLoading(true);
            const mRes = await getCommitteeMembers(committeeId);
            if (mRes.success) {
                setMembers(mRes.members || []);
            }
            const pRes = await getPotentialMembers(committeeId);
            if (pRes.success) {
                setPotentialMembers(pRes.users || []);
            }
            // Determine access based on current user and members list
            try {
                const current = await getCurrentUser();
                const user = current && current.user ? current.user : null;
                // Only allow admins or the committee chair/owner to access settings
                let allowed = false;
                if (user && user.roles && user.roles.includes('admin')) allowed = true;
                if (!allowed && committee && (user && user.id)) {
                    const uid = String(user.id || user._id || user.id);
                    if (String(committee.chair || '') === uid || String(committee.owner || '') === uid) allowed = true;
                }
                setHasAccess(Boolean(allowed));
            } catch (e) {
                setHasAccess(false);
            }
        } catch (err) {
            console.error('Error fetching member lists:', err);
        } finally {
            setMembersLoading(false);
        }
    }

    if (loading) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="motions-section">
                        <h2 className="section-title dark:text-gray-100">Loading...</h2>
                    </div>
                </div>
            </>
        );
    }

    if (error || !committee) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="motions-section">
                        <h2 className="section-title dark:text-gray-100">Committee Not Found</h2>
                        {/* Error Banner */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
                            Failed to load committee settings
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (hasAccess === false) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="motions-section">
                        <NoAccessPage committeeId={id} committeeTitle={committee?.title} />
                    </div>
                </div>
            </>
        );
    }

    const handleSave = async () => {
        try {
            const updates = {
                title,
                description
            };

            const result = await updateCommittee(id, updates);
            const updatedCommittee = result.committee;

            alert("Settings saved successfully!");

            // Navigate back to committee page using the NEW slug from the response
            // Use replace to avoid back button issues
            navigate(`/committee/${updatedCommittee.slug || updatedCommittee._id}`, { replace: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            alert(`Failed to save settings: ${error.message}`);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${committee.title}"? This action cannot be undone. All motions and history will be permanently deleted.`)) {
            return;
        }

        try {
            await deleteCommittee(id);
            alert("Committee deleted successfully");
            navigate('/committees');
        } catch (error) {
            console.error('Error deleting committee:', error);
            alert(`Failed to delete committee: ${error.message}`);
        }
    };

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="motions-section">
                    <h2 className="section-title dark:text-gray-100">{committee.title} Settings</h2>

                    <div className="max-w-2xl mt-8 space-y-6">
                        {/* Committee Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Committee Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-darker-green focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter committee title"
                            />
                        </div>

                        {/* Committee Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-darker-green focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Enter committee description"
                            />
                        </div>

                        {/* Members Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Members
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-600">
                                <div className="mb-3 flex items-center gap-3">
                                    <p className="text-gray-600 dark:text-gray-400">{members.length} members</p>
                                    <input
                                        type="text"
                                        placeholder="Search members"
                                        value={memberSearch}
                                        onChange={(e) => setMemberSearch(e.target.value)}
                                        className="ml-auto px-2 py-1 border rounded bg-white dark:bg-gray-700 text-sm"
                                    />
                                </div>

                                {membersLoading ? (
                                    <p className="text-gray-500">Loading members...</p>
                                ) : (
                                    <div className="space-y-2">
                                        {members.filter(m => (
                                            userMatchesSearch(m, memberSearch)
                                        )).map(member => (
                                            <div key={member._id || member.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {member.name}
                                                        {(member.committeeRole === 'chair' || (committee.chair && (member._id || member.id) === (committee.chair || ''))) ? (
                                                            <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Chair</span>
                                                        ) : null}
                                                        {(member.committeeRole === 'owner' || (committee.owner && (member._id || member.id) === (committee.owner || ''))) ? (
                                                            <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Owner</span>
                                                        ) : null}
                                                        {memberIsGuest(member) ? (
                                                            <span className="ml-2 inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-0.5 rounded">Guest</span>
                                                        ) : null}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    { /* If this member is the chair, show Demote button */ }
                                                    {(committee.chair && (member._id || member.id) === (committee.chair || '')) ? (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Demote ${member.name} from Chair?`)) return;
                                                                try {
                                                                    // Set chair to null
                                                                    await updateCommittee(id, { chair: null });
                                                                    // Refresh committee and lists
                                                                    const refreshed = await getCommitteeById(id);
                                                                    setCommittee(refreshed.committee || refreshed);
                                                                    fetchMembers(id);
                                                                } catch (err) {
                                                                    console.error('Error demoting chair:', err);
                                                                    alert('Failed to demote chair');
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                                                        >
                                                            Demote
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Promote ${member.name} to Chair? This will replace the current chair.`)) return;
                                                                try {
                                                                    await addMember(id, member._id || member.id, 'chair');
                                                                    // Refresh committee and lists
                                                                    const refreshed = await getCommitteeById(id);
                                                                    setCommittee(refreshed.committee || refreshed);
                                                                    fetchMembers(id);
                                                                } catch (err) {
                                                                    console.error('Error promoting member:', err);
                                                                    alert('Failed to promote member');
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                                        >
                                                            Promote to Chair
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`Remove ${member.name} from ${committee.title}?`)) return;
                                                            try {
                                                                await removeMember(id, member._id || member.id);
                                                                // Refresh lists
                                                                fetchMembers(id);
                                                            } catch (err) {
                                                                console.error('Error removing member:', err);
                                                                alert('Failed to remove member');
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold mb-2">Add Members</h4>
                                    <input
                                        type="text"
                                        placeholder="Search users to add"
                                        value={potentialSearch}
                                        onChange={(e) => setPotentialSearch(e.target.value)}
                                        className="w-full px-2 py-1 mb-3 border rounded bg-white dark:bg-gray-700 text-sm"
                                    />

                                    <div className="space-y-2 max-h-48 overflow-auto">
                                        {potentialMembers.filter(u => (
                                            userMatchesSearch(u, potentialSearch)
                                        )).map(user => (
                                            <div key={user._id || user.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                                <div>
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={addRoleSelection[user._id || user.id] || 'member'}
                                                        onChange={(e) => setAddRoleSelection(prev => ({ ...prev, [user._id || user.id]: e.target.value }))}
                                                        className="mr-2 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-sm"
                                                    >
                                                        <option value="member">Member</option>
                                                        <option value="guest">Guest</option>
                                                        <option value="chair">Chair</option>
                                                    </select>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const role = addRoleSelection[user._id || user.id] || 'member';
                                                                await addMember(id, user._id || user.id, role);
                                                                fetchMembers(id);
                                                            } catch (err) {
                                                                console.error('Error adding member:', err);
                                                                alert('Failed to add member');
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-darker-green text-white rounded text-sm"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Save Button */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-darker-green text-white rounded-lg hover:bg-superlight-green transition-colors font-medium"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-6 mt-8">
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete Committee
                            </button>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                This action cannot be undone. All motions and history will be permanently deleted.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CommitteeSettingsPage
