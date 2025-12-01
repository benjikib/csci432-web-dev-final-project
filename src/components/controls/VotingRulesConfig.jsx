function VotingRulesConfig({ settings, updateSetting }) {
    const voteThresholds = [
        { value: 'simple_majority', label: 'Simple Majority', description: 'More than 50% (standard)', percentage: '50%+1' },
        { value: 'two_thirds', label: 'Two-Thirds Majority', description: 'At least 66.67% (procedural motions)', percentage: '66.67%' },
        { value: 'unanimous', label: 'Unanimous', description: 'All votes in favor (100%)', percentage: '100%' }
    ];

    const voteTypes = [
        { value: 'ballot', label: 'Secret Ballot', description: 'Anonymous voting, results shown after voting closes', icon: 'how_to_vote' },
        { value: 'roll_call', label: 'Roll Call Vote', description: 'Public vote with each member\'s choice recorded', icon: 'fact_check' },
        { value: 'unanimous_consent', label: 'Unanimous Consent', description: 'Pass without objection, no formal vote needed', icon: 'done_all' }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined">how_to_vote</span>
                    Voting Rules & Configuration
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Configure voting thresholds, types, and requirements
                </p>
            </div>

            {/* Default Vote Threshold */}
            <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Default Vote Threshold</h5>
                <div className="space-y-3">
                    {voteThresholds.map((threshold) => (
                        <div
                            key={threshold.value}
                            onClick={() => updateSetting('defaultVoteThreshold', threshold.value)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                settings.defaultVoteThreshold === threshold.value
                                    ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        settings.defaultVoteThreshold === threshold.value
                                            ? 'border-darker-green bg-darker-green'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                        {settings.defaultVoteThreshold === threshold.value && (
                                            <div className="w-3 h-3 rounded-full bg-white"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h6 className="font-semibold text-gray-800 dark:text-gray-200">
                                            {threshold.label}
                                        </h6>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {threshold.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                                        {threshold.percentage}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Default Vote Type */}
            <div>
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Default Vote Type</h5>
                <div className="grid grid-cols-2 gap-3">
                    {voteTypes.map((type) => (
                        <div
                            key={type.value}
                            onClick={() => updateSetting('voteType', type.value)}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                settings.voteType === type.value
                                    ? 'border-darker-green bg-superlight-green/10 dark:bg-darker-green/10'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`material-symbols-outlined text-3xl ${
                                    settings.voteType === type.value
                                        ? 'text-darker-green dark:text-superlight-green'
                                        : 'text-gray-400 dark:text-gray-600'
                                }`}>
                                    {type.icon}
                                </span>
                                <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                        {type.label}
                                    </h6>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {type.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Voting Period */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Voting Period Duration
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            How long voting remains open once started
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="1"
                        max="30"
                        value={settings.votingPeriodDays}
                        onChange={(e) => updateSetting('votingPeriodDays', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                    />
                    <div className="w-20 text-center">
                        <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                            {settings.votingPeriodDays}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-500">days</p>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button 
                        onClick={() => updateSetting('votingPeriodDays', 1)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        1 day
                    </button>
                    <button 
                        onClick={() => updateSetting('votingPeriodDays', 3)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        3 days
                    </button>
                    <button 
                        onClick={() => updateSetting('votingPeriodDays', 7)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        1 week
                    </button>
                    <button 
                        onClick={() => updateSetting('votingPeriodDays', 14)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        2 weeks
                    </button>
                </div>
            </div>

            {/* Quorum Settings */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            Quorum Requirement
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Minimum percentage of members that must vote for result to be valid
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                        <input
                            type="checkbox"
                            checked={settings.quorumRequired}
                            onChange={(e) => updateSetting('quorumRequired', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                    </label>
                </div>

                {settings.quorumRequired && (
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={settings.quorumPercentage}
                            onChange={(e) => updateSetting('quorumPercentage', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-darker-green"
                        />
                        <div className="w-20 text-center">
                            <span className="text-2xl font-bold text-darker-green dark:text-superlight-green">
                                {settings.quorumPercentage}%
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Abstentions */}
            <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                        Allow Abstentions
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Members can choose to abstain from voting (neither for nor against)
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                        type="checkbox"
                        checked={settings.allowAbstentions}
                        onChange={(e) => updateSetting('allowAbstentions', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-darker-green"></div>
                </label>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">summarize</span>
                    Current Voting Configuration
                </h5>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">check_circle</span>
                        <span>
                            Default threshold: <strong>{voteThresholds.find(t => t.value === settings.defaultVoteThreshold)?.label}</strong> 
                            ({voteThresholds.find(t => t.value === settings.defaultVoteThreshold)?.percentage})
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">check_circle</span>
                        <span>
                            Vote type: <strong>{voteTypes.find(t => t.value === settings.voteType)?.label}</strong>
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-0.5">check_circle</span>
                        <span>
                            Voting period: <strong>{settings.votingPeriodDays} day{settings.votingPeriodDays > 1 ? 's' : ''}</strong>
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.quorumRequired ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                            {settings.quorumRequired ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            {settings.quorumRequired 
                                ? `Quorum required: ${settings.quorumPercentage}% of members must vote`
                                : 'No quorum requirement'
                            }
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className={`material-symbols-outlined text-sm mt-0.5 ${settings.allowAbstentions ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                            {settings.allowAbstentions ? 'check_circle' : 'cancel'}
                        </span>
                        <span>
                            Abstentions {settings.allowAbstentions ? 'allowed' : 'not allowed'}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default VotingRulesConfig;
