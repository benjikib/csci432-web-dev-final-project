import { useNavigate, useLocation } from "react-router-dom"

function MotionCard({ motion, committeeSlug }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = () => {
        // Use the API-compliant route structure with slug if available
        const committeeIdentifier = committeeSlug || motion.committeeId;
        navigate(`/committee/${committeeIdentifier}/motion/${motion._id}`, { state: { background: location } })
    }

    return (
        <div className="motion-card" onClick={handleClick}>
            <div className="motion-header">
                <h3 className="motion-title font-bold">{motion.title}</h3>
            </div>
            <p className="motion-description">{motion.description}</p>
            <div className="motion-footer">
                <span className="text-sm text-gray-600">
                    Votes: {(motion.votes?.yes || 0) + (motion.votes?.no || 0) + (motion.votes?.abstain || 0)}
                </span>
            </div>
        </div>
    )
}

export default MotionCard