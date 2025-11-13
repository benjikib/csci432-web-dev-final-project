import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { useTheme } from '../context/ThemeContext';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserSettings, updateUserSettings } from '../services/userApi';

function Settings() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { logout } = useAuth0();

  const [data, setData] = useState({
    notifications: true,
  });

  const [searchedTerm, setSearchedTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState({
    notifications: true,
  });

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getUserSettings();
        if (response.success) {
          const settings = {
            notifications: response.settings.notifications,
          };
          setData(settings);
          setOriginalData(settings);
          // Sync theme with context
          if (response.settings.theme !== theme) {
            setTheme(response.settings.theme);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save all settings to database
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage("");

      const updates = {
        notifications: data.notifications,
        theme: theme
      };

      const response = await updateUserSettings(updates);
      if (response.success) {
        setSuccessMessage('Settings saved successfully!');
        setHasUnsavedChanges(false);
        setOriginalData({
          notifications: data.notifications,
        });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setData(prev => ({ ...prev, notifications: !prev.notifications }));
    setHasUnsavedChanges(true);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    toggleTheme();
    setHasUnsavedChanges(true);
  };

  return (
    <>
      <HeaderNav setSearchedTerm={setSearchedTerm} />
      <SideBar />
      <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
        <div className="max-w-4xl">
          <h2 className="section-title dark:text-gray-100">Settings</h2>

          {loading ? (
            <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              Failed to load settings
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                  {successMessage}
                </div>
              )}

              {/* Unsaved Changes Indicator */}
              {hasUnsavedChanges && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg">
                  You have unsaved changes. Click "Save Settings" to apply them.
                </div>
              )}

              {/* Profile Info Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl">info</span>
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                      Want to change your name or display name?
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Visit your{' '}
                      <Link to="/profile" className="underline hover:text-blue-900 dark:hover:text-blue-100">
                        Profile page
                      </Link>
                      {' '}to edit your full name and display name.
                    </p>
                  </div>
                </div>
              </div>

              {/* Theme Section */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Theme</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current: {theme}</p>
                  </div>
                  <button
                    onClick={handleToggleTheme}
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

              {/* Save Button */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving || !hasUnsavedChanges}
                  className="w-full px-6 py-3 !bg-lighter-green !text-white rounded-lg font-semibold hover:!bg-darker-green transition-all hover:scale-105 !border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>

            {/* Logout Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">Account</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth0_token');
                    logout({ logoutParams: { returnTo: window.location.origin } });
                  }}
                  className="px-6 py-2 !bg-red-500 !text-white rounded-lg font-semibold hover:!bg-red-600 transition-all hover:scale-105 !border-none"
                >
                  Logout
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
          )}
        </div>
      </div>
    </>
  );
}

export default Settings;
