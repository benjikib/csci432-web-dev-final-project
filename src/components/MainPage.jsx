import { useState } from 'react'
function MainPage() {
  const [count, setCount] = useState(0)

  return (
    <>
        <div className="main-page">
            <span className="main-logo-font">Commie</span>
            <img src="/logo.png" alt="Logo" className="main-logo"></img>
            <button>Get Started</button>
        </div>
    </>
  )
}
export default MainPage
