import { useNavigate } from "react-router-dom"
function MotionDetails() {

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
                <div className="details-motion-title">Motion to Stop People Having Fun in the Community</div>
                <div className="details-overview">
                    <div className="details-overview-title">Overview</div>
                    <div className="details-overview-contents">“I move that we should ban all forms of fun from the community.”</div>
                </div>
                <div className="details-overview">
                    <div className="details-description-title">Description</div>
                    <div className="details-description-contents">"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</div>
                </div>
                <div className="details-overview">
                    <div className="details-description-title">Voting</div>
                    <img src="/logo.png" alt="Logo" className="custom-logo"></img>
                </div>
            </div>
        </main>
    </>
  )
}
export default MotionDetails