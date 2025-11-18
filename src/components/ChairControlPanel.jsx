import { useState, useEffect } from "react";
import Tabs from './reusable/Tabs';
import MeetingModeControls from './controls/MeetingModeControls';
import DiscussionRequirements from './controls/DiscussionRequirements';
import VotingRulesConfig from './controls/VotingRulesConfig';
import MotionManagementControls from './controls/MotionManagementControls';
import MemberPrivileges from './controls/MemberPrivileges';
import ProceduralSettings from './controls/ProceduralSettings';
import CommitteeSettings from './controls/CommitteeSettings';
import { getCommitteeSettings, updateCommitteeSettings } from '../services/committeeSettingsApi';

// Default settings factory function
const getDefaultSettings = () => ({
    // Meeting Mode
    meetingMode: 'async', // 'async' or 'live'
    
    // Discussion Requirements
    minSpeakersBeforeVote: 0,
    requireProConBalance: false,
    minDiscussionHours: 0,
    requireSecond: true,
    
    // Voting Rules
    defaultVoteThreshold: 'simple_majority', // 'simple_majority', 'two_thirds', 'unanimous'
    allowAbstentions: true,
    votingPeriodDays: 7,
    voteType: 'ballot', // 'voice', 'roll_call', 'ballot', 'unanimous_consent'
    
    // Quorum
    quorumPercentage: 50,
    quorumRequired: false,
    
    // Motion Management
    allowMultipleActiveMotions: true,
    allowAnonymousMotions: false,
    
    // Member Privileges
    speakingTimeLimit: 5, // minutes
    totalSpeakingTimePerMotion: 15, // minutes
    
    // Enforcement Level
    enforcementLevel: 'standard', // 'relaxed', 'standard', 'strict'
    
    // Enabled Motion Types
    enabledMotionTypes: {
        subsidiary: false,
        privileged: false,
        incidental: false,
        reconsider: false
    },
    
    // Committee Settings
    autoArchiveOldMotionsDays: 90,
    requireReasonsForVotes: false,
    committeeVisibility: 'private', // 'public', 'private'
    allowGuestObservers: false
});

function ChairControlPanel({ committeeId, committee }) {
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
        setActiveTab("meeting-mode");
    }, [committeeId]);

    const tabs = [
        { id: "meeting-mode", label: "Meeting Mode" },
        { id: "discussion", label: "Discussion" },
        { id: "voting", label: "Voting Rules" },
        { id: "motions", label: "Motion Control" },
        { id: "privileges", label: "Member Privileges" },
        { id: "procedural", label: "Procedural" },
        { id: "committee", label: "Committee" }
    ];

    const updateSetting = (key, value) => {
        const newSettings = {
            ...settings,
            [key]: value
        };
        setSettings(newSettings);
        
        // Auto-save to backend with debouncing (save after user stops making changes)
        // For now, settings are saved when user clicks "Save All Changes"
        console.log(`Updated ${key} to ${value} for committee ${committeeId}`);
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
        
        console.log(`Updated ${parentKey}.${childKey} to ${value} for committee ${committeeId}`);
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
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            {committee.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Configure procedural settings and controls
                        </p>
                    </div>
                    <button
                        onClick={saveAllSettings}
                        disabled={isSaving}
                        className="px-6 py-2 bg-darker-green text-white rounded-lg hover:bg-opacity-90 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSaving ? 'progress_activity' : 'save'}
                        </span>
                        {isSaving ? 'Saving...' : 'Save All Changes'}
                    </button>
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
                        {activeTab === "meeting-mode" && (
                            <MeetingModeControls 
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                        
                        {activeTab === "discussion" && (
                            <DiscussionRequirements 
                                settings={settings}
                                updateSetting={updateSetting}
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
                        
                        {activeTab === "privileges" && (
                            <MemberPrivileges 
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                        
                        {activeTab === "procedural" && (
                            <ProceduralSettings 
                                settings={settings}
                                updateSetting={updateSetting}
                                updateNestedSetting={updateNestedSetting}
                            />
                        )}
                        
                        {activeTab === "committee" && (
                            <CommitteeSettings 
                                settings={settings}
                                updateSetting={updateSetting}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ChairControlPanel;
