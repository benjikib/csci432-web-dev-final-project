import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getMotionById } from "./CommitteeStorage"
import { useState } from "react"
import { BsFillFilterSquareFill, BsChatLeftDotsFill, BsCheckCircleFill } from "react-icons/bs"
import MotionDetailsComments from "./MotionDetailsComments"

function MotionDetails() {
    const { committeeId, motionId } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const motion = getMotionById(committeeId, motionId)
    const [activeTab, setActiveTab] = useState("description")

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

    const [numberOfYesVotes, setNumberOfYesVotes] = useState(motion?.votes || 0);

    const handleYesVote = () => {
        if (motion) {
            motion.votes = (motion.votes || 0) + 1;
            setNumberOfYesVotes(numberOfYesVotes + 1);
        }
    }

    if (!motion) {
        return (
            <div className="modal-backdrop" onClick={handleBackdropClick}>
                <div className="modal-content">
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                    <div className="details-container">
                        <div className="details-motion-title">Motion Not Found</div>
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
                                        <span className="vote-number">{numberOfYesVotes}</span>
                                            {/* {motion.votes}</span> */}
                                        <span className="vote-label">Total Votes</span>
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