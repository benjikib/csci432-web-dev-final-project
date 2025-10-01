import { useNavigate } from "react-router-dom"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'

function Motions() {
    const navigate = useNavigate()

  return (
    <>
        <HeaderNav />
        <SideBar />  
        <div id="motions-container" className="mt-20 ml-[16rem]">
            <div class="motions-section">
            <h2 class="section-title">Motions</h2>
            <div class="motions-grid">
                <div class="motion-card">
                <div class="row1">
                    <a class="title" href="" onClick={() => navigate("/motiondetails")}>Motion #1</a>
                </div>
                <div class="row2">
                    Description Text.
                </div>
                <div class="row3">
                    Votes:
                </div>
                </div>
                <div class="motion-card">
                <div class="row1">
                    <a class="title" href="" onClick={()=> navigate("/motiondetails")}>Motion #2</a>
                </div>
                <div class="row2">
                    Another description.
                </div>
                <div class="row3">
                    Votes:
                </div>
                </div>
            </div>
            </div>
        </div>
    </>
  )
}
export default Motions
