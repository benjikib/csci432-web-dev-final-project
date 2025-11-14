import { useState, useEffect } from "react";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import ChairControlPanel from './ChairControlPanel';
import { getCurrentUser, hasRole } from '../services/userApi';

function UserControlPage() {
    const [searchedTerm, setSearchedTerm] = useState("");
    const [selectedCommitteeId, setSelectedCommitteeId] = useState(null);
    const [isChair, setIsChair] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user has chair role
    useEffect(() => {
        async function checkChairRole() {
            try {
                setError(null);
                const response = await getCurrentUser();
                if (response.success) {
                    setIsChair(hasRole(response.user, 'chair'));
                }
            } catch (err) {
                console.error('Error checking chair role:', err);
                setError(err.message || 'Failed to verify user permissions');
                setIsChair(false);
            } finally {
                setIsLoading(false);
            }
        }
        checkChairRole();
    }, []);

    // Get committees where user is a chair from CommitteeStorage
    // For now using mock data - will integrate with real backend later
    const chairCommittees = [
        {
            id: 1,
            title: "Finance Committee",
            description: "Oversees budget, financial planning, and expense approvals",
            memberCount: 12,
            activeMotions: 3
        },
        {
            id: 3,
            title: "Safety & Security Committee",
            description: "Handles community safety measures and security protocols",
            memberCount: 8,
            activeMotions: 2
        }
    ];

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="max-w-4xl">
                        <h2 className="section-title dark:text-gray-100">Chair Control Panel</h2>
                        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center">
                            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show access denied if user is not a chair
    if (!isChair) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="max-w-4xl">
                        <h2 className="section-title dark:text-gray-100">Chair Control Panel</h2>

                        {/* Error Banner */}
                        {error ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
                                Failed to verify user permissions
                            </div>
                        ) : (
                            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    You do not have chair privileges. This panel is only available to committee chairs.
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-4">
                                    If you believe you should have access, please contact your committee administrator.
                                </p>
                            </div>
                        )}
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
                <div className="w-full">
                    <h2 className="section-title dark:text-gray-100">
                        Chair Control Panel
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
                        Manage procedural settings and controls for committees where you serve as chair
                    </p>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Left side - Committee Selection */}
                        <div className="col-span-3">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined">groups</span>
                                    Your Committees
                                </h3>
                                
                                {chairCommittees.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                                        You are not a chair of any committees yet.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {chairCommittees.map((committee) => (
                                            <button
                                                key={committee.id}
                                                onClick={() => setSelectedCommitteeId(committee.id)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                    selectedCommitteeId === committee.id
                                                        ? 'border-darker-green bg-white dark:bg-lighter-green shadow-md'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            >
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                                    {committee.title}
                                                </h4>
                                                <p className="text-sm text-gray-800 dark:text-white mb-2 line-clamp-2">
                                                    {committee.description}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-800 dark:text-white">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                        {committee.memberCount} members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">gavel</span>
                                                        {committee.activeMotions} active
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right side - Control Panel */}
                        <div className="col-span-9">
                            {!selectedCommitteeId ? (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 flex flex-col items-center justify-center min-h-[500px]">
                                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">
                                        arrow_back
                                    </span>
                                    <p className="text-gray-500 dark:text-gray-500 text-center">
                                        Select a committee from the left to manage its settings
                                    </p>
                                </div>
                            ) : (
                                <ChairControlPanel 
                                    committeeId={selectedCommitteeId}
                                    committee={chairCommittees.find(c => c.id === selectedCommitteeId)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default UserControlPage;
