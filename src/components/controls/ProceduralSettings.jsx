function ProceduralSettings({ settings, updateSetting, updateNestedSetting }) {
    const enforcementLevels = [
        {
            value: 'relaxed',
            label: 'Relaxed',
            description: 'Minimal procedure enforcement for casual committees',
            features: ['Basic motion creation', 'Simple voting', 'Informal discussion']
        },
        {
            value: 'standard',
            label: 'Standard (Recommended)',
            description: 'Basic Robert\'s Rules with common motions',
            features: ['Main motions', 'Seconding required', 'Standard voting thresholds', 'Basic amendments']
        },
        {
            value: 'strict',
            label: 'Strict',
            description: 'Full Robert\'s Rules compliance for formal assemblies',
            features: ['All motion types', 'Precedence enforcement', 'Strict speaking rules', 'Full parliamentary procedure']
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">policy</span>
                    Procedural Settings & Robert's Rules
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure Robert's Rules enforcement level and enabled motion types
                </p>
            </div>

            {/* Enforcement Level Selection */}
            <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Procedural Enforcement Level
                </h5>
                <div className="space-y-3">
                    {enforcementLevels.map((level) => (
                        <div
                            key={level.value}
                            onClick={() => updateSetting('enforcementLevel', level.value)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                settings.enforcementLevel === level.value
                                    ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                                    settings.enforcementLevel === level.value
                                        ? 'border-darker-green bg-darker-green'
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}>
                                    {settings.enforcementLevel === level.value && (
                                        <div className="w-3 h-3 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                        {level.label}
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {level.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {level.features.map((feature, idx) => (
                                            <span 
                                                key={idx}
                                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Special Motion Types (only available in Standard/Strict modes) */}
            {(settings.enforcementLevel === 'standard' || settings.enforcementLevel === 'strict') && (
                <div>
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                        Enabled Special Motion Types
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enable advanced motion types beyond basic main motions
                    </p>

                    <div className="space-y-3">
                        {/* Subsidiary Motions */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">edit_note</span>
                                        Subsidiary Motions
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Motions that modify or affect the main motion
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledMotionTypes.subsidiary}
                                        onChange={(e) => updateNestedSetting('enabledMotionTypes', 'subsidiary', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                                </label>
                            </div>
                            {settings.enabledMotionTypes.subsidiary && (
                                <div className="mt-3 pl-8 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <div>• <strong>Amend</strong> - Modify the motion text</div>
                                    <div>• <strong>Postpone to a certain time</strong> - Delay consideration</div>
                                    <div>• <strong>Refer to committee</strong> - Send for further review</div>
                                    <div>• <strong>Limit/extend debate</strong> - Control discussion time</div>
                                </div>
                            )}
                        </div>

                        {/* Privileged Motions */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">priority_high</span>
                                        Privileged Motions
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        High-priority motions that don't relate to pending business
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledMotionTypes.privileged}
                                        onChange={(e) => updateNestedSetting('enabledMotionTypes', 'privileged', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                                </label>
                            </div>
                            {settings.enabledMotionTypes.privileged && (
                                <div className="mt-3 pl-8 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <div>• <strong>Recess</strong> - Take a short break</div>
                                    <div>• <strong>Adjourn</strong> - End the meeting</div>
                                    <div>• <strong>Question of privilege</strong> - Address urgent member needs</div>
                                </div>
                            )}
                        </div>

                        {/* Incidental Motions */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">report_problem</span>
                                        Incidental Motions
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Motions arising incidentally from pending business
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledMotionTypes.incidental}
                                        onChange={(e) => updateNestedSetting('enabledMotionTypes', 'incidental', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                                </label>
                            </div>
                            {settings.enabledMotionTypes.incidental && (
                                <div className="mt-3 pl-8 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <div>• <strong>Point of order</strong> - Object to procedural error</div>
                                    <div>• <strong>Appeal</strong> - Challenge chair's ruling</div>
                                    <div>• <strong>Suspend the rules</strong> - Temporarily waive procedures</div>
                                    <div>• <strong>Division of assembly</strong> - Request verified vote count</div>
                                </div>
                            )}
                        </div>

                        {/* Reconsider Motion */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-red-600 dark:text-red-400">replay</span>
                                        Motion to Reconsider
                                    </h6>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Allow overturning previous decisions (only by original supporters)
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledMotionTypes.reconsider}
                                        onChange={(e) => updateNestedSetting('enabledMotionTypes', 'reconsider', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                                </label>
                            </div>
                            {settings.enabledMotionTypes.reconsider && (
                                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                                    <span className="material-symbols-outlined text-sm mr-1">warning</span>
                                    Only members who voted in favor of the original motion can move to reconsider
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">summarize</span>
                    Current Procedural Configuration
                </h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">check_circle</span>
                        <span>
                            Enforcement level: <strong className="capitalize">{settings.enforcementLevel}</strong>
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.enabledMotionTypes.subsidiary ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                            {settings.enabledMotionTypes.subsidiary ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Subsidiary motions (amend, postpone, refer): {settings.enabledMotionTypes.subsidiary ? 'Enabled' : 'Disabled'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.enabledMotionTypes.privileged ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                            {settings.enabledMotionTypes.privileged ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Privileged motions (recess, adjourn): {settings.enabledMotionTypes.privileged ? 'Enabled' : 'Disabled'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.enabledMotionTypes.incidental ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                            {settings.enabledMotionTypes.incidental ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Incidental motions (point of order, appeal): {settings.enabledMotionTypes.incidental ? 'Enabled' : 'Disabled'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.enabledMotionTypes.reconsider ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                            {settings.enabledMotionTypes.reconsider ? 'check_circle' : 'cancel'}
                        </span>
                        <span>Motion to reconsider: {settings.enabledMotionTypes.reconsider ? 'Enabled' : 'Disabled'}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ProceduralSettings;
