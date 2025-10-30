import { useState } from "react"
import { useParams } from "react-router-dom"
import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import Tabs from './reusable/Tabs'
import { getCommitteeById, getMotionsByCommittee } from "./CommitteeStorage"

function CommitteeMotionsPage() {
    const { id } = useParams();
    const committee = getCommitteeById(id);
    const motions = getMotionsByCommittee(id);
    const [searchedTerm, setSearchedTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

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

    if (!committee) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                    <div className="motions-section">
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
                <div className="motions-section">
                    <h2 className="section-title dark:text-gray-100">{committee.title} Motions</h2>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    {filteredMotions.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">No motions found for this committee.</p>
                    ) : (
                        <div className="motions-grid">
                            {filteredMotions.map(motion => (
                                <MotionCard
                                    key={motion.id}
                                    motion={motion}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CommitteeMotionsPage
