import './App.css'
import Motions from './components/Motions.jsx'
import Main from './components/MainPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import MotionDetails from './components/MotionDetails.jsx'
import Settings from './components/Settings.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
          <div className="topnav">
            <a className="logo-link" href="/">
              <span className="nav-logo-font">Commie</span>
              <img src="/logo.png" alt="Logo" className="nav-logo"></img>
            </a>
            <div className="nav-right">
              <a href="#notifications" title="Notifications">Notifications</a>
              <a href="/settings" title="Settings">Settings</a>
              <a href="#profile" title="Profile">Profile</a>
            </div>
          </div>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />}></Route>
            <Route path="/motions" element={<Motions />}></Route>
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
            <Route path="/motiondetails/:id" element={<MotionDetails />}></Route>
          </Routes>
          </BrowserRouter>
    </>
  )
}

export default App
