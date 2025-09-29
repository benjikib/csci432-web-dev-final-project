import MotionCard from "./MotionCard"
import { getMotions } from "./MotionStorage"

function Motions() {
    const motions = getMotions()

  return (
    <>
        <main id="main">
        <div id="side-bar">
            Side 
        </div>
        <div id="motions-container">
            <div className="motions-section">
            <h2 className="section-title">Motions</h2>
            <div className="motions-grid">
                {motions.map(motion => (
                    <MotionCard
                        key={motion.id}
                        motion={motion}
                    />
                ))}
            </div>
            </div>
        </div>
        </main>
    </>
  )
}
export default Motions
