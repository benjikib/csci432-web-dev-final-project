import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getCommittees } from "../services/committeeApi"

function CommitteesPage() {
    const [committees, setCommittees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchedTerm, setSearchedTerm] = useState("")

    // Fetch committees from API when component mounts
    useEffect(() => {
        async function fetchCommittees() {
            try {
                setLoading(true)
                setError(null)
                const data = await getCommittees(1)
                setCommittees(data.committees || [])
            } catch (err) {
                console.error('Error fetching committees:', err)
                setError(err.message || 'Failed to load committees')
                setCommittees([])
            } finally {
                setLoading(false)
            }
        }

        fetchCommittees()
    }, []);

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

                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading committees...</p>
                    ) : error ? (
                        <p className="text-red-600 dark:text-red-400 mt-4">Error: {error}</p>
                    ) : filteredCommittees.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400 mt-4">No committees found.</p>
                    ) : (
                        <div className="motions-grid">
                            {filteredCommittees.map(committee => (
                                <Link
                                    key={committee._id}
                                    to={`/committee/${committee.slug || committee._id}`}
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
                    )}
                </div>
            </div>
        </>
    )
}

export default CommitteesPage
