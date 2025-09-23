import { useState } from 'react'
import { useNavigate } from "react-router-dom"
function MainPage() {
    const [count, setCount] = useState(0)
    const navigate = useNavigate()

  return (
    <>
        <div className="main-page">
            <span className="main-logo-font">Commie</span>
            <img src="/logo.png" alt="Logo" className="main-logo"></img>
            <button type="submit" onClick={() => navigate("/login")}>Get Started</button>
        </div>
    </>
  )
}
export default MainPage
