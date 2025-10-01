const SearchBar = () => {
        return (
                <>
                        <div className="flex items-center border-1 border-black bg-superlight-green rounded-sm ml-25 w-100 h-7.5">
                                <span className="material-symbols-outlined text-black ml-1">search</span>
                                <span className="font-[400] text-xs text-black/60 ml-2">Search for motions</span>
                        </div> 
                </>
        )
};


const HeaderNav = () => {
        return (
        //   <div className="fixed top-0 left-0 z-50 h-40 w-1/1 grid grid-cols-5 border border-gray-400/10 shadow-md shadow-gray-500/50 p-4 bg-white">
        //     <a className="logo-link" href="/">
        //       <span className="text-lighter-green font-extrabold size-80">Commie</span>
        //       <img src="/logo.png" alt="Logo" className="nav-logo"></img>
        //     </a>
        //     <div className="nav-right">
        //       <a href="#notifications" title="Notifications">Notifications</a>
        //       <a href="#settings" title="Settings">Settings</a>
        //       <a href="#profile" title="Profile">Profile</a>
        //     </div>
        //   </div>
        // Assume 'lighter-green' and 'h-40' are defined in your tailwind.config.js
                <div className="fixed top-0 left-0 right-0 z-50 h-20 w-full flex items-center justify-between border border-gray-400/10 shadow-md shadow-gray-500/50 p-8 bg-white">
        
                        {/* 2. LEFT Elements (Grouped for Logo) */}
                        {/* We wrap the logo elements in a container to justify them as a single unit */}
                        <a href="/" className="flex items-center space-x-2">
                                <span className="text-lighter-green font-extrabold text-2xl">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>
                                <SearchBar/>
                                {/* <div className="flex items-center border-1 border-black bg-superlight-green rounded-sm ml-25 w-100">
                                        <span className="material-symbols-outlined text-black ml-1">search</span>
                                        <span className="font-[400] text-xs text-black/60 ml-2">Search for motions</span>
                                </div>  */}
                        </a>

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

export default HeaderNav;