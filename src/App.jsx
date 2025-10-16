import './App.css'
import Motions from './components/MotionsPage.jsx'
import Main from './components/MainPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import MotionDetails from './components/MotionDetailsPage.jsx'
import Settings from './components/SettingsPage.jsx'
import Profile from './components/ProfilePage.jsx'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();
  const background = location.state?.background;

  // Check if we're on a motion details route without background state (direct navigation)
  const isMotionDetailsRoute = location.pathname.startsWith('/motiondetails/');
  const shouldShowModal = background || isMotionDetailsRoute;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<Main />}></Route>
        <Route path="/motions" element={<Motions />}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/motiondetails/:id" element={<Motions />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
      </Routes>

      {shouldShowModal && (
        <Routes>
          <Route path="/motiondetails/:id" element={<MotionDetails />}></Route>
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
