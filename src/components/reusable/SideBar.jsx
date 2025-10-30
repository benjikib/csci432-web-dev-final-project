import { Link, useLocation } from 'react-router-dom';

//   const SideBar = () => {
export default function SideBar() {

      const location = useLocation();

      const navItems = [
          { path: '/committees', label: 'Committees', icon: 'groups' },
          { path: '/motions', label: 'Active Motions', icon: 'description' },
          { path: '/motions-history', label: 'Motions History', icon: 'history' },
          { path: '/user-control', label: 'User Control', icon: 'admin_panel_settings' },
      ];

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

              {/* Light green section for additional content */}
              <div className="flex-1 h-screen bg-lighter-green pt-24 px-6">
                  {/* This area can be used for additional content */}
              </div>
          </div>
      );
      
  };

//   export default SideBar;
