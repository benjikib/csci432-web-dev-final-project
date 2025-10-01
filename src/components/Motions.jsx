import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getMotions } from "./MotionStorage"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"

function Motions() {
    const motions = getMotions()
    const location = useLocation();
    const { users } = location.state || {}; 


  return (
    <>
        <HeaderNav />
        <SideBar />  
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
    </>
  )
}
export default Motions
