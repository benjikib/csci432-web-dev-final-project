# Chair Control Panel - Implementation Guide

## Overview
The Chair Control Panel is a comprehensive interface for committee chairs to manage procedural settings, and voting rules according to Robert's Rules of Order.

## Features Implemented


### 1. **Discussion Requirements** (`/src/components/controls/DiscussionRequirements.jsx`)
- **Require Seconding**: Toggle for motion seconding requirement
- **Minimum Speakers**: Set number of required speakers before voting (0-10)
- **Pro/Con Balance**: Require balanced discussion
- **Discussion Period**: Minimum hours required (0-168 hours/7 days)

### 2. **Voting Rules Configuration** (`/src/components/controls/VotingRulesConfig.jsx`)
- **Vote Thresholds**:
  - Simple Majority (50%+1)
  - Two-Thirds Majority (66.67%)
  - Unanimous (100%)
- **Vote Types**:
  - Secret Ballot (anonymous)
  - Roll Call (public, recorded)
  - Unanimous Consent (no objection)
- **Voting Period**: 1-30 days
- **Quorum**: Toggle with percentage (10-100%)
- **Abstentions**: Allow/disallow

### 3. **Motion Management Controls** (`/src/components/controls/MotionManagementControls.jsx`)
- **Motion Settings**:
  - Allow multiple active motions
  - Allow anonymous motions
- **Active Motion Controls** (per motion):
  - Edit
  - Void

### 4. **Committee History** (`/src/components/controls/CommitteeHistory.jsx`)
- **Motion History View**:
  - Complete motion archive with all statuses
  - Vote results and percentages
  - Discussion transcript with pro/con stances
  - Subsidiary motions display
  - Meeting duration calculation (from creation to voting closed)
- **Download Motion Documents**:
  - Export individual motion records as text files
  - Includes full description, vote results, timestamps
  - Contains complete discussion transcript
  - Shows total meeting time in document
  - Formatted for archival purposes


## File Structure

```
src/components/
├── UserControlPage.jsx          # Main control panel page with role check
├── ChairControlPanel.jsx        # Tabbed interface container
└── controls/
    ├── DiscussionRequirements.jsx
    ├── VotingRulesConfig.jsx
    ├── MotionManagementControls.jsx
    ├── ProceduralSettings.jsx
    └── CommitteeSettings.jsx
```

## Usage

### Accessing the Control Panel
1. Navigate to `/user-control`
2. Only users with `role: "chair"` can access
3. Select a committee from the left sidebar
4. Configure settings using the tabbed interface

### Role Check
The control panel checks `mockCurrentUser.role === "chair"`. In production, this will be replaced with actual authentication:

```javascript
// Current (mock):
const mockCurrentUser = {
    id: "user1",
    name: "John Chair",
    role: "chair"
};

// Future (from auth context):
const { user } = useAuth();
const isChair = user.committees.some(c => c.role === "chair");
```

### Committee Selection
Only committees where the user has the "chair" role are displayed. Currently using mock data:

```javascript
const chairCommittees = [
    {
        id: 1,
        title: "Finance Committee",
        memberCount: 12,
        activeMotions: 3
    }
    // ... more committees
];
```

### Settings Persistence
Settings are now integrated with the backend API:

```javascript
const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Settings saved when user clicks "Save All Changes" button
};

const saveAllSettings = async () => {
    await updateCommitteeSettings(committeeId, settings);
};
```

## Settings Data Structure

```javascript
{
    // Meeting Mode
    meetingMode: 'async', // 'async' | 'live'
    
    // Discussion
    minSpeakersBeforeVote: 0,
    requireProConBalance: false,
    minDiscussionHours: 0,
    requireSecond: true,
    
    // Voting
    defaultVoteThreshold: 'simple_majority',
    allowAbstentions: true,
    votingPeriodDays: 7,
    voteType: 'ballot',
    quorumPercentage: 50,
    quorumRequired: false,
    
    // Motion Management
    allowMultipleActiveMotions: true,
    allowAnonymousMotions: false,
    
    // Member Privileges
    speakingTimeLimit: 5,
    totalSpeakingTimePerMotion: 15,
    
    // Procedural
    enforcementLevel: 'standard',
    enabledMotionTypes: {
        subsidiary: false,
        privileged: false,
        incidental: false,
        reconsider: false
    },
    
    // Committee
    autoArchiveOldMotionsDays: 90,
    requireReasonsForVotes: false,
    committeeVisibility: 'private',
    allowGuestObservers: false
}
```

## Backend Integration

### ✅ Completed API Endpoints
- `GET /committees/my-chairs` - Get committees where user is chair (optimized server-side filtering)
- `GET /committee/:id/settings` - Fetch current settings
- `PATCH /committee/:id/settings` - Update settings (partial update)
- `PUT /committee/:id` - Update full committee including settings

### ✅ Database Schema
Committee model includes settings field:

```javascript
{
    settings: {} // Stores all procedural settings as flexible object
}
```

Motion model now includes Robert's Rules fields:

```javascript
{
    motionType: 'main',
    motionTypeLabel: 'Main Motion',
    debatable: true,
    amendable: true,
    voteRequired: 'majority',
    targetMotionId: ObjectId // For subsidiary motions (canonical); `amendTargetMotionId` is still supported for now
}
```

## Robert's Rules Compliance

The control panel implements key Robert's Rules concepts:

1. **Quorum**: Minimum attendance for valid decisions
2. **Seconding**: Ensures at least two members support discussion
3. **Vote Thresholds**: Different majorities for different motion types
4. **Speaking Privileges**: Fair distribution of discussion time
5. **Motion Precedence**: Proper handling of subsidiary/privileged motions
6. **Reconsideration**: Ability to overturn with restrictions

## UI/UX Features

- **Committee Cards**: Visual selection with highlight on active
- **Tabbed Interface**: Organized settings by category
- **Real-time Updates**: Settings changes reflected immediately
- **Visual Summaries**: Each tab shows current configuration
- **Toggle Switches**: Intuitive boolean settings
- **Range Sliders**: Easy numeric value selection
- **Quick Preset Buttons**: Common values for rapid configuration
- **Info Boxes**: Contextual help and feature descriptions
- **Dark Mode Support**: All components support theme switching

## Testing Checklist

- [x] User with chair role can access control panel
- [x] Non-chair users see access denied message
- [x] Committee selection highlights active committee
- [x] All 7 tabs render without errors
- [x] Settings update in state correctly
- [x] All toggles, sliders, and radio buttons functional
- [x] Summaries reflect current settings
- [x] Nested settings (enabledMotionTypes) update properly
- [x] Dark mode works on all controls
- [x] Backend API integration complete
- [x] Settings persist to database
- [x] Settings load from database on mount
- [x] Chair committees fetched from backend
- [x] JWT authentication integrated
- [ ] Settings validation and enforcement in motion workflow
- [ ] Quorum checking implementation
- [ ] Live meeting mode features

## Next Steps

1. **✅ Backend Integration** (COMPLETED):
   - ✅ Created API endpoints for settings CRUD
   - ✅ Added settings field to Committee schema
   - ✅ Implemented JWT role checking
   - ✅ Added motion type metadata to schema
   - ✅ Created subsidiary motion tracking endpoints

2. **Enforcement** (COMPLETED):
   - Apply settings to motion creation workflow
   - Enforce voting rules during vote casting
   - Implement quorum checking
   - Add discussion requirement validation

3. **Live Meeting Mode**:
   - Build speaker queue UI
   - Implement floor request system
   - Add real-time vote counting
   - Create timer for speaking limits

4. **Advanced Features**:
   - Subsidiary/privileged motion creation
   - Amendment workflow
   - Point of order system
   - Motion precedence enforcement
