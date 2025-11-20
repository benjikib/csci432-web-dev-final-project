// const SearchBar = ( {searchedTerm, setSearchedTerm} ) => {
function SearchBar( {setSearchedTerm} ) {
        // setSearchedTerm is passed from MotionsPage which puts it into HeaderNav and then we get it here in SearchBar finally
        // we just set the searchedTerm (prop that searchBar itself doesn't need to see) to whatever is in the input element

        return (
                <>
                        <div className="flex items-center border border-black dark:border-gray-600 bg-[#F8FEF9] dark:bg-gray-800 rounded-sm ml-20 w-100 h-7.5">
                                <span className="material-symbols-outlined text-black dark:text-gray-300 ml-1">search</span>
                                <input
                                        placeholder="Search for motions"
                                        className="ml-1.5 w-full h-full border-transparent focus:outline-none font-[400] text-xs text-black/60 dark:text-gray-300 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        onChange={ (e) => { setSearchedTerm(e.target.value) } }
                                        autoComplete="off"
                                />
                        </div>
                </>
        )

};


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api.js';

// const HeaderNav = ( {searchedTerm, setSearchedTerm} ) => {
export default function HeaderNav( {setSearchedTerm} ) {
        const navigate = useNavigate();
        const [user, setUser] = useState(null);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [showNotifications, setShowNotifications] = useState(false);

        useEffect(() => {
                async function fetchUserData() {
                        // Check if user is logged in
                        const token = localStorage.getItem('token');

                        if (token) {
                                try {
                                        // Fetch current user data from API to get latest profile picture
                                        const response = await fetch(`${API_BASE_URL}/auth/me`, {
                                                headers: {
                                                        'Authorization': `Bearer ${token}`
                                                }
                                        });

                                        if (response.ok) {
                                                const data = await response.json();
                                                setIsAuthenticated(true);
                                                setUser(data.user);
                                                // Update localStorage with latest user data
                                                localStorage.setItem('user', JSON.stringify(data.user));
                                        } else {
                                                // Token is invalid
                                                setIsAuthenticated(false);
                                                setUser(null);
                                                localStorage.removeItem('token');
                                                localStorage.removeItem('user');
                                        }
                                } catch (err) {
                                        console.error('Error fetching user data:', err);
                                        setIsAuthenticated(false);
                                        setUser(null);
                                }
                        } else {
                                setIsAuthenticated(false);
                                setUser(null);
                        }
                }

                fetchUserData();
        }, []);

        const handleLogout = () => {
                // Clear token and user from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
                navigate('/');
        };

        const handleLogin = () => {
                navigate('/');
        };

        return (
                <div className="fixed top-0 left-0 right-0 z-50 h-20 w-full flex items-center justify-between border border-gray-400/10 dark:border-gray-700 shadow-md shadow-gray-500/50 dark:shadow-black/50 p-8 bg-white dark:bg-gray-900">

                        {/* The site name and the logo are grouped on the left */}
                        <a href="/home" className="flex items-center space-x-2">
                                <span className="text-lighter-green dark:text-white font-extrabold text-2xl site-name">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>
                        </a>

                        <SearchBar setSearchedTerm = {setSearchedTerm}  />

                        {/* The notifs, setting, and profile are grouped on the right */}
                        <div className="flex items-center gap-6">
                                {isAuthenticated ? (
                                        <>
                                                {/* Notifications with hover dropdown */}
                                                <div
                                                        className="relative"
                                                        onMouseEnter={() => setShowNotifications(true)}
                                                        onMouseLeave={() => setShowNotifications(false)}
                                                >
                                                        <button
                                                                onClick={() => navigate('/notifications')}
                                                                title="Notifications"
                                                                className="hover:scale-110 transition-all relative !border-none !bg-transparent !outline-none focus:!outline-none focus:!ring-0 focus:!border-none p-0"
                                                        >
                                                                <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">
                                                                        notifications
                                                                </span>
                                                                {/* Notification badge */}
                                                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                                                        3
                                                                </span>
                                                        </button>

                                                        {/* Notifications Dropdown */}
                                                        {showNotifications && (
                                                                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                                                                        {/* Header */}
                                                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                                                                <div className="flex items-center justify-between">
                                                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                                                                Notifications
                                                                                        </h3>
                                                                                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                                                                                                3 new
                                                                                        </span>
                                                                                </div>
                                                                        </div>

                                                                        {/* Notifications List */}
                                                                        <div className="max-h-96 overflow-y-auto">
                                                                                {/* Mock notification items */}
                                                                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                                                        <div className="flex gap-3">
                                                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                                                                                        <span className="material-symbols-outlined text-amber-500">how_to_vote</span>
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                                                                                New motion requires your vote
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                                                Motion "Update Budget" is now open
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-500 dark:text-gray-500">2h ago</p>
                                                                                                </div>
                                                                                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-lighter-green"></span>
                                                                                        </div>
                                                                                </div>

                                                                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                                                        <div className="flex gap-3">
                                                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                                                                        <span className="material-symbols-outlined text-blue-500">comment</span>
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                                                                                New comment on your motion
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                                                John Doe commented on "New Policy"
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-500 dark:text-gray-500">5h ago</p>
                                                                                                </div>
                                                                                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-lighter-green"></span>
                                                                                        </div>
                                                                                </div>

                                                                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                                                                                        <div className="flex gap-3">
                                                                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                                                                                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                                                                                Motion passed
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                                                                "Security Updates" passed with 8 votes
                                                                                                        </p>
                                                                                                        <p className="text-xs text-gray-500 dark:text-gray-500">1d ago</p>
                                                                                                </div>
                                                                                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-lighter-green"></span>
                                                                                        </div>
                                                                                </div>
                                                                        </div>

                                                                        {/* Footer */}
                                                                        <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                                                                                <button
                                                                                        onClick={() => navigate('/notifications')}
                                                                                        className="text-sm text-lighter-green hover:text-darker-green font-medium"
                                                                                >
                                                                                        View all notifications
                                                                                </button>
                                                                        </div>
                                                                </div>
                                                        )}
                                                </div>
                                                <a href="/settings" title="Settings" className="hover:scale-110 transition-all">
                                                        <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">settings</span>
                                                </a>
                                                <a href="/profile" title="Profile" className="hover:scale-110 transition-all">
                                                        {user?.picture ? (
                                                                <img src={user.picture} alt="Profile" className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                                                        ) : (
                                                                <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">account_circle</span>
                                                        )}
                                                </a>
                                                <button
                                                        onClick={handleLogout}
                                                        className="text-sm px-3 py-1.5 rounded bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
                                                        title="Logout"
                                                >
                                                        Logout
                                                </button>
                                        </>
                                ) : (
                                        <button
                                                onClick={handleLogin}
                                                className="text-sm px-4 py-2 rounded bg-[#54966D] hover:bg-[#5ca377] text-white font-medium transition-all"
                                        >
                                                Login
                                        </button>
                                )}
                        </div>

                </div>
        );

};

// export default HeaderNav;
