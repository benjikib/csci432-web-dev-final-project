function MeetingModeControls({ settings, updateSetting }) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">meeting_room</span>
                    Meeting Mode
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Choose how your committee conducts meetings and discussions
                </p>
            </div>

            {/* Meeting Mode Selection */}
            <div className="space-y-4">
                <div 
                    onClick={() => updateSetting('meetingMode', 'async')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        settings.meetingMode === 'async'
                            ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                            settings.meetingMode === 'async'
                                ? 'border-darker-green bg-darker-green'
                                : 'border-gray-300 dark:border-gray-600'
                        }`}>
                            {settings.meetingMode === 'async' && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Online/Async Mode (Default)
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Members can discuss and vote at any time. No real-time restrictions. 
                                Motions remain open for discussion and voting according to configured time periods.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    Flexible timing
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                    Asynchronous discussion
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => updateSetting('meetingMode', 'live')}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        settings.meetingMode === 'live'
                            ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                            settings.meetingMode === 'live'
                                ? 'border-darker-green bg-darker-green'
                                : 'border-gray-300 dark:border-gray-600'
                        }`}>
                            {settings.meetingMode === 'live' && (
                                <div className="w-3 h-3 rounded-full bg-white"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                Live Meeting Mode
                                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                                    LIVE
                                </span>
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Enable real-time meeting controls with floor queue management. 
                                Chair recognizes speakers, controls discussion flow, and manages voting in real-time.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                                    Floor queue
                                </span>
                                <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                                    Real-time control
                                </span>
                                <span className="text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded">
                                    Synchronized voting
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Mode Features (shown when live mode is selected) */}
            {settings.meetingMode === 'live' && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">info</span>
                        Live Meeting Features
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                            <span>Members can request the floor (raise hand)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                            <span>Chair controls speaker queue and recognition</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                            <span>Real-time vote counting and results</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                            <span>Discussion locked during voting periods</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-0.5">check_circle</span>
                            <span>Automatic quorum tracking and enforcement</span>
                        </li>
                    </ul>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h5>
                <div className="grid grid-cols-2 gap-3">
                    {settings.meetingMode === 'live' ? (
                        <>
                            <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">play_arrow</span>
                                Start Live Meeting
                            </button>
                            <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">people</span>
                                View Speaker Queue
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">schedule</span>
                                Schedule Meeting
                            </button>
                            <button className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">forum</span>
                                View Discussions
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MeetingModeControls;
