import { useState } from "react"
import { Link } from "react-router-dom"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getCommittees } from "./CommitteeStorage"

function CommitteesPage() {
    const committees = getCommittees()
    const [searchedTerm, setSearchedTerm] = useState("");

    // Filter committees based on search term
    let filteredCommittees = committees.filter((committee) => {
        return Object.values(committee).some((value) => {
            return String(value).toLowerCase().includes(searchedTerm.toLowerCase())
        });
    });

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="motions-section">
                    <h2 className="section-title dark:text-gray-100">Committees</h2>
                    <div className="motions-grid">
                        {filteredCommittees.map(committee => (
                            <Link
                                key={committee.id}
                                to={`/committee/${committee.id}`}
                                className="motion-card block"
                            >
                                <div className="motion-header">
                                    <h3 className="motion-title font-bold">{committee.title}</h3>
                                </div>
                                <p className="motion-description">{committee.description}</p>
                                <div className="motion-footer">
                                    <span className="text-sm text-gray-600">
                                        {committee.members?.length || 0} members
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default CommitteesPage
