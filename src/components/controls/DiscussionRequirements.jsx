function DiscussionRequirements({ settings, updateSetting }) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">forum</span>
                    Discussion Requirements
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Set rules for discussion before voting can begin
                </p>
            </div>

            {/* Require Second */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Require Motion Seconding
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Motions must be seconded by another member before discussion can begin (Robert's Rules standard)
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.requireSecond}
                        onChange={(e) => updateSetting('requireSecond', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            {/* Minimum Speakers Before Vote */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Minimum Speakers Before Vote
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Require at least this many different members to comment before voting opens
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={settings.minSpeakersBeforeVote}
                        onChange={(e) => updateSetting('minSpeakersBeforeVote', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-20 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.minSpeakersBeforeVote}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">speakers</p>
                    </div>
                </div>
                {settings.minSpeakersBeforeVote > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
                        <span className="material-symbols-outlined text-sm mr-1">info</span>
                        Voting will be disabled until {settings.minSpeakersBeforeVote} different member{settings.minSpeakersBeforeVote > 1 ? 's have' : ' has'} commented
                    </div>
                )}
            </div>

            {/* Pro/Con Balance Requirement */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Require Pro/Con Balance
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Require at least one comment supporting and one opposing the motion before voting
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.requireProConBalance}
                        onChange={(e) => updateSetting('requireProConBalance', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            {/* Minimum Discussion Period */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Minimum Discussion Period
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Minimum hours of discussion required before voting can begin
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="168"
                        step="12"
                        value={settings.minDiscussionHours}
                        onChange={(e) => updateSetting('minDiscussionHours', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-24 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.minDiscussionHours}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                            hours ({Math.floor(settings.minDiscussionHours / 24)}d {settings.minDiscussionHours % 24}h)
                        </p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button 
                        onClick={() => updateSetting('minDiscussionHours', 0)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        None
                    </button>
                    <button 
                        onClick={() => updateSetting('minDiscussionHours', 24)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        1 day
                    </button>
                    <button 
                        onClick={() => updateSetting('minDiscussionHours', 72)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        3 days
                    </button>
                    <button 
                        onClick={() => updateSetting('minDiscussionHours', 168)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        1 week
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">summarize</span>
                    Current Discussion Requirements
                </h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.requireSecond ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {settings.requireSecond ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Motions {settings.requireSecond ? 'must' : 'do not need to'} be seconded</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.minSpeakersBeforeVote > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {settings.minSpeakersBeforeVote > 0 ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            {settings.minSpeakersBeforeVote > 0 
                                ? `At least ${settings.minSpeakersBeforeVote} member${settings.minSpeakersBeforeVote > 1 ? 's' : ''} must comment before voting`
                                : 'No minimum speakers required'
                            }
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.requireProConBalance ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {settings.requireProConBalance ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            {settings.requireProConBalance 
                                ? 'Both pro and con arguments required before voting'
                                : 'No pro/con balance required'
                            }
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.minDiscussionHours > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {settings.minDiscussionHours > 0 ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            {settings.minDiscussionHours > 0 
                                ? `Minimum ${settings.minDiscussionHours} hours (${Math.floor(settings.minDiscussionHours / 24)} days) discussion required`
                                : 'No minimum discussion period'
                            }
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default DiscussionRequirements;
