import { useState } from "react";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { useTheme } from '../context/ThemeContext';

function Settings() {
  const { theme, toggleTheme } = useTheme();

  // === required by assignment: a data variable with placeholder data ===
  const [data, setData] = useState({
    username: "Placeholder User",
    notifications: true,
  });

  const [searchedTerm, setSearchedTerm] = useState("");

  // === simple interactions that update `data` ===
  const toggleNotifications = () =>
    setData(prev => ({ ...prev, notifications: !prev.notifications }));

  const onNameChange = (e) =>
    setData(prev => ({ ...prev, username: e.target.value }));

  return (
    <>
      <HeaderNav setSearchedTerm={setSearchedTerm} />
      <SideBar />
      <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
        <div className="max-w-4xl">
          <h2 className="section-title dark:text-gray-100">Settings</h2>

          <div className="space-y-6">
            {/* Display Name Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Display Name
              </label>
              <input
                value={data.username}
                onChange={onNameChange}
                className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lighter-green focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Theme Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current: {theme}</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-6 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 !border-none"
                >
                  Toggle Theme
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status: {data.notifications ? "On" : "Off"}</p>
                </div>
                <button
                  onClick={toggleNotifications}
                  className="px-6 py-2 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 !border-none"
                >
                  {data.notifications ? "Disable" : "Enable"}
                </button>
              </div>
            </div>

            {/* Debug Data */}
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Current Settings Data</h3>
              <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto">
                {JSON.stringify({ ...data, theme }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;
