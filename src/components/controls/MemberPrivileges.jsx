function MemberPrivileges({ settings, updateSetting }) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">supervisor_account</span>
                    Member Privileges & Controls
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage speaking rights and member participation limits
                </p>
            </div>

            {/* Speaking Time Limit per Turn */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Speaking Time Limit (per turn)
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Maximum minutes a member can speak each time they're recognized (in live meetings)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="15"
                        value={settings.speakingTimeLimit}
                        onChange={(e) => updateSetting('speakingTimeLimit', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-24 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.speakingTimeLimit}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">minutes</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button 
                        onClick={() => updateSetting('speakingTimeLimit', 2)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        2 min
                    </button>
                    <button 
                        onClick={() => updateSetting('speakingTimeLimit', 5)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        5 min (standard)
                    </button>
                    <button 
                        onClick={() => updateSetting('speakingTimeLimit', 10)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        10 min
                    </button>
                </div>
            </div>

            {/* Total Speaking Time per Motion */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Total Speaking Time per Motion
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Maximum total minutes a member can speak on a single motion (across all turns)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="5"
                        max="30"
                        step="5"
                        value={settings.totalSpeakingTimePerMotion}
                        onChange={(e) => updateSetting('totalSpeakingTimePerMotion', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-24 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.totalSpeakingTimePerMotion}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">minutes</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button 
                        onClick={() => updateSetting('totalSpeakingTimePerMotion', 10)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        10 min
                    </button>
                    <button 
                        onClick={() => updateSetting('totalSpeakingTimePerMotion', 15)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        15 min
                    </button>
                    <button 
                        onClick={() => updateSetting('totalSpeakingTimePerMotion', 20)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        20 min
                    </button>
                </div>
            </div>

            {/* Live Meeting Controls Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                    Live Meeting Privilege Controls
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    When in Live Meeting Mode, you gain additional real-time controls:
                </p>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">done</span>
                        <div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                Recognize Speakers
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Control who has the floor from the speaker queue
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">done</span>
                        <div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                Grant/Revoke Floor Access
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Temporarily remove speaking privileges from specific members
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">done</span>
                        <div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                Time Enforcement
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Automatic timers cut off speakers when time limit is reached
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">done</span>
                        <div>
                            <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                Eject from Meeting
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                Remove disruptive members from the live session
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions for Member Management */}
            <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h5>
                <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">people</span>
                        View Member List
                    </button>
                    <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">forum</span>
                        View Speaker Queue
                    </button>
                    <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">timer</span>
                        Speaking Time Report
                    </button>
                    <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">settings</span>
                        Manage Roles
                    </button>
                </div>
            </div>

            {/* Current Settings Summary */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">summarize</span>
                    Current Member Privilege Settings
                </h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                        <span>Speaking time per turn: <strong>{settings.speakingTimeLimit} minutes</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                        <span>Total speaking time per motion: <strong>{settings.totalSpeakingTimePerMotion} minutes</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                        <span>Maximum speaking turns: <strong>{Math.floor(settings.totalSpeakingTimePerMotion / settings.speakingTimeLimit)} turns</strong></span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default MemberPrivileges;
