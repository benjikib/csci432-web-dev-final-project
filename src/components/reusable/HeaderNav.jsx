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
                        <a href="/committees" className="flex items-center space-x-2">
                                <span className="text-lighter-green dark:text-white font-extrabold text-2xl site-name">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>
                        </a>

                        <SearchBar setSearchedTerm = {setSearchedTerm}  />

                        {/* The notifs, setting, and profile are grouped on the right */}
                        <div className="flex items-center gap-6">
                                {isAuthenticated ? (
                                        <>
                                                <a href="/notifications" title="Notifications" className="hover:scale-110 transition-all">
                                                        <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">notifications</span>
                                                </a>
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
