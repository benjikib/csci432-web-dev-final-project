import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getCommitteeById, updateCommittee, deleteCommittee } from "../services/committeeApi"

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
                        <p className="text-red-600 dark:text-red-400 mt-4">{error}</p>
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

            await updateCommittee(id, updates);
            alert("Settings saved successfully!");

            // Navigate back to committee page using slug if available
            navigate(`/committee/${committee.slug || id}`);
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
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {committee.members?.length || 0} members
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Member management will be available once user authentication is implemented.
                                </p>
                            </div>
                        </div>

                        {/* Procedural Settings */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Procedural Settings
                            </label>
                            <div className="border border-gray-300 rounded-lg p-4 space-y-3 dark:bg-gray-800 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">Allow anonymous voting</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">Require discussion before voting</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 dark:text-gray-300">Enable sub-motions</span>
                                    <input type="checkbox" className="w-5 h-5 rounded border-gray-300" />
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
