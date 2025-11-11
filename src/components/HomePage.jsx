import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import SideBar from './reusable/SideBar';
import HeaderNav from './reusable/HeaderNav';

export default function HomePage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth0();
    const [searchedTerm, setSearchedTerm] = useState("");

    return (
        <>
            <HeaderNav setSearchedTerm={setSearchedTerm} />
            <SideBar />
            <div className="mt-20 ml-[16rem] px-8 min-h-screen bg-[#F8FEF9] dark:bg-gray-900">
                <div className="max-w-5xl">
                    <h2 className="section-title dark:text-gray-100">Home</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                        What would you like to do today?
                    </p>

                    {/* Navigation Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Committees Card */}
                        <div
                            onClick={() => navigate("/committees")}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-8 border border-gray-200 dark:border-gray-700 hover:border-lighter-green dark:hover:border-lighter-green"
                        >
                            <div className="text-center">
                                <span className="material-symbols-outlined text-[12rem] mb-4 text-lighter-green">groups</span>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Committees
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    View and manage your committees
                                </p>
                            </div>
                        </div>

                        {/* Create Committee Card */}
                        <div
                            onClick={() => navigate("/create-committee")}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-8 border border-gray-200 dark:border-gray-700 hover:border-lighter-green dark:hover:border-lighter-green"
                        >
                            <div className="text-center">
                                <span className="material-symbols-outlined text-[12rem] mb-4 text-lighter-green">add_circle</span>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Create Committee
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Start a new committee
                                </p>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div
                            onClick={() => navigate("/settings")}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-8 border border-gray-200 dark:border-gray-700 hover:border-lighter-green dark:hover:border-lighter-green"
                        >
                            <div className="text-center">
                                <span className="material-symbols-outlined text-[12rem] mb-4 text-lighter-green">settings</span>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Settings
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Customize your preferences
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
