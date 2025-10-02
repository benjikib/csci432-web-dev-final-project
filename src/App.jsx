import './App.css'
import Motions from './components/MotionsPage.jsx'
import Main from './components/MainPage.jsx'
import MotionDetails from './components/MotionDetailsPage.jsx'
import Settings from './components/SettingsPage.jsx'
import Profile from './components/ProfilePage.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
          {/* <div className="topnav">
            <a className="logo-link" href="/">
              <span className="nav-logo-font site-name">Commie</span>
              <img src="/logo.png" alt="Logo" className="nav-logo"></img>
            </a>
            <div className="nav-right">
              <a href="/motions" title="Notifications">Motions</a>
              <a href="#notifications" title="Notifications">Notifications</a>
              <a href="/settings" title="Settings">Settings</a>
              <a href="/profile" title="Profile">Profile</a>
            </div>
          </div> */}
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main />}></Route>
            <Route path="/motions" element={<Motions />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
            <Route path="/motiondetails/:id" element={<MotionDetails />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
          </Routes>
          </BrowserRouter>
    </>
  )
}

export default App
