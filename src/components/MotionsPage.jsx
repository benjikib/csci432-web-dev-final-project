import MotionCard from "./MotionCard"
import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'
import Tabs from './reusable/Tabs'
import { getMotions } from "./MotionStorage"
// import { useLocation } from "react-router-dom"
// import { useNavigate } from "react-router-dom"
import { useState } from "react"



function Motions() {

    //const location = useLocation();
    //const { users } = location.state || {};

    const motions = getMotions()
    const [searchedTerm, setSearchedTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const tabs = [
        { id: "all", label: "All" },
        { id: "active", label: "Active" },
        { id: "past", label: "Past" },
        { id: "voided", label: "Voided" }
    ];

    // Everytime the state refreshes we filter the motions list to search by whats in the search bar
    let filteredMotions = motions.filter( (motion) => {
        return Object.values(motion).some( (value) => {
            return String(value).toLowerCase().includes(searchedTerm.toLowerCase())
        });
    });

    // Filter by tab (when motions have a status field, this will work)
    if (activeTab !== "all") {
        filteredMotions = filteredMotions.filter(motion => motion.status === activeTab);
    }

    // console.log(filteredMotions)


    return (
        <>
            {/* <button className="mt-20" onClick={() => {console.log(motions)}}>hi</button> */}
            <HeaderNav setSearchedTerm = {setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="motions-section">
                    <h2 className="section-title dark:text-gray-100">Motions</h2>
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
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
