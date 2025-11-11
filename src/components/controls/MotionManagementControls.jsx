import { getMotionsByCommittee } from '../CommitteeStorage';

function MotionManagementControls({ settings, updateSetting, committeeId }) {
    // Get active motions for this committee (placeholder - will come from backend)
    const activeMotions = getMotionsByCommittee(committeeId).filter(m => m.status === 'active' || !m.status);

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">gavel</span>
                    Motion Management & Controls
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Override motion status and manage procedural controls
                </p>
            </div>

            {/* Motion Settings */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Allow Multiple Active Motions
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Multiple motions can be in discussion/voting simultaneously (strict Robert's Rules: one at a time)
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.allowMultipleActiveMotions}
                        onChange={(e) => updateSetting('allowMultipleActiveMotions', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Allow Anonymous Motions
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Members can submit motions without their name being displayed
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.allowAnonymousMotions}
                        onChange={(e) => updateSetting('allowAnonymousMotions', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            {/* Active Motions Quick Controls */}
            {activeMotions.length > 0 && (
                <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Active Motion Controls
                    </h5>
                    <div className="space-y-3">
                        {activeMotions.map((motion) => (
                            <div 
                                key={motion.id}
                                className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                            {motion.title}
                                        </h6>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                            {motion.description}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded ml-2">
                                        Motion #{motion.id}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                                        Open Voting
                                    </button>
                                    <button className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">pause</span>
                                        Pause
                                    </button>
                                    <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        Postpone
                                    </button>
                                    <button className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        Declare Out of Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Emergency Motion Creation */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">warning</span>
                    Emergency Motion
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Create an emergency motion that bypasses normal discussion periods and goes straight to voting
                </p>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined">emergency</span>
                    Create Emergency Motion
                </button>
            </div>

            {/* Chair Powers Summary */}
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">security</span>
                    Chair Powers & Overrides
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    As chair, you can exercise the following special powers:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Override Motion Status</strong> - Move motions between discussion and voting phases</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Extend/Shorten Periods</strong> - Adjust discussion and voting timeframes</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Declare Out of Order</strong> - Rule motions as procedurally incorrect</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Postpone Indefinitely</strong> - Table motions without setting return date</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Close Voting Early</strong> - End voting if threshold already met/impossible</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm mt-0.5">check_circle</span>
                        <span><strong>Bundle Motions</strong> - Group related motions for single vote</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default MotionManagementControls;
