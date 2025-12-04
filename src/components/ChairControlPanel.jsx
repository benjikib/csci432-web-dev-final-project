import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Tabs from './reusable/Tabs';
import DiscussionRequirements from './controls/DiscussionRequirements';
import VotingRulesConfig from './controls/VotingRulesConfig';
import MotionManagementControls from './controls/MotionManagementControls';
import CommitteeHistory from './controls/CommitteeHistory';
import CommitteeManagement from './controls/CommitteeManagement';
import { getCommitteeSettings, updateCommitteeSettings } from '../services/committeeSettingsApi';

// Default settings factory function
const getDefaultSettings = () => ({
    // Discussion Requirements
    minSpeakersBeforeVote: 0,
    requireProConBalance: false,
    minDiscussionHours: 0,
    requireSecond: true,
    
    // Voting Rules
    defaultVoteThreshold: 'simple_majority', // 'simple_majority', 'two_thirds', 'unanimous'
    allowAbstentions: true,
    votingPeriodDays: 7,
    voteType: 'ballot', // 'ballot', 'roll_call'
    
    // Quorum
    quorumPercentage: 50,
    quorumRequired: false,
    
    // Motion Management
    allowMultipleActiveMotions: true,
    allowAnonymousMotions: false,
    
    // Committee Settings
    autoArchiveOldMotionsDays: 90,
    requireReasonsForVotes: false,
    committeeVisibility: 'private', // 'public', 'private'
    allowGuestObservers: false
});

function ChairControlPanel({ committeeId, committee }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("meeting-mode");
    const [settings, setSettings] = useState(getDefaultSettings());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch settings when committee changes
    useEffect(() => {
        async function fetchSettings() {
            if (!committeeId) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await getCommitteeSettings(committeeId);
                if (response.success) {
                    // Merge fetched settings with defaults (in case new settings were added)
                    setSettings({
                        ...getDefaultSettings(),
                        ...response.settings
                    });
                }
            } catch (err) {
                console.error('Error fetching committee settings:', err);
                setError(err.message || 'Failed to load settings');
                // Use defaults on error
                setSettings(getDefaultSettings());
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchSettings();
        // Reset to first tab when switching committees
        setActiveTab("discussion");
    }, [committeeId]);

    const tabs = [
        { id: "discussion", label: "Discussion", icon: "chat" },
        { id: "voting", label: "Voting Rules", icon: "how_to_vote" },
        { id: "motions", label: "Motion Control", icon: "article" },
        { id: "management", label: "Management", icon: "group" },
        { id: "history", label: "History", icon: "history" }
    ];

    const updateSetting = (key, value) => {
        const newSettings = {
            ...settings,
            [key]: value
        };
        setSettings(newSettings);
        
        // Auto-save to backend with debouncing (save after user stops making changes)
        // For now, settings are saved when user clicks "Save All Changes"
        // console.log(`Updated ${key} to ${value} for committee ${committeeId}`);
    };

    const updateNestedSetting = (parentKey, childKey, value) => {
        const newSettings = {
            ...settings,
            [parentKey]: {
                ...settings[parentKey],
                [childKey]: value
            }
        };
        setSettings(newSettings);
        
        // console.log(`Updated ${parentKey}.${childKey} to ${value} for committee ${committeeId}`);
    };

    const saveAllSettings = async () => {
        try {
            setIsSaving(true);
            setError(null);
            
            await updateCommitteeSettings(committeeId, settings);
            
            // Show success message
            alert(`Settings saved successfully for ${committee.title}!`);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError(err.message || 'Failed to save settings');
            alert(`Failed to save settings: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* Header with committee name and save button */}
            <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h3 className="text-lg lg:text-xl font-bold text-gray-800 dark:text-gray-200">
                            {committee.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Configure procedural settings and controls
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 lg:gap-3">
                        <button
                            onClick={() => navigate(`/committee/${committeeId}`)}
                            className="px-4 lg:px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-medium flex items-center justify-center gap-2 text-sm lg:text-base whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-lg lg:text-xl">
                                arrow_forward
                            </span>
                            <span>Go To Committee</span>
                        </button>
                        <button
                            onClick={saveAllSettings}
                            disabled={isSaving}
                            className="px-4 lg:px-6 py-2 bg-darker-green text-white rounded-lg hover:bg-opacity-90 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-lg lg:text-xl">
                                {isSaving ? 'progress_activity' : 'save'}
                            </span>
                            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                        <span className="material-symbols-outlined text-xl">error</span>
                        <div>
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="p-12 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4 animate-spin">
                        progress_activity
                    </span>
                    <p className="text-gray-500 dark:text-gray-500">Loading settings...</p>
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="px-6 pt-4">
                        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "discussion" && (
                            <DiscussionRequirements 
                                settings={settings}
                                updateSetting={updateSetting}
                                committeeId={committeeId}
                                committeeTitle={committee.title}
                            />
                        )}
                        
                        {activeTab === "voting" && (
                            <VotingRulesConfig 
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                        
                        {activeTab === "motions" && (
                            <MotionManagementControls 
                                settings={settings}
                                updateSetting={updateSetting}
                                committeeId={committeeId}
                            />
                        )}
                        
                        {activeTab === "management" && (
                            <CommitteeManagement 
                                committeeId={committeeId}
                                committee={committee}
                            />
                        )}
                        
                        {activeTab === "history" && (
                            <CommitteeHistory 
                                committeeId={committeeId}
                                committee={committee}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ChairControlPanel;
