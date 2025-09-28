import { useParams } from "react-router-dom"
import { getMotionById } from "./MotionStorage"

function MotionDetails() {
    const { id } = useParams()
    const motion = getMotionById(id)

    if (!motion) {
        return (
            <main id="main">
                <div className="details-container">
                    <div className="details-motion-title">Motion Not Found</div>
                </div>
            </main>
        )
    }

    return (
        <>
            <main id="main">
                <div id="side-bar">
                    Side
                    <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                    <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                    <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                </div>
                <div className="details-container">
                    <div className="details-motion-title">{motion.title}</div>
                    <div className="details-overview">
                        <div className="details-overview-title">Overview</div>
                        <div className="details-overview-contents">"{motion.description}"</div>
                    </div>
                    <div className="details-overview">
                        <div className="details-description-title">Description</div>
                        <div className="details-description-contents">"{motion.fullDescription}"</div>
                    </div>
                    <div className="details-overview">
                        <div className="details-description-title">Voting</div>
                        <div>Current Votes: {motion.votes}</div>
                        <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                    </div>
                </div>
            </main>
        </>
    )
}
export default MotionDetails