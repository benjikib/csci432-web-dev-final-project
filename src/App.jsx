import './App.css'
import HomePage from './components/HomePage.jsx'
import LoginPage from './components/LoginPage.jsx'
import MotionDetails from './components/MotionDetailsPage.jsx'
import Settings from './components/SettingsPage.jsx'
import Profile from './components/ProfilePage.jsx'
import ChairControlPage from './components/ChairControlPage.jsx'
import CommitteesPage from './components/CommitteesPage.jsx'
import CommitteeMotionsPage from './components/CommitteeMotionsPage.jsx'
import CommitteeSettingsPage from './components/CommitteeSettingsPage.jsx'
import CreateMotionPage from './components/CreateMotionPage.jsx'
import CreateCommitteePage from './components/CreateCommitteePage.jsx'
import UserControlPage from './components/UserControlPage.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import UnauthorizedPage from './components/UnauthorizedPage.jsx'
import UnauthorizedCommitteePage from './components/UnauthorizedCommitteePage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
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
        <Route path="/home" element={<HomePage />}></Route>
        <Route path="/committees" element={<CommitteesPage />}></Route>
        <Route path="/create-committee" element={<CreateCommitteePage />}></Route>
        <Route path="/committee/:id" element={<CommitteeMotionsPage />}></Route>
        <Route path="/committee/:id/settings" element={<CommitteeSettingsPage />}></Route>
        <Route path="/committee/:id/create-motion" element={<CreateMotionPage />}></Route>
        <Route path="/committee/:committeeId/motion/:motionId" element={<CommitteeMotionsPage />}></Route>
        <Route
          path="/user-control"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserControlPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route
          path="/chair-control"
          element={
            <ProtectedRoute
              customCheck={(user) => {
                // Allow access if user is admin OR has chair role OR chairs any committees
                const isAdmin = user?.roles?.includes('admin');
                const isChair = user?.roles?.includes('chair');
                const chairsCommittees = user?.chairedCommittees && user.chairedCommittees.length > 0;
                return isAdmin || isChair || chairsCommittees;
              }}
            >
              <ChairControlPage />
            </ProtectedRoute>
          }
        ></Route>
        <Route path="/unauthorized" element={<UnauthorizedPage />}></Route>
        <Route path="/unauthorized-committee/:id?" element={<UnauthorizedCommitteePage />}></Route>
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
