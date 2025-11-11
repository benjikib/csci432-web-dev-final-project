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


// const HeaderNav = ( {searchedTerm, setSearchedTerm} ) => {
export default function HeaderNav( {setSearchedTerm} ) {

        return (
                <div className="fixed top-0 left-0 right-0 z-50 h-20 w-full flex items-center justify-between border border-gray-400/10 dark:border-gray-700 shadow-md shadow-gray-500/50 dark:shadow-black/50 p-8 bg-white dark:bg-gray-900">
        
                        {/* The site name and the logo are grouped on the left */}
                        <a href="/" className="flex items-center space-x-2">
                                <span className="text-lighter-green dark:text-white font-extrabold text-2xl site-name">Commie</span>
                                <img src="/logo.png" alt="Logo" className="w-18 h-18"></img>
                        </a>

                        <SearchBar setSearchedTerm = {setSearchedTerm}  />

                        {/* The notifs, setting, and profile are grouped on the right */}
                        <div className="flex items-center gap-6">
                                <a href="/notifications" title="Notifications" className="hover:scale-110 transition-all">
                                        <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">notifications</span>
                                </a>
                                <a href="/settings" title="Settings" className="hover:scale-110 transition-all">
                                        <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">settings</span>
                                </a>
                                <a href="/profile" title="Profile" className="hover:scale-110 transition-all">
                                        <span className="material-symbols-outlined text-4xl !text-gray-600 dark:!text-white hover:!text-gray-900 dark:hover:!text-gray-300">account_circle</span>
                                </a>
                        </div>
                
                </div>
        );

};

// export default HeaderNav;