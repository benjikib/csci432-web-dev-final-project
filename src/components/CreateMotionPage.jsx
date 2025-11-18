import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { getCommitteeById } from '../services/committeeApi';
import { createMotion } from '../services/motionApi';
import { useNavigationBlock } from '../context/NavigationContext';

import { API_BASE_URL } from '../config/api.js';

function CreateMotionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [committee, setCommittee] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchedTerm, setSearchedTerm] = useState("");
    const { blockNavigation, unblockNavigation, confirmNavigation } = useNavigationBlock();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Fetch committee and current user from API
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch committee
                const committeeData = await getCommitteeById(id);
                setCommittee(committeeData.committee || committeeData);

                // Fetch current user if authenticated
                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/auth/me`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            setCurrentUser(data.user);
                        }
                    } catch (err) {
                        console.error('Error fetching user:', err);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setCommittee(null);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    const [formData, setFormData] = useState({
        title: "",
        description: "I move to ",
        fullDescription: "",
        motionType: "main",
        amendTargetMotionId: null
    });

    // Get existing motions for amendment selection
    const existingMotions = getMotionsByCommittee(id);

    // Motion types based on Robert's Rules of Order
    const motionTypes = [
        {
            category: "Main Motions",
            types: [
                {
                    value: "main",
                    label: "Main Motion",
                    description: "Introduces new business or proposes action",
                    debatable: true,
                    amendable: true,
                    voteRequired: "majority"
                }
            ]
        },
        {
            category: "Subsidiary Motions",
            description: "Motions that modify or affect the main motion",
            types: [
                {
                    value: "amend",
                    label: "Amend",
                    description: "Modify the wording of a pending motion",
                    debatable: true,
                    amendable: true,
                    voteRequired: "majority"
                },
                {
                    value: "refer_to_committee",
                    label: "Refer to Committee",
                    description: "Send the motion to a committee for further review",
                    debatable: true,
                    amendable: true,
                    voteRequired: "majority"
                },
                {
                    value: "postpone",
                    label: "Postpone to Certain Time",
                    description: "Delay consideration until a specific time",
                    debatable: true,
                    amendable: true,
                    voteRequired: "majority"
                },
                {
                    value: "limit_debate",
                    label: "Limit or Extend Debate",
                    description: "Control the time for discussion",
                    debatable: false,
                    amendable: true,
                    voteRequired: "two-thirds"
                },
                {
                    value: "previous_question",
                    label: "Previous Question (Close Debate)",
                    description: "Immediately end debate and vote",
                    debatable: false,
                    amendable: false,
                    voteRequired: "two-thirds"
                },
                {
                    value: "table",
                    label: "Lay on the Table",
                    description: "Temporarily set aside a motion",
                    debatable: false,
                    amendable: false,
                    voteRequired: "majority"
                }
            ]
        },
        {
            category: "Privileged Motions",
            description: "High-priority motions unrelated to pending business",
            types: [
                {
                    value: "recess",
                    label: "Recess",
                    description: "Take a short break in the meeting",
                    debatable: false,
                    amendable: true,
                    voteRequired: "majority"
                },
                {
                    value: "adjourn",
                    label: "Adjourn",
                    description: "End the meeting",
                    debatable: false,
                    amendable: false,
                    voteRequired: "majority"
                },
                {
                    value: "question_of_privilege",
                    label: "Question of Privilege",
                    description: "Address urgent matters affecting members",
                    debatable: false,
                    amendable: false,
                    voteRequired: "none"
                }
            ]
        },
        {
            category: "Incidental Motions",
            description: "Motions arising from procedural questions",
            types: [
                {
                    value: "point_of_order",
                    label: "Point of Order",
                    description: "Object to a procedural violation",
                    debatable: false,
                    amendable: false,
                    voteRequired: "none"
                },
                {
                    value: "appeal",
                    label: "Appeal Decision of Chair",
                    description: "Challenge the chair's ruling",
                    debatable: true,
                    amendable: false,
                    voteRequired: "majority"
                },
                {
                    value: "suspend_rules",
                    label: "Suspend the Rules",
                    description: "Temporarily waive procedures",
                    debatable: false,
                    amendable: false,
                    voteRequired: "two-thirds"
                },
                {
                    value: "division",
                    label: "Division of Assembly",
                    description: "Request verified vote count",
                    debatable: false,
                    amendable: false,
                    voteRequired: "none"
                }
            ]
        },
        {
            category: "Motions to Reconsider",
            description: "Bring back previously decided motions",
            types: [
                {
                    value: "reconsider",
                    label: "Reconsider",
                    description: "Re-examine a previously voted motion",
                    debatable: true,
                    amendable: false,
                    voteRequired: "majority",
                    restriction: "Must be made by someone who voted on prevailing side"
                }
            ]
        }
    ];

    // Get selected motion type details
    const selectedMotionType = motionTypes
        .flatMap(cat => cat.types)
        .find(type => type.value === formData.motionType);

    // Check if form has been modified
    const checkIfModified = (data) => {
        return data.title.trim() !== "" ||
               data.description.trim() !== "I move to " ||
               data.fullDescription.trim() !== "" ||
               data.motionType !== "main" ||
               data.amendTargetMotionId !== null;
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

        // Validate target motion for subsidiary motions
        const subsidiaryMotions = ['amend', 'refer_to_committee', 'postpone', 'limit_debate', 'previous_question', 'table'];
        if (subsidiaryMotions.includes(formData.motionType) && !formData.amendTargetMotionId) {
            alert("Please select a target motion");
            return;
        }
        try{
        // Create new motion
        const newMotion = {
            committeeId: parseInt(id),
            title: formData.title,
            description: formData.description,
            fullDescription: formData.fullDescription || formData.description,
            author: currentUser?.id || null, // Add current user as author
            motionType: formData.motionType,
            motionTypeLabel: selectedMotionType?.label || "Main Motion",
            debatable: selectedMotionType?.debatable ?? true,
            amendable: selectedMotionType?.amendable ?? true,
            voteRequired: selectedMotionType?.voteRequired || "majority",
            amendTargetMotionId: formData.amendTargetMotionId,
            votes: 0
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
                        {/* Motion Type Selection */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                Motion Type <span className="text-red-500">*</span>
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Select the type of motion based on Robert's Rules of Order
                            </p>
                            
                            <div className="space-y-4">
                                {motionTypes.map((category) => (
                                    <div key={category.category}>
                                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-darker-green dark:text-superlight-green text-lg">
                                                gavel
                                            </span>
                                            {category.category}
                                        </h4>
                                        {category.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 ml-7">
                                                {category.description}
                                            </p>
                                        )}
                                        <div className="space-y-2 ml-7">
                                            {category.types.map((type) => (
                                                <div
                                                    key={type.value}
                                                    onClick={() => handleChange({ target: { name: 'motionType', value: type.value } })}
                                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                        formData.motionType === type.value
                                                            ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                            formData.motionType === type.value
                                                                ? 'border-darker-green bg-darker-green'
                                                                : 'border-gray-300 dark:border-gray-600'
                                                        }`}>
                                                            {formData.motionType === type.value && (
                                                                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                                                {type.label}
                                                            </h5>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                {type.description}
                                                            </p>
                                                            <div className="flex gap-3 mt-2 flex-wrap">
                                                                <span className={`text-xs px-2 py-1 rounded ${
                                                                    type.debatable 
                                                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                }`}>
                                                                    {type.debatable ? 'Debatable' : 'Not Debatable'}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded ${
                                                                    type.amendable 
                                                                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                }`}>
                                                                    {type.amendable ? 'Amendable' : 'Not Amendable'}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded ${
                                                                    type.voteRequired === 'two-thirds'
                                                                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
                                                                        : type.voteRequired === 'majority'
                                                                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                                }`}>
                                                                    {type.voteRequired === 'two-thirds' ? '2/3 Vote' : 
                                                                     type.voteRequired === 'majority' ? 'Majority Vote' : 
                                                                     'No Vote Required'}
                                                                </span>
                                                            </div>
                                                            {type.restriction && (
                                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-sm">warning</span>
                                                                    {type.restriction}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Target Motion Selection (shown for all subsidiary motions) */}
                        {['amend', 'refer_to_committee', 'postpone', 'limit_debate', 'previous_question', 'table'].includes(formData.motionType) && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 p-6 rounded-lg shadow-sm">
                                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">edit_note</span>
                                    Select Target Motion <span className="text-red-500">*</span>
                                </label>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {formData.motionType === 'amend' && 'Choose which existing motion you want to amend'}
                                    {formData.motionType === 'refer_to_committee' && 'Choose which motion to refer to committee'}
                                    {formData.motionType === 'postpone' && 'Choose which motion to postpone'}
                                    {formData.motionType === 'limit_debate' && 'Choose which motion to limit or extend debate on'}
                                    {formData.motionType === 'previous_question' && 'Choose which motion to close debate on'}
                                    {formData.motionType === 'table' && 'Choose which motion to lay on the table'}
                                </p>
                                
                                {existingMotions.length === 0 ? (
                                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            No existing motions available to amend in this committee.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {existingMotions.map((motion) => (
                                            <div
                                                key={motion.id}
                                                onClick={() => handleChange({ target: { name: 'amendTargetMotionId', value: motion.id } })}
                                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                                    formData.amendTargetMotionId === motion.id
                                                        ? 'border-amber-500 dark:border-amber-400 bg-white dark:bg-amber-900/30 shadow-md'
                                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-amber-300 dark:hover:border-amber-600'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                                                        formData.amendTargetMotionId === motion.id
                                                            ? 'border-amber-500 bg-amber-500'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                        {formData.amendTargetMotionId === motion.id && (
                                                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                                                {motion.title}
                                                            </h5>
                                                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded ml-2 flex-shrink-0">
                                                                Motion #{motion.id}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                            {motion.description}
                                                        </p>
                                                        {motion.motionTypeLabel && motion.motionTypeLabel !== 'Main Motion' && (
                                                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                                                {motion.motionTypeLabel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

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
