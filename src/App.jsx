import './App.css'
import Motions from './components/_MotionsPage.jsx'
import Main from './components/_MainPage.jsx'
import LoginPage from './components/_LoginPage.jsx'
import MotionDetails from './components/_MotionDetailsPage.jsx'
import Settings from './components/_SettingsPage.jsx'
import Profile from './components/_ProfilePage.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
          {/* <div className="topnav">
            <a className="logo-link" href="/">
              <span className="nav-logo-font">Commie</span>
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
            <Route path="/login" element={<LoginPage />}></Route>
            <Route path="/settings" element={<Settings />}></Route>
            <Route path="/motiondetails/:id" element={<MotionDetails />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
          </Routes>
          </BrowserRouter>
    </>
  )
}

export default App
