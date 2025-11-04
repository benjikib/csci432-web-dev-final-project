import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { getCommitteeById } from '../services/committeeApi';
import { createMotion } from '../services/motionApi';
import { useNavigationBlock } from '../context/NavigationContext';

function CreateMotionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [committee, setCommittee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchedTerm, setSearchedTerm] = useState("");
    const { blockNavigation, unblockNavigation, confirmNavigation } = useNavigationBlock();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch committee from API
    useEffect(() => {
        async function fetchCommittee() {
            try {
                setLoading(true);
                const data = await getCommitteeById(id);
                setCommittee(data.committee || data);
            } catch (err) {
                console.error('Error fetching committee:', err);
                setCommittee(null);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchCommittee();
        }
    }, [id]);

    const [formData, setFormData] = useState({
        title: "",
        description: "I move to ",
        fullDescription: ""
    });

    // Check if form has been modified
    const checkIfModified = (data) => {
        return data.title.trim() !== "" ||
               data.description.trim() !== "I move to " ||
               data.fullDescription.trim() !== "";
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

        // Validate form
        if (!formData.title.trim() || !formData.description.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            // Create new motion
            const newMotion = {
                title: formData.title,
                description: formData.description,
                fullDescription: formData.fullDescription || formData.description,
            };

            // Add motion via API
            await createMotion(id, newMotion);

            // Clear unsaved changes and unblock navigation
            setHasUnsavedChanges(false);
            unblockNavigation();

            // Navigate back to committee page using slug if available
            // Use setTimeout to ensure state update completes before navigation
            setTimeout(() => {
                navigate(`/committee/${committee.slug || id}`);
            }, 0);
        } catch (error) {
            console.error('Error creating motion:', error);
            alert(`Failed to create motion: ${error.message}`);
        }
    };

    const handleCancel = () => {
        if (hasUnsavedChanges && !confirmNavigation()) {
            return;
        }
        unblockNavigation();
        navigate(`/committee/${committee?.slug || id}`);
    };

    if (loading) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="max-w-4xl">
                        <h2 className="section-title dark:text-gray-100">Loading...</h2>
                    </div>
                </div>
            </>
        );
    }

    if (!committee) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="max-w-4xl">
                        <h2 className="section-title dark:text-gray-100">Committee Not Found</h2>
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
                    <h2 className="section-title dark:text-gray-100">Create New Motion</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Creating motion for <span className="font-semibold">{committee.title}</span>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Field */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Motion Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Motion to Approve Annual Budget"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        {/* Description Field */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Motion Description <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                This will appear on the motion card. Start with "I move to..."
                            </p>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="I move to approve the proposed annual budget..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        {/* Full Description Field */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Full Motion Details (Optional)
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                Add additional context and details about this motion
                            </p>
                            <textarea
                                name="fullDescription"
                                value={formData.fullDescription}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Provide detailed information about the motion, including background, rationale, and expected outcomes..."
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>

                        {/* Action Buttons */}
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
                                className="px-6 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 !border-none"
                            >
                                Create Motion
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateMotionPage;
