import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import { getMotions } from "./MotionStorage"
// import { useLocation } from "react-router-dom"
// import { useNavigate } from "react-router-dom"
import { useState } from "react"



function Motions() {

    //const location = useLocation();
    //const { users } = location.state || {}; 

    const motions = getMotions()
    const [searchedTerm, setSearchedTerm] = useState("");

    let filteredMotions = motions.filter( (motion) => {
        return Object.values(motion).some( (value) => {
            return String(value).toLowerCase().includes(searchedTerm.toLowerCase())
        });
    });

    // console.log(filteredMotions)


    return (
        <>
            {/* <button className="mt-20" onClick={() => {console.log(motions)}}>hi</button> */}
            <HeaderNav searchedTerm = {searchedTerm} setSearchedTerm = {setSearchedTerm} />
            <SideBar />  
            <div className="mt-20 ml-[16rem]">
                <div className="motions-section">
                    <h2 className="section-title">Motions</h2>
                    <div className="motions-grid">
                        {filteredMotions.map(motion => (
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
