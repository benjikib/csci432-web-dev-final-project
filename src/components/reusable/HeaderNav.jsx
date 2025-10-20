// import { useState } from "react";

// const SearchBar = ( {searchedTerm, setSearchedTerm} ) => {
function SearchBar( {searchedTerm, setSearchedTerm} ) {
        

        // const handleSearch = (e) => {
        //         setSearchedTerm(e.target.value)
        //         console.log(e.target)
        // }

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
export default function HeaderNav( {searchedTerm, setSearchedTerm} ) {
        return (
                <div className="fixed top-0 left-0 right-0 z-50 h-20 w-full flex items-center justify-between border border-gray-400/10 shadow-md shadow-gray-500/50 p-8 bg-white">
        
                        {/* 2. LEFT Elements (Grouped for Logo) */}
                        {/* We wrap the logo elements in a container to justify them as a single unit */}
                        <a href="/" className="flex items-center space-x-2">
                                <span className="text-lighter-green font-extrabold text-2xl site-name">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>                                
                        </a>
                        <SearchBar searchedTerm = {searchedTerm} setSearchedTerm = {setSearchedTerm}  />

                        {/* 1. RIGHT Elements (Evenly Spaced) */}
                        {/* We wrap the three elements in a container using 'space-x-8' for spacing */}
                        <div className="flex items-center gap-8 text-md">
                                <a href="/notifications" title="Notifications" className="text-gray-700 hover:text-gray-900">Notifications</a>
                                <a href="/settings" title="Settings" className="text-gray-700 hover:text-gray-900">Settings</a>
                                <a href="/profile" title="Profile" className="text-gray-700 hover:text-gray-900">Profile</a>
                        </div>
                
                </div>
        );
};

// export default HeaderNav;