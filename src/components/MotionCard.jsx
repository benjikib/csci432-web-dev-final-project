import { useNavigate, useLocation } from "react-router-dom"

function MotionCard({ motion }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = () => {
        // Use the API-compliant route structure
        navigate(`/committee/${motion.committeeId}/motion/${motion.id}`, { state: { background: location } })
    }

    return (
        <div className="motion-card" onClick={handleClick}>
            <div className="motion-header">
                <h3 className="motion-title font-bold">{motion.title}</h3>
            </div>
            <p className="motion-description">{motion.description}</p>
            <div className="motion-footer">
                <span className="text-sm text-gray-600">
                    Votes: {motion.votes || 0}
                </span>
            </div>
        </div>
    )
}

export default MotionCard