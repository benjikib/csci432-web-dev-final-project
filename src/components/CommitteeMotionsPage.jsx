import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import Tabs from './reusable/Tabs'
import { getCommitteeById } from "../services/committeeApi"
import { getMotionsByCommittee } from "../services/motionApi"

function CommitteeMotionsPage() {
    const { id } = useParams();
    const [committee, setCommittee] = useState(null);
    const [motions, setMotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState("");
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
                setCommittee(committeeData.committee || committeeData);

                // Fetch motions
                const motionsData = await getMotionsByCommittee(id, currentPage);
                setMotions(motionsData.motions || motionsData || []);
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
                            <p className="text-red-600 dark:text-red-400 mt-4">Error: {error}</p>
                        </>
                    ) : !committee ? (
                        <>
                            <h2 className="section-title dark:text-gray-100">Committee Not Found</h2>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="section-title dark:text-gray-100">{committee.title} Motions</h2>
                                <Link
                                    to={`/committee/${committee.slug || id}/create-motion`}
                                    className="px-6 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 !border-none"
                                >
                                    + Create Motion
                                </Link>
                            </div>
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
