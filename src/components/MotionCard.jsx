import { useNavigate, useLocation } from "react-router-dom"

function MotionCard({ motion }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = () => {
        navigate(`/motiondetails/${motion.id}`, { state: { background: location } })
    }

    return (
        <div className="motion-card" onClick={handleClick}>
            <div className="row1">
                <span className="title">{motion.title}</span>
            </div>
            <div className="row2">
                {motion.description}
            </div>
            <div className="row3">
                Votes: {motion.votes || 0}
            </div>
        </div>
    )
}

export default MotionCard