import { useState, useEffect } from "react";
import HeaderNav from './reusable/HeaderNav';
import SideBar from './reusable/SideBar';
import ChairControlPanel from './ChairControlPanel';
import { getCommittees } from '../services/committeeApi';

function ChairControlPage() {
    const [searchedTerm, setSearchedTerm] = useState("");
    const [committees, setCommittees] = useState([]);
    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch committees on mount
    useEffect(() => {
        async function fetchCommittees() {
            try {
                setLoading(true);
                const data = await getCommittees(1); // Get first page
                setCommittees(data.committees || []);
            } catch (err) {
                console.error('Error fetching committees:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCommittees();
    }, []);

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-20 px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="w-full">
                    <h2 className="section-title dark:text-gray-100">
                        Chair Control Panel
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">
                        Manage procedural settings and controls for committees where you serve as chair
                    </p>

                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading committees...</p>
                    ) : committees.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">No committees found.</p>
                    ) : (
                        <div className="grid grid-cols-12 gap-6">
                            {/* Left side - Committee Selection */}
                            <div className="col-span-3">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined">groups</span>
                                        Your Committees
                                    </h3>

                                    <div className="space-y-3">
                                        {committees.map((committee) => (
                                            <button
                                                key={committee._id}
                                                onClick={() => setSelectedCommittee(committee)}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                    selectedCommittee?._id === committee._id
                                                        ? 'border-darker-green bg-white dark:bg-lighter-green shadow-md'
                                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            >
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                                    {committee.title}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                                                    {committee.description}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                        {committee.members?.length || 0} members
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">gavel</span>
                                                        {committee.motions?.length || 0} motions
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Control Panel */}
                            <div className="col-span-9">
                                {!selectedCommittee ? (
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
                                        committeeId={selectedCommittee._id}
                                        committee={selectedCommittee}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default ChairControlPage;
