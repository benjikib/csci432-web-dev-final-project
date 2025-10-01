import SideBar from './reusable/SideBar'
import HeaderNav from './reusable/HeaderNav'

function MotionDetails() {
    const motion = {
        title: "Motion to Stop People Having Fun in the Community",
        description: "\“I move that we should ban all forms of fun from the community.\”",
        fullDescription: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        voting: {

        }
    }

  return (
    <>
        <HeaderNav />
        <SideBar />
        {/* <div className="mt-20 ml-[16rem] flex flex-col gap-8 items-start"> 

            <div className="text-gray-700 text-2xl">{details.title}</div>

            <div className="text-black text-2xl self-center text-center">{details.overview}</div>
            
        </div> */}
          <div className="mt-20 ml-[16rem]">
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
                        <div>Current Votes: 1</div>
                        <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                    </div>
                </div>
          </div>
    </>
  )
}
export default MotionDetails