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
          <div className="fixed top-0 left-0 z-10 h-screen w-60 bg-lighter-green">
              <div className="fixed top-0 left-0 z-10 h-screen w-20 bg-darker-green" />

              <nav className="relative z-20 pt-24 px-4">
                  {navItems.map((item) => (
                      <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-white transition-all ${
                              location.pathname === item.path
                                  ? 'bg-superlight-green/90 font-bold'
                                  : 'hover:bg-superlight-green/50'
                          }`}
                      >
                          <span className="material-symbols-outlined">{item.icon}</span>
                          <span>{item.label}</span>
                      </Link>
                  ))}
              </nav>
          </div>
      );
      
  };

//   export default SideBar;
