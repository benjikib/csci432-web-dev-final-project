import './App.css'
import Main from './components/MainPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import Auth0Callback from './components/Auth0Callback.jsx'
import MotionDetails from './components/MotionDetailsPage.jsx'
import Settings from './components/SettingsPage.jsx'
import Profile from './components/ProfilePage.jsx'
import CommitteesPage from './components/CommitteesPage.jsx'
import CommitteeMotionsPage from './components/CommitteeMotionsPage.jsx'
import CommitteeSettingsPage from './components/CommitteeSettingsPage.jsx'
import CreateMotionPage from './components/CreateMotionPage.jsx'
import CreateCommitteePage from './components/CreateCommitteePage.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const background = location.state?.background;

  // Check if we're on a motion details route without background state (direct navigation)
  const isMotionDetailsRoute = location.pathname.match(/\/committee\/[^\/]+\/motion\/[^\/]+/);
  const shouldShowModal = background || isMotionDetailsRoute;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<LoginPage />}></Route>
        <Route path="/home" element={<Main />}></Route>
        <Route path="/committees" element={<CommitteesPage />}></Route>
        <Route path="/create-committee" element={<CreateCommitteePage />}></Route>
        <Route path="/committee/:id" element={<CommitteeMotionsPage />}></Route>
        <Route path="/committee/:id/settings" element={<CommitteeSettingsPage />}></Route>
        <Route path="/committee/:id/create-motion" element={<CreateMotionPage />}></Route>
        <Route path="/committee/:committeeId/motion/:motionId" element={<CommitteeMotionsPage />}></Route>
        <Route path="/callback" element={<Auth0Callback />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path="*" element={<NotFoundPage />}></Route>
      </Routes>

      {shouldShowModal && (
        <Routes>
          <Route path="/committee/:committeeId/motion/:motionId" element={<MotionDetails />}></Route>
        </Routes>
      )}
    </>
  );
}
