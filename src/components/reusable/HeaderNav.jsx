// import { useState } from "react";

// const SearchBar = ( {searchedTerm, setSearchedTerm} ) => {
function SearchBar( {setSearchedTerm} ) {
        // setSearchedTerm is passed from MotionsPage which puts it into HeaderNav and then we get it here in SearchBar finally
        // we just set the searchedTerm (prop that searchBar itself doesn't need to see) to whatever is in the input element

        return (
                <>
                        <div className="flex items-center border border-black bg-superlight-green rounded-sm ml-20 w-100 h-7.5">
                                <span className="material-symbols-outlined text-black ml-1">search</span>
                                <input
                                        placeholder="Search for motions"
                                        className="ml-2 w-full border-transparent focus:outline-none font-[400] text-xs text-black/60"
                                        onChange={ (e) => { setSearchedTerm(e.target.value) } }
                                />
                        </div>
                </>
        )
        
};


// const HeaderNav = ( {searchedTerm, setSearchedTerm} ) => {
export default function HeaderNav( {setSearchedTerm} ) {

        return (
                <div className="fixed top-0 left-0 right-0 z-50 h-20 w-full flex items-center justify-between border border-gray-400/10 shadow-md shadow-gray-500/50 p-8 bg-white">
        
                        {/* The site name and the logo are grouped on the left */}
                        <a href="/" className="flex items-center space-x-2">
                                <span className="text-lighter-green font-extrabold text-2xl site-name">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>                                
                        </a>

                        <SearchBar setSearchedTerm = {setSearchedTerm}  />

                        {/* The notifs, setting, and profile are grouped on the right */}
                        <div className="flex items-center gap-8 text-md">
                                <a href="/notifications" title="Notifications" className="text-gray-700 hover:text-gray-900">Notifications</a>
                                <a href="/settings" title="Settings" className="text-gray-700 hover:text-gray-900">Settings</a>
                                <a href="/profile" title="Profile" className="text-gray-700 hover:text-gray-900">Profile</a>
                        </div>
                
                </div>
        );

};

// export default HeaderNav;