import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCommitteeById } from '../CommitteeStorage';

//   const SideBar = () => {
export default function SideBar() {

      const location = useLocation();
      const navigate = useNavigate();

      const navItems = [
          { path: '/committees', label: 'Committees', icon: 'groups' },
          { path: '/user-control', label: 'User Control', icon: 'admin_panel_settings' },
      ];

      // Determine back navigation and committee context based on current path
      const getNavigationContext = () => {
          const path = location.pathname;

          // Check if we're on a motion details page: /committee/:id/motion/:motionId
          const motionMatch = path.match(/^\/committee\/(\d+)\/motion\/\d+$/);
          if (motionMatch) {
              const committeeId = motionMatch[1];
              const committee = getCommitteeById(committeeId);
              return {
                  backNav: {
                      label: committee?.title || 'Committee',
                      path: `/committee/${committeeId}`
                  },
                  committeeId: committeeId,
                  showSettings: false
              };
          }

          // Check if we're on a committee settings page: /committee/:id/settings
          const settingsMatch = path.match(/^\/committee\/(\d+)\/settings$/);
          if (settingsMatch) {
              const committeeId = settingsMatch[1];
              const committee = getCommitteeById(committeeId);
              return {
                  backNav: {
                      label: committee?.title || 'Committee',
                      path: `/committee/${committeeId}`
                  },
                  committeeId: committeeId,
                  showSettings: false
              };
          }

          // Check if we're on a committee page: /committee/:id
          const committeeMatch = path.match(/^\/committee\/(\d+)$/);
          if (committeeMatch) {
              const committeeId = committeeMatch[1];
              return {
                  backNav: {
                      label: 'Committees',
                      path: '/committees'
                  },
                  committeeId: committeeId,
                  showSettings: true
              };
          }

          return {
              backNav: null,
              committeeId: null,
              showSettings: false
          };
      };

      const navContext = getNavigationContext();

      return (
          <div className="fixed top-0 left-0 z-10 h-screen w-60 flex">
              {/* Dark green section with icons */}
              <div className="w-20 h-screen bg-darker-green flex flex-col items-center pt-24 gap-6">
                  {navItems.map((item) => (
                      <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center justify-center w-14 h-14 rounded-lg transition-all ${
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
              <div className="flex-1 h-screen bg-lighter-green pt-24 px-6">
                  {navContext.backNav && (
                      <Link
                          to={navContext.backNav.path}
                          className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mb-4"
                      >
                          <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl group-hover:translate-x-[-4px] transition-all">
                              arrow_back
                          </span>
                          <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">{navContext.backNav.label}</span>
                      </Link>
                  )}

                  {navContext.showSettings && navContext.committeeId && (
                      <Link
                          to={`/committee/${navContext.committeeId}/settings`}
                          className="flex items-center gap-2 !text-gray-300 hover:!text-white transition-colors group mt-6"
                      >
                          <span className="material-symbols-outlined !text-gray-300 group-hover:!text-white text-2xl">
                              settings
                          </span>
                          <span className="text-lg font-medium !text-gray-300 group-hover:!text-white">Settings</span>
                      </Link>
                  )}
              </div>
          </div>
      );
      
  };

//   export default SideBar;
