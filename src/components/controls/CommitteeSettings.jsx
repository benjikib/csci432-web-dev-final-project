function CommitteeSettings({ settings, updateSetting }) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">settings</span>
                    Committee Settings
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    General committee configuration and data management
                </p>
            </div>

            {/* Auto-archive Old Motions */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Auto-archive Old Motions
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically archive completed motions after this many days
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="365"
                        step="30"
                        value={settings.autoArchiveOldMotionsDays}
                        onChange={(e) => updateSetting('autoArchiveOldMotionsDays', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-24 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.autoArchiveOldMotionsDays}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">days</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button 
                        onClick={() => updateSetting('autoArchiveOldMotionsDays', 0)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        Never
                    </button>
                    <button 
                        onClick={() => updateSetting('autoArchiveOldMotionsDays', 30)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        30 days
                    </button>
                    <button 
                        onClick={() => updateSetting('autoArchiveOldMotionsDays', 90)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        90 days
                    </button>
                    <button 
                        onClick={() => updateSetting('autoArchiveOldMotionsDays', 180)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        6 months
                    </button>
                    <button 
                        onClick={() => updateSetting('autoArchiveOldMotionsDays', 365)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        1 year
                    </button>
                </div>
                {settings.autoArchiveOldMotionsDays === 0 && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
                        <span className="material-symbols-outlined text-sm mr-1">info</span>
                        Motions will never be automatically archived
                    </div>
                )}
            </div>

            {/* Require Reasons for Votes */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Require Reasons for Votes
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Members must provide a comment explaining their vote choice
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.requireReasonsForVotes}
                        onChange={(e) => updateSetting('requireReasonsForVotes', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            {/* Committee Visibility */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Committee Visibility
                </h5>
                <div className="space-y-3">
                    <div
                        onClick={() => updateSetting('committeeVisibility', 'private')}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            settings.committeeVisibility === 'private'
                                ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                settings.committeeVisibility === 'private'
                                    ? 'border-darker-green bg-darker-green'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}>
                                {settings.committeeVisibility === 'private' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                    Private
                                </h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Only committee members can view motions and discussions
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => updateSetting('committeeVisibility', 'public')}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            settings.committeeVisibility === 'public'
                                ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                settings.committeeVisibility === 'public'
                                    ? 'border-darker-green bg-darker-green'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}>
                                {settings.committeeVisibility === 'public' && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h6 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                    Public
                                </h6>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Anyone can view motions and discussions (voting requires membership)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guest Observer Access */}
            {settings.committeeVisibility === 'public' && (
                <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Allow Guest Observers
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Non-members can view (but not participate in) committee activities
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                            type="checkbox"
                            checked={settings.allowGuestObservers}
                            onChange={(e) => updateSetting('allowGuestObservers', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                    </label>
                </div>
            )}

            {/* Export & Data Management */}
            <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Data Management
                </h5>
                <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">download</span>
                        Export Minutes (PDF)
                    </button>
                    <button className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">table_view</span>
                        Export Data (CSV)
                    </button>
                    <button className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">archive</span>
                        View Archive
                    </button>
                    <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">history</span>
                        View History Log
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">summarize</span>
                    Current Committee Settings
                </h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm mt-0.5">check_circle</span>
                        <span>
                            Auto-archive: {settings.autoArchiveOldMotionsDays === 0 
                                ? 'Never' 
                                : `After ${settings.autoArchiveOldMotionsDays} days`
                            }
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.requireReasonsForVotes ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                            {settings.requireReasonsForVotes ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            Vote reasons: {settings.requireReasonsForVotes ? 'Required' : 'Optional'}
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-sm mt-0.5">check_circle</span>
                        <span className="capitalize">
                            Visibility: <strong>{settings.committeeVisibility}</strong>
                        </span>
                    </li>
                    {settings.committeeVisibility === 'public' && (
                        <li className="flex items-start gap-2">
                            <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.allowGuestObservers ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400'}`}>
                                {settings.allowGuestObservers ? 'check_circle' : 'cancel'}
                            </span>
                            <span>
                                Guest observers: {settings.allowGuestObservers ? 'Allowed' : 'Not allowed'}
                            </span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default CommitteeSettings;
