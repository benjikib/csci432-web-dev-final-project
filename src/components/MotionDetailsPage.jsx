import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { BsFillFilterSquareFill, BsChatLeftDotsFill, BsCheckCircleFill } from "react-icons/bs"
import MotionDetailsComments from "./MotionDetailsComments"
import { getMotionById } from "../services/motionApi"

function MotionDetails() {
    const { committeeId, motionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [motion, setMotion] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState("description")

    // Fetch motion details from API when component mounts
    useEffect(() => {
        async function fetchMotion() {
            try {
                setLoading(true);
                setError(null);
                const data = await getMotionById(committeeId, motionId);
                setMotion(data.motion || data);
            } catch (err) {
                console.error('Error fetching motion:', err);
                setError(err.message || 'Failed to load motion');
            } finally {
                setLoading(false);
            }
        }

        if (committeeId && motionId) {
            fetchMotion();
        }
    }, [committeeId, motionId])

    const handleClose = () => {
        // If there's a background state, go back; otherwise, navigate to committee page
        if (location.state?.background) {
            navigate(-1)
        } else {
            navigate(`/committee/${committeeId}`)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    // voting logic

    const [numberOfYesVotes, setNumberOfYesVotes] = useState(motion?.votes?.yes || 0);

    const handleYesVote = () => {
        if (motion && motion.votes) {
            motion.votes.yes = (motion.votes.yes || 0) + 1;
            setNumberOfYesVotes(numberOfYesVotes + 1);
        }
    }

    if (loading) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        <div className="details-motion-title">Loading motion details...</div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !motion) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        <div className="details-motion-title">
                            {error ? `Error: ${error}` : 'Motion Not Found'}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content modal-content-tabbed">
                <button className="modal-close" onClick={handleClose}>&times;</button>

                <div className="modal-header">
                    <h2 className="modal-title">{motion.title}</h2>
                    <p className="modal-subtitle">{motion.description}</p>
                    {(motion.authorName || motion.authorInfo) && (
                        <div className="flex items-center gap-2 mt-3 text-gray-600 dark:text-gray-400">
                            {motion.authorInfo?.picture ? (
                                <img
                                    src={motion.authorInfo.picture}
                                    alt={motion.authorName || motion.authorInfo.name}
                                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                />
                            ) : (
                                <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-3xl">account_circle</span>
                            )}
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {motion.authorName || motion.authorInfo?.name || 'Anonymous'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                    Motion Author
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-body">
                    <div className="modal-sidebar">
                        <button
                            className={`tab-button ${activeTab === "description" ? "active" : ""}`}
                            onClick={() => setActiveTab("description")}
                            title="Description"
                        >
                            <BsFillFilterSquareFill />
                        </button>
                        <button
                            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
                            onClick={() => setActiveTab("comments")}
                            title="Comments"
                        >
                            <BsChatLeftDotsFill />
                        </button>
                        <button
                            className={`tab-button ${activeTab === "voting" ? "active" : ""}`}
                            onClick={() => setActiveTab("voting")}
                            title="Voting"
                        >
                            <BsCheckCircleFill />
                        </button>
                    </div>

                    <div className="modal-main-content">
                        {activeTab === "description" && (
                            <div className="tab-content">
                                <h3 className="content-title">Full Description</h3>
                                <p className="content-text">{motion.fullDescription}</p>
                            </div>
                        )}

                        {activeTab === "comments" && (
                            <div className="tab-content">

                                <MotionDetailsComments />
                                
                            </div>
                        )}

                        {activeTab === "voting" && (
                            <div className="tab-content">
                                <h3 className="content-title">Vote on this Motion</h3>
                                <div className="voting-section">
                                    <div className="vote-count">
                                        <span className="vote-number">{(motion.votes?.yes || 0) + (motion.votes?.no || 0) + (motion.votes?.abstain || 0)}</span>
                                        <span className="vote-label">Total Votes</span>
                                        <div className="vote-breakdown">
                                            <div>Yes: {motion.votes?.yes || 0}</div>
                                            <div>No: {motion.votes?.no || 0}</div>
                                            <div>Abstain: {motion.votes?.abstain || 0}</div>
                                        </div>
                                    </div>
                                    <div className="vote-buttons">
                                        <button
                                            className="vote-button vote-yes"
                                            onClick = { handleYesVote }
                                            >Vote Yes</button>
                                        <button className="vote-button vote-no">Vote No</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MotionDetails