import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import Tabs from './reusable/Tabs'
import { getCommitteeById, getCommitteeMembers } from "../services/committeeApi"
import { getMotionsByCommittee } from "../services/motionApi"
import { getCurrentUser } from '../services/userApi'
import NoAccessPage from './NoAccessPage'

function CommitteeMotionsPage() {
    const { id } = useParams();
    const [committee, setCommittee] = useState(null);
    const [motions, setMotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch committee and motions from API when component mounts or when id changes
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch committee details
                const committeeData = await getCommitteeById(id);
                const fetchedCommittee = committeeData.committee || committeeData;
                setCommittee(fetchedCommittee);

                // Determine access: fetch current user and committee members
                let allowed = false;
                try {
                    const current = await getCurrentUser();
                    const user = current && current.user ? current.user : null;
                    if (user && user.roles && user.roles.includes('admin')) {
                        allowed = true;
                    }

                    // Fetch committee members list and check membership
                    try {
                        const membersRes = await getCommitteeMembers(id);
                            const membersList = (membersRes && membersRes.members) || []; 
                        // current.user.id might be an ObjectId string; members have _id
                        if (user) {
                            const uid = String(user.id || user._id || user.id);
                                if (membersList.some(m => { if (!m) return false; const mid = m._id || m.id || m.userId || m; return String(mid) === uid; })) {
                                allowed = true;
                            }
                            // Fallback: check if the user is a declared guest in their user doc (legacy data)
                            if (!allowed && Array.isArray(user.guestCommittees) && user.guestCommittees.map(String).includes(String(id))) {
                                allowed = true;
                            }
                        }
                    } catch (e) {
                        // If members endpoint fails, fall back to checking chair/owner
                        console.warn('Failed to fetch committee members for access check:', e);
                    }

                    // Check chair/owner fields on committee
                    if (!allowed && fetchedCommittee) {
                        const uid = user ? String(user.id || user._id || user.id) : null;
                        if (uid) {
                            if (String(fetchedCommittee.chair || '') === uid || String(fetchedCommittee.owner || '') === uid) {
                                allowed = true;
                            }
                        }
                    }
                } catch (e) {
                    // Not authenticated or error fetching user — treat as not allowed
                    allowed = false;
                }

                setHasAccess(Boolean(allowed));

                // Fetch motions only if allowed
                if (allowed) {
                    const motionsData = await getMotionsByCommittee(id, currentPage);
                    setMotions(motionsData.motions || motionsData || []);
                } else {
                    setMotions([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data');
                setCommittee(null);
                setMotions([]);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id, currentPage]);


    const tabs = [
        { id: "all", label: "All" },
        { id: "active", label: "Active" },
        { id: "past", label: "Past" },
        { id: "voided", label: "Voided" }
    ];

    // Filter motions based on search term
    let filteredMotions = motions.filter((motion) => {
        return Object.values(motion).some((value) => {
            return String(value).toLowerCase().includes(searchedTerm.toLowerCase())
        });
    });

    // Filter by tab (when motions have a status field, this will work)
    if (activeTab !== "all") {
        filteredMotions = filteredMotions.filter(motion => motion.status === activeTab);
    }

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="motions-section">
                    {loading ? (
                        <>
                            <h2 className="section-title dark:text-gray-100">Loading...</h2>
                            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading committee data...</p>
                        </>
                    ) : error ? (
                        <>
                            <h2 className="section-title dark:text-gray-100">Error</h2>
                            {/* Error Banner */}
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mt-4">
                                Failed to load committee data
                            </div>
                        </>
                    ) : !committee ? (
                        <>
                            <h2 className="section-title dark:text-gray-100">Committee Not Found</h2>
                        </>
                    ) : hasAccess === false ? (
                        <NoAccessPage committeeId={id} committeeTitle={committee?.title} />
                    ) : (
                        <>
                            <h2 className="section-title dark:text-gray-100">{committee.title} Motions</h2>
                            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                            {filteredMotions.length === 0 ? (
                                <p className="text-gray-600 dark:text-gray-400 mt-4">No motions found for this committee.</p>
                            ) : (
                                <div className="motions-grid">
                                    {filteredMotions.map(motion => (
                                        <MotionCard
                                            key={motion._id || motion.id}
                                            motion={motion}
                                            committeeSlug={committee?.slug || id}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default CommitteeMotionsPage
