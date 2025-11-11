import { useState, useEffect } from "react";
import Tabs from './reusable/Tabs';
import MeetingModeControls from './controls/MeetingModeControls';
import DiscussionRequirements from './controls/DiscussionRequirements';
import VotingRulesConfig from './controls/VotingRulesConfig';
import MotionManagementControls from './controls/MotionManagementControls';
import MemberPrivileges from './controls/MemberPrivileges';
import ProceduralSettings from './controls/ProceduralSettings';
import CommitteeSettings from './controls/CommitteeSettings';

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

// Store settings per committee (simulating backend storage)
const committeeSettingsCache = {};

function ChairControlPanel({ committeeId, committee }) {
    const [activeTab, setActiveTab] = useState("meeting-mode");
    
    // Initialize settings from cache or defaults
    const [settings, setSettings] = useState(() => {
        if (committeeSettingsCache[committeeId]) {
            return committeeSettingsCache[committeeId];
        }
        return getDefaultSettings();
    });

    // Reset settings when committee changes
    useEffect(() => {
        // Load settings for this committee from cache or use defaults
        if (committeeSettingsCache[committeeId]) {
            setSettings(committeeSettingsCache[committeeId]);
        } else {
            const defaultSettings = getDefaultSettings();
            setSettings(defaultSettings);
            committeeSettingsCache[committeeId] = defaultSettings;
        }
        
        // Reset to first tab when switching committees
        setActiveTab("meeting-mode");
        
        // TODO: In production, fetch settings from backend API here
        // fetchCommitteeSettings(committeeId).then(setSettings);
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
        
        // Update cache so settings persist when switching committees
        committeeSettingsCache[committeeId] = newSettings;
        
        // TODO: Save to backend API
        console.log(`Updating ${key} to ${value} for committee ${committeeId}`);
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
        
        // Update cache so settings persist when switching committees
        committeeSettingsCache[committeeId] = newSettings;
        
        // TODO: Save to backend API
        console.log(`Updating ${parentKey}.${childKey} to ${value} for committee ${committeeId}`);
    };

    const saveAllSettings = () => {
        // TODO: API call to save all settings
        alert(`Settings saved for ${committee.title}!\n(Backend integration pending)`);
        console.log('Saving settings:', settings);
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
                        className="px-6 py-2 bg-darker-green text-white rounded-lg hover:bg-opacity-90 transition-all font-medium flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-xl">save</span>
                        Save All Changes
                    </button>
                </div>
            </div>

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
        </div>
    );
}

export default ChairControlPanel;
