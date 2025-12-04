import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';
import { useTheme } from '../context/ThemeContext';
import { getUserSettings, updateUserSettings, deleteUser, getCurrentUser } from '../services/userApi';

function Settings() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();

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
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const userResponse = await getCurrentUser();
        if (userResponse.success) {
          setCurrentUser(userResponse.user);
        }
        
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
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        navigate('/login');
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
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                  }}
                  className="px-6 py-2 !bg-red-500 !text-white rounded-lg font-semibold hover:!bg-red-600 transition-all hover:scale-105 !border-none"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow-sm border-2 border-red-300 dark:border-red-700">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">delete_forever</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    <strong>Warning:</strong> This action is permanent and will:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1 mb-4">
                    <li>Remove you from all committees</li>
                    <li>Delete all your votes and comments</li>
                    <li>Delete all your notifications</li>
                    {currentUser?.organizationRole === 'admin' && currentUser?.organizationId && (
                      <>
                        <li><strong>Delete your entire organization (you are the owner)</strong></li>
                        <li><strong>Cancel your subscription (mock)</strong></li>
                        <li><strong>Delete all committees and motions</strong></li>
                      </>
                    )}
                    <li>Permanently delete your account</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={async () => {
                  const currentUserData = await getCurrentUser();
                  const isOrgOwner = currentUserData.user?.organizationRole === 'admin' && currentUserData.user?.organizationId;
                  
                  let warningMessage = 'Are you absolutely sure you want to delete your account?\n\n' +
                    'This will:\n' +
                    '- Remove you from all committees\n' +
                    '- Delete all your votes and comments\n' +
                    '- Delete all your notifications\n';
                  
                  if (isOrgOwner) {
                    warningMessage += '- DELETE YOUR ORGANIZATION (you are the owner)\n' +
                      '- Cancel your subscription (mock)\n' +
                      '- Remove all organization members\n' +
                      '- Delete all committees and motions\n';
                  }
                  
                  warningMessage += '- Log you out immediately\n\n' +
                    'This action CANNOT be undone!';
                  
                  const confirmed = window.confirm(warningMessage);
                  
                  if (!confirmed) return;
                  
                  const confirmText = window.prompt(
                    'Type "DELETE MY ACCOUNT" to confirm:'
                  );
                  
                  if (confirmText !== 'DELETE MY ACCOUNT') {
                    setError('Confirmation text did not match. Deletion cancelled.');
                    setTimeout(() => setError(null), 3000);
                    return;
                  }
                  
                  try {
                    const result = await deleteUser(currentUserData.user.id);
                    if (result.success) {
                      if (result.organizationDeleted) {
                        alert(
                          `Account and Organization Deleted\n\n` +
                          `Organization: ${result.organizationStats.organizationName}\n` +
                          `Committees deleted: ${result.organizationStats.committees}\n` +
                          `Motions deleted: ${result.organizationStats.motions}\n` +
                          `Subscription cancelled (mock)`
                        );
                      }
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      navigate('/login');
                    } else {
                      setError(result.message || 'Failed to delete account');
                      setTimeout(() => setError(null), 5000);
                    }
                  } catch (err) {
                    setError('Failed to delete account: ' + err.message);
                    setTimeout(() => setError(null), 5000);
                  }
                }}
                className="px-6 py-2 !bg-red-600 !text-white rounded-lg font-semibold hover:!bg-red-700 transition-all hover:scale-105 !border-none"
              >
                Delete My Account
              </button>
            </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Settings;
