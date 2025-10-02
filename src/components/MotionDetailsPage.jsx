import { useParams, useNavigate } from "react-router-dom"
import { getMotionById } from "./MotionStorage"
import { useState } from "react"
import { BsFillFilterSquareFill, BsChatLeftDotsFill, BsCheckCircleFill } from "react-icons/bs"

function MotionDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const motion = getMotionById(id)
    const [activeTab, setActiveTab] = useState("description")

    const handleClose = () => {
        navigate(-1)
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose()
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
                                <h3 className="content-title">Comments</h3>
                                <p className="content-text">No comments yet. Be the first to comment!</p>
                            </div>
                        )}

                        {activeTab === "voting" && (
                            <div className="tab-content">
                                <h3 className="content-title">Vote on this Motion</h3>
                                <div className="voting-section">
                                    <div className="vote-count">
                                        <span className="vote-number">{motion.votes}</span>
                                        <span className="vote-label">Total Votes</span>
                                    </div>
                                    <div className="vote-buttons">
                                        <button className="vote-button vote-yes">Vote Yes</button>
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