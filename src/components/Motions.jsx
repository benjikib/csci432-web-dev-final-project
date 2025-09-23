import { useNavigate } from "react-router-dom"

function Motions() {
    const navigate = useNavigate()
    const detailsClicked = () => {
      navigate("/motiondetails")
    }

  return (
    <>
        <main id="main">
        <div id="side-bar">
            Side 
        </div>
        <div id="motions-container">
            <div class="motions-section">
            <h2 class="section-title">Motions</h2>
            <div class="motions-grid">
                <div class="motion-card">
                <div class="row1">
                    <a class="title" href="" onClick={detailsClicked}>Motion #1</a>
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
                    <a class="title" href="" onClick={detailsClicked}>Motion #2</a>
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
        </main>
    </>
  )
}
export default Motions
