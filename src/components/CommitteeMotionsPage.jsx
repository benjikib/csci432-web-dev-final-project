import { useState } from "react"
import { useParams } from "react-router-dom"
import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getCommitteeById, getMotionsByCommittee } from "./CommitteeStorage"

function CommitteeMotionsPage() {
    const { id } = useParams();
    const committee = getCommitteeById(id);
    const motions = getMotionsByCommittee(id);
    const [searchedTerm, setSearchedTerm] = useState("");

    // Filter motions based on search term
    let filteredMotions = motions.filter((motion) => {
        return Object.values(motion).some((value) => {
            return String(value).toLowerCase().includes(searchedTerm.toLowerCase())
        });
    });

    if (!committee) {
        return (
            <>
                <HeaderNav setSearchedTerm={setSearchedTerm} />
                <SideBar />
                <div className="mt-20 ml-[16rem]">
                    <div className="motions-section">
                        <h2 className="section-title">Committee Not Found</h2>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem]">
                <div className="motions-section">
                    <h2 className="section-title">{committee.title} Motions</h2>
                    {filteredMotions.length === 0 ? (
                        <p className="text-gray-600 mt-4">No motions found for this committee.</p>
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
