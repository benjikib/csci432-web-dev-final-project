import { useNavigate, useLocation } from "react-router-dom"

function MotionCard({ motion }) {
    const navigate = useNavigate()
    const location = useLocation()

    const handleClick = (e) => {
        e.preventDefault()
        navigate(`/motiondetails/${motion.id}`, { state: { background: location } })
    }

    return (
        <div className="motion-card">
            <div className="row1">
                <a className="title" href="#" onClick={handleClick}>{motion.title}</a>
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