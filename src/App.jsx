import { useState } from 'react'
import './App.css'
import Motions from './components/Motions.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
          <div className="topnav">
            <a className="logo-link" href="#home">
              <span className="nav-logo-font">Commie</span>
              <img src="/logo.png" alt="Logo" className="nav-logo"></img>
            </a>
            <div className="nav-right">
              <a href="#notifications" title="Notifications">Notifications</a>
              <a href="#settings" title="Settings">Settings</a>
              <a href="#profile" title="Profile">Profile</a>
            </div>
          </div>
          <BrowserRouter>
          <Routes>
            <Route path="/motions" element={<Motions />}></Route>
          </Routes>
          </BrowserRouter>
    </>
  )
}

export default App
