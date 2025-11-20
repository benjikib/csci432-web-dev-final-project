import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigationBlock } from '../../context/NavigationContext';
import { getCurrentUser, hasRole } from '../../services/userApi';

//   const SideBar = () => {
export default function SideBar() {

      const location = useLocation();
      const navigate = useNavigate();
      const { confirmNavigation } = useNavigationBlock();
      const [userIsChair, setUserIsChair] = useState(false);
      const [userIsAdmin, setUserIsAdmin] = useState(false);

      // Check if user is a chair
      useEffect(() => {
          async function checkChair() {
              try {
                  const response = await getCurrentUser();
                  if (response.success) {
                      setUserIsChair(hasRole(response.user, 'chair'));
                      setUserIsAdmin(hasRole(response.user, 'admin'));
                  }
              } catch (err) {
                  console.error('Error checking chair/admin status:', err);
              }
          }

        
          checkChair();
      }, []);

      const navItems = [
          { path: '/home', label: 'Home', icon: 'home' },
          { path: '/committees', label: 'Committees', icon: 'groups' },
          ...(userIsChair
              ? [{ path: '/chair-control', label: 'Chair Control', icon: 'gavel' }]
              : []
          ),
          ...(userIsAdmin
              ? [{ path: '/admin', label: 'Admin Panel', icon: 'admin_panel_settings' }]
              : []
          ),
      ];

      // Determine back navigation and committee context based on current path
      const getNavigationContext = () => {
          const path = location.pathname;

          // Check if we're on a motion details page: /committee/:id/motion/:motionId
          const motionMatch = path.match(/^\/committee\/([^\/]+)\/motion\/[^\/]+$/);
          if (motionMatch) {
              const committeeId = motionMatch[1];
              return {
                  backNav: {
                      label: 'Back to Committee',
                      path: `/committee/${committeeId}`
                  },
                  committeeId: committeeId,
                  showSettings: false,
                  showCreateCommittee: false
              };
          }

          // Check if we're on a committee settings page: /committee/:id/settings
          const settingsMatch = path.match(/^\/committee\/([^\/]+)\/settings$/);
          if (settingsMatch) {
              const committeeId = settingsMatch[1];
              return {
                  backNav: {
                      label: 'Back to Committee',
                      path: `/committee/${committeeId}`
                  },
                  committeeId: committeeId,
                  showSettings: false,
                  showCreateCommittee: false
              };
          }

          // Check if we're on a create motion page: /committee/:id/create-motion
          const createMotionMatch = path.match(/^\/committee\/([^\/]+)\/create-motion$/);
          if (createMotionMatch) {
              const committeeId = createMotionMatch[1];
              return {
                  backNav: {
                      label: 'Back to Committee',
                      path: `/committee/${committeeId}`
                  },
                  committeeId: committeeId,
                  showSettings: false,
                  showCreateCommittee: false
              };
          }

          // Check if we're on a create committee page: /create-committee
          if (path === '/create-committee') {
              return {
                  backNav: {
                      label: 'Committees',
                      path: '/committees'
                  },
                  committeeId: null,
                  showSettings: false,
                  showCreateCommittee: false
              };
          }

          // Check if we're on a committee page: /committee/:id (slug or ID)
          const committeeMatch = path.match(/^\/committee\/([^\/]+)$/);
          if (committeeMatch) {
              const committeeId = committeeMatch[1];
              return {
                  backNav: {
                      label: 'Committees',
                      path: '/committees'
                  },
                  committeeId: committeeId,
                  showSettings: true,
                  showCreateCommittee: false
              };
          }

          // Check if we're on the committees page: /committees
          if (path === '/committees') {
              return {
                  backNav: null,
                  committeeId: null,
                  showSettings: false,
                  showCreateCommittee: true
              };
          }

          return {
              backNav: null,
              committeeId: null,
              showSettings: false,
              showCreateCommittee: false
          };
      };

      const navContext = getNavigationContext();

      // Check if there's any content to show in the light green section
      const hasContent = navContext.backNav || navContext.showSettings || navContext.showCreateCommittee;

      // Handle navigation with confirmation
      const handleNavigation = (e, path) => {
          if (!confirmNavigation()) {
              e.preventDefault();
          }
      };

      return (
          <div className="fixed top-0 left-0 z-10 h-screen flex-shrink-0 flex">
              {/* Dark green section with icons */}
              <div className="w-20 flex-shrink-0 h-screen bg-darker-green flex flex-col items-center pt-24 gap-6 overflow-hidden">
                  {navItems.map((item) => (
                      <Link
                          key={item.path}
                          to={item.path}
                          onClick={(e) => handleNavigation(e, item.path)}
                          title={item.label}
                          className={`flex items-center justify-center w-14 h-14 flex-shrink-0 rounded-lg transition-all ${
                              location.pathname === item.path
                                  ? '!text-white scale-125'
                                  : '!text-superlight-green/60 hover:!text-superlight-green/90 hover:scale-110'
                          }`}
                      >
                          <span className={`material-symbols-outlined ${
                              location.pathname === item.path ? 'text-4xl' : 'text-3xl'
                          }`}>{item.icon}</span>
                      </Link>
                  ))}
              </div>

              {/* Light green section for back navigation and committee controls */}
              <div className={`flex-shrink-0 h-screen bg-lighter-green pt-24 transition-all duration-300 ease-in-out ${
                  hasContent ? 'w-44 px-4 opacity-100' : 'w-0 px-0 opacity-0'
              } ${hasContent ? 'overflow-y-auto' : 'overflow-hidden'}`}>
                  {navContext.backNav && (
                      <Link
                          to={navContext.backNav.path}
                          onClick={(e) => handleNavigation(e, navContext.backNav.path)}
                          className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mb-4"
                      >
                          <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl group-hover:translate-x-[-4px] transition-all">
                              arrow_back
                          </span>
                          <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">{navContext.backNav.label}</span>
                      </Link>
                  )}

                  {navContext.showSettings && navContext.committeeId && (
                      <>
                          <Link
                              to={`/committee/${navContext.committeeId}/create-motion`}
                              onClick={(e) => handleNavigation(e, `/committee/${navContext.committeeId}/create-motion`)}
                              className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mt-6"
                          >
                              <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl">
                                  add_circle
                              </span>
                              <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">Create</span>
                          </Link>
                          <Link
                              to={`/committee/${navContext.committeeId}/settings`}
                              onClick={(e) => handleNavigation(e, `/committee/${navContext.committeeId}/settings`)}
                              className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mt-2"
                          >
                              <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl">
                                  settings
                              </span>
                              <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">Settings</span>
                          </Link>
                      </>
                  )}

                  {navContext.showCreateCommittee && (
                      <Link
                          to="/create-committee"
                          onClick={(e) => handleNavigation(e, '/create-committee')}
                          className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mt-6"
                      >
                          <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl">
                              add_circle
                          </span>
                          <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">Create</span>
                      </Link>
                  )}
              </div>
          </div>
      );
      
  };

//   export default SideBar;
