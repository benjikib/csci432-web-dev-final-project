import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { createCommittee } from '../services/committeeApi';
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

        // Validate form
        if (!formData.title.trim() || !formData.description.trim()) {
            alert("Please fill in all required fields");
            return;
        }

        try {
            // Create new committee
            const newCommittee = {
                title: formData.title,
                description: formData.description,
                members: formData.members
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
                <div className="max-w-4xl mx-auto">
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
