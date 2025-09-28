import { useNavigate } from "react-router-dom"

function MotionCard({ motion }) {
    const navigate = useNavigate()

    const handleClick = (e) => {
        e.preventDefault()
        navigate(`/motiondetails/${motion.id}`)
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