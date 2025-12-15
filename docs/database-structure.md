# Database Structure Documentation

## Overview

**Database Name**: `commie`
**Database Type**: MongoDB (NoSQL, document-based)
**Driver**: MongoDB Node.js Driver v6.20.0
**Total Collections**: 7

This document describes the complete database schema, including all collections (tables), their fields (columns), data types, and relationships.

---

## Collections (Tables)

### 1. Users Collection

**Collection Name**: `users`

**Description**: Stores user account information, authentication credentials, roles, permissions, and committee relationships.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| email | String | Yes | - | User email address (unique) |
| emailVerified | Boolean | No | false | Email verification status |
| password | String | No | - | Hashed password (bcryptjs) |
| name | String | Yes | - | User's full name |
| nickname | String | No | - | Display nickname/alias |
| picture | String | No | - | Profile picture URL |
| communityCode | String | No | - | Community identifier code |
| bio | String | No | - | User biography/description |
| phoneNumber | String | No | - | Contact phone number |
| address | String | No | - | User's address |
| organizationId | ObjectId | No | null | Reference to Organization |
| organizationRole | String | No | null | Role in organization: 'admin' or 'member' |
| settings | Object | Yes | Default object | User preferences and settings |
| settings.theme | String | Yes | 'light' | UI theme: 'light' or 'dark' |
| settings.notifications | Boolean | Yes | true | Notification preference |
| settings.displayName | String | Yes | name | Display name preference |
| settings.enabledNotificationOrgs | Array | Yes | [] | Organization IDs for super-admin notifications |
| roles | Array | Yes | ['user'] | User roles: 'super-admin', 'admin', 'user', 'guest' |
| permissions | Array | Yes | [] | Permission strings |
| ownedCommittees | Array | Yes | [] | Array of committee ObjectIds user owns |
| chairedCommittees | Array | Yes | [] | Array of committee ObjectIds user chairs |
| memberCommittees | Array | Yes | [] | Array of committee ObjectIds user is member of |
| guestCommittees | Array | Yes | [] | Array of committee ObjectIds user is guest of |
| authoredMotions | Array | Yes | [] | Array of motion ObjectIds user created |
| lastLogin | Date | No | - | Last login timestamp |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### Indexes
- `email` (unique)

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john.doe@example.com",
  "password": "$2a$10$...",
  "name": "John Doe",
  "nickname": "Johnny",
  "organizationId": ObjectId("507f1f77bcf86cd799439012"),
  "organizationRole": "admin",
  "settings": {
    "theme": "dark",
    "notifications": true,
    "displayName": "John Doe",
    "enabledNotificationOrgs": []
  },
  "roles": ["user", "admin"],
  "permissions": ["edit_any_committee"],
  "ownedCommittees": [ObjectId("507f1f77bcf86cd799439013")],
  "chairedCommittees": [ObjectId("507f1f77bcf86cd799439014")],
  "memberCommittees": [ObjectId("507f1f77bcf86cd799439015")],
  "guestCommittees": [],
  "authoredMotions": [ObjectId("507f1f77bcf86cd799439016")],
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T12:30:00.000Z")
}
```

---

### 2. Organizations Collection

**Collection Name**: `organizations`

**Description**: Represents organizations/groups that contain committees and members.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| name | String | Yes | - | Organization name |
| slug | String | Yes | Auto-generated | URL-friendly slug identifier |
| description | String | No | '' | Organization description |
| inviteCode | String | Yes | Auto-generated | Unique invite code (ORG-{slug}-{random}) |
| owner | ObjectId | Yes | - | Reference to User (owner) |
| admins | Array | Yes | [] | Array of admin user ObjectIds |
| members | Array | Yes | [] | Array of all member user ObjectIds |
| subscription | Object | Yes | Default object | Subscription details |
| subscription.status | String | Yes | 'trial' | 'trial', 'active', 'cancelled', 'expired' |
| subscription.plan | String | Yes | 'basic' | 'basic', 'premium', 'enterprise' |
| subscription.stripeCustomerId | String | No | - | Stripe customer ID |
| subscription.stripeSubscriptionId | String | No | - | Stripe subscription ID |
| subscription.trialEndsAt | Date | Yes | 30 days from creation | Trial end date |
| subscription.currentPeriodEnd | Date | No | - | Current billing period end |
| settings | Object | Yes | Default object | Organization settings |
| settings.maxCommittees | Number | Yes | Varies by plan | Maximum committees allowed |
| settings.maxMembersPerCommittee | Number | Yes | Varies by plan | Max members per committee |
| settings.maxUsers | Number | Yes | Varies by plan | Maximum users allowed |
| settings.features | Object | Yes | Default object | Feature flags |
| settings.features.advancedReporting | Boolean | Yes | false | Advanced reporting feature |
| settings.features.customBranding | Boolean | Yes | false | Custom branding feature |
| settings.features.apiAccess | Boolean | Yes | false | API access feature |
| branding | Object | Yes | Default object | Branding configuration |
| branding.logoUrl | String | No | - | Organization logo URL |
| branding.primaryColor | String | Yes | '#007bff' | Primary brand color (hex) |
| branding.secondaryColor | String | Yes | '#6c757d' | Secondary brand color (hex) |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### Indexes
- `slug` (unique)
- `inviteCode` (unique)

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "Tech Committee",
  "slug": "tech-committee",
  "description": "Technology governance committee",
  "inviteCode": "ORG-tech-committee-abc123",
  "owner": ObjectId("507f1f77bcf86cd799439011"),
  "admins": [ObjectId("507f1f77bcf86cd799439011")],
  "members": [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439020")
  ],
  "subscription": {
    "status": "active",
    "plan": "premium",
    "stripeCustomerId": "cus_xxxxx",
    "stripeSubscriptionId": "sub_xxxxx",
    "trialEndsAt": ISODate("2024-02-01T00:00:00.000Z"),
    "currentPeriodEnd": ISODate("2024-12-31T00:00:00.000Z")
  },
  "settings": {
    "maxCommittees": 50,
    "maxMembersPerCommittee": 100,
    "maxUsers": 500,
    "features": {
      "advancedReporting": true,
      "customBranding": true,
      "apiAccess": false
    }
  },
  "branding": {
    "logoUrl": "https://example.com/logo.png",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d"
  },
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T12:30:00.000Z")
}
```

---

### 3. Committees Collection

**Collection Name**: `committees`

**Description**: Committees within organizations that manage motions, voting, and discussions.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| title | String | Yes | - | Committee name/title |
| slug | String | Yes | Auto-generated | URL-friendly slug identifier |
| description | String | No | '' | Committee description |
| members | Array | Yes | [] | Array of member objects |
| members[].userId | ObjectId/String | Yes | - | User ID (accepts both types) |
| members[].role | String | Yes | - | 'owner', 'chair', 'member', 'guest' |
| members[].joinedAt | Date | Yes | Current time | Join timestamp |
| owner | ObjectId | No | - | Committee owner user ID |
| chair | ObjectId | No | - | Committee chair user ID |
| organizationId | ObjectId | No | null | Reference to parent Organization |
| settings | Object | No | {} | Committee-specific settings |
| motions | Array | Yes | [] | Embedded array of motion documents |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### Embedded Motion Schema (within committees.motions array)

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Unique motion ID |
| title | String | Yes | - | Motion title |
| description | String | No | '' | Short description |
| fullDescription | String | No | '' | Full motion description |
| author | ObjectId | No | - | User ID of motion author |
| motionType | String | Yes | 'main' | Motion type code |
| motionTypeLabel | String | Yes | - | Human-readable motion type |
| debatable | Boolean | Yes | true | Whether motion is debatable |
| amendable | Boolean | Yes | true | Whether motion can be amended |
| voteRequired | String | Yes | 'majority' | Voting threshold: 'majority', 'supermajority', 'unanimous' |
| targetMotionId | ObjectId | No | null | Reference to parent motion (for amendments) |
| amendTargetMotionId | ObjectId | No | null | Legacy: same as targetMotionId |
| status | String | Yes | 'active' | 'active', 'passed', 'failed', 'voided', 'tabled', 'past' |
| votes | Object | Yes | {yes:0, no:0, abstain:0} | Vote counts |
| votes.yes | Number | Yes | 0 | Yes vote count |
| votes.no | Number | Yes | 0 | No vote count |
| votes.abstain | Number | Yes | 0 | Abstain vote count |
| isAnonymous | Boolean | No | false | Whether votes are anonymous |
| secondedBy | ObjectId | No | null | User who seconded the motion |
| votingStatus | String | Yes | 'not-started' | 'not-started', 'open', 'closed' |
| votingOpenedAt | Date | No | - | When voting opened |
| votingClosedAt | Date | No | - | When voting closed |
| createdAt | Date | Yes | Auto-generated | Motion creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Motion last update timestamp |

#### Motion Types
- `main` - Main motion
- `amend` - Amendment to main motion
- `refer_to_committee` - Refer to committee
- `postpone` - Postpone motion
- `limit_debate` - Limit/extend debate
- `previous_question` - Call the question
- `table` - Table the motion
- `reconsider` - Reconsider previous decision

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "title": "Budget Committee",
  "slug": "budget-committee",
  "description": "Handles all budget-related matters",
  "owner": ObjectId("507f1f77bcf86cd799439011"),
  "chair": ObjectId("507f1f77bcf86cd799439011"),
  "organizationId": ObjectId("507f1f77bcf86cd799439012"),
  "members": [
    {
      "userId": ObjectId("507f1f77bcf86cd799439011"),
      "role": "chair",
      "joinedAt": ISODate("2024-01-01T00:00:00.000Z")
    },
    {
      "userId": ObjectId("507f1f77bcf86cd799439020"),
      "role": "member",
      "joinedAt": ISODate("2024-01-05T00:00:00.000Z")
    }
  ],
  "settings": {
    "requireQuorum": true,
    "quorumPercentage": 51,
    "minimumDiscussionTime": 3600
  },
  "motions": [
    {
      "_id": ObjectId("507f1f77bcf86cd799439016"),
      "title": "Approve FY2024 Budget",
      "description": "Budget approval for fiscal year 2024",
      "author": ObjectId("507f1f77bcf86cd799439011"),
      "motionType": "main",
      "motionTypeLabel": "Main Motion",
      "debatable": true,
      "amendable": true,
      "voteRequired": "majority",
      "status": "active",
      "votingStatus": "open",
      "votes": {
        "yes": 5,
        "no": 2,
        "abstain": 1
      },
      "votingOpenedAt": ISODate("2024-01-10T10:00:00.000Z"),
      "createdAt": ISODate("2024-01-10T09:00:00.000Z"),
      "updatedAt": ISODate("2024-01-10T14:30:00.000Z")
    }
  ],
  "createdAt": ISODate("2024-01-01T00:00:00.000Z"),
  "updatedAt": ISODate("2024-01-15T12:30:00.000Z")
}
```

---

### 4. Motions Collection (Legacy)

**Collection Name**: `motions`

**Description**: Standalone motions collection (exists in parallel to embedded motions in committees for legacy compatibility).

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| committeeId | ObjectId | Yes | - | Reference to Committee |
| title | String | Yes | - | Motion title |
| description | String | No | '' | Short description |
| fullDescription | String | No | '' | Full motion description |
| author | ObjectId | No | - | User ID of motion author |
| status | String | Yes | 'active' | 'active', 'past', 'voided' |
| votes | Object | Yes | {yes:0, no:0, abstain:0} | Vote counts |
| targetMotionId | ObjectId | No | null | Reference to parent motion |
| amendTargetMotionId | ObjectId | No | null | Legacy: same as targetMotionId |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

---

### 5. Votes Collection

**Collection Name**: `votes`

**Description**: Individual votes cast by users on motions.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| motionId | ObjectId | Yes | - | Reference to Motion |
| committeeId | ObjectId | Yes | - | Reference to Committee |
| userId | String | Yes | - | User ID (stored as string) |
| vote | String | Yes | - | Vote value: 'yes', 'no', 'abstain' |
| isAnonymous | Boolean | No | false | Whether vote is anonymous |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### Indexes
- `{motionId: 1, userId: 1}` (unique) - One vote per user per motion
- `motionId` - Query performance
- `committeeId` - Query performance
- `updatedAt` - Query performance

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439017"),
  "motionId": ObjectId("507f1f77bcf86cd799439016"),
  "committeeId": ObjectId("507f1f77bcf86cd799439013"),
  "userId": "507f1f77bcf86cd799439011",
  "vote": "yes",
  "isAnonymous": false,
  "createdAt": ISODate("2024-01-10T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-10T10:30:00.000Z")
}
```

---

### 6. Comments Collection

**Collection Name**: `comments`

**Description**: Comments and discussion on motions.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| motionId | ObjectId | Yes | - | Reference to Motion |
| committeeId | ObjectId | Yes | - | Reference to Committee |
| author | String/ObjectId | Yes | - | User ID of comment author |
| content | String | Yes | - | Comment text content |
| stance | String | No | null | 'pro', 'con', 'neutral' |
| isSystemMessage | Boolean | Yes | false | Whether it's a system-generated message |
| messageType | String | No | null | Type of system message |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### System Message Types
- `voting-eligible` - Motion eligible for voting
- `roll-call-vote` - Roll call vote initiated
- `voting-opened` - Voting period opened
- `voting-closed` - Voting period closed

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439018"),
  "motionId": ObjectId("507f1f77bcf86cd799439016"),
  "committeeId": ObjectId("507f1f77bcf86cd799439013"),
  "author": "507f1f77bcf86cd799439011",
  "content": "I support this budget proposal because it allocates funds efficiently.",
  "stance": "pro",
  "isSystemMessage": false,
  "createdAt": ISODate("2024-01-10T09:30:00.000Z"),
  "updatedAt": ISODate("2024-01-10T09:30:00.000Z")
}
```

---

### 7. Notifications Collection

**Collection Name**: `notifications`

**Description**: Notifications for users regarding access requests, voting, and other activities.

#### Schema

| Field | Data Type | Required | Default | Description |
|-------|-----------|----------|---------|-------------|
| _id | ObjectId | Yes | Auto-generated | Primary key |
| type | String | Yes | - | Notification type |
| committeeId | ObjectId/String | No | - | Reference to Committee |
| committeeTitle | String | No | - | Committee name (snapshot) |
| requesterId | ObjectId/String | No | - | User ID of requester |
| requesterName | String | No | - | Name of requester (snapshot) |
| message | String | No | '' | Notification message |
| targetType | String | No | null | Type of target: 'motion', 'comment', etc. |
| targetId | ObjectId/String | No | null | Reference to target resource |
| metadata | Object | No | {} | Additional metadata |
| status | String | Yes | 'pending' | 'pending', 'approved', 'denied', 'seen' |
| handledBy | ObjectId/String | No | null | User ID who handled notification |
| handledAt | Date | No | null | When notification was handled |
| seenAt | Date | No | null | When notification was seen |
| createdAt | Date | Yes | Auto-generated | Document creation timestamp |
| updatedAt | Date | Yes | Auto-updated | Document last update timestamp |

#### Notification Types
- `access_request` - Request to join committee
- `voting_opened` - Voting is now open for a motion
- `voting_deadline_approaching` - Voting deadline is approaching
- `meeting_scheduled` - Meeting has been scheduled
- `motion_update` - Motion status has changed

#### Example Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439019"),
  "type": "access_request",
  "committeeId": ObjectId("507f1f77bcf86cd799439013"),
  "committeeTitle": "Budget Committee",
  "requesterId": ObjectId("507f1f77bcf86cd799439020"),
  "requesterName": "Jane Smith",
  "message": "I would like to join this committee to contribute to budget discussions.",
  "status": "pending",
  "createdAt": ISODate("2024-01-12T08:00:00.000Z"),
  "updatedAt": ISODate("2024-01-12T08:00:00.000Z")
}
```

---

## Relationships and Foreign Keys

### Entity Relationship Diagram (Text Format)

```
Users
├── organizationId → Organizations._id (Many-to-One)
├── ownedCommittees → Committees._id (One-to-Many, array)
├── chairedCommittees → Committees._id (One-to-Many, array)
├── memberCommittees → Committees._id (One-to-Many, array)
├── guestCommittees → Committees._id (One-to-Many, array)
└── authoredMotions → Motions._id (One-to-Many, array)

Organizations
├── owner → Users._id (Many-to-One)
├── admins → Users._id (One-to-Many, array)
└── members → Users._id (One-to-Many, array)

Committees
├── organizationId → Organizations._id (Many-to-One)
├── owner → Users._id (Many-to-One)
├── chair → Users._id (Many-to-One)
├── members[].userId → Users._id (One-to-Many, embedded)
└── motions → Embedded motion documents (One-to-Many, embedded)

Motions (embedded in Committees)
├── author → Users._id (Many-to-One)
├── secondedBy → Users._id (Many-to-One)
└── targetMotionId → Motions._id (Many-to-One, self-reference)

Motions (standalone collection)
├── committeeId → Committees._id (Many-to-One)
├── author → Users._id (Many-to-One)
└── targetMotionId → Motions._id (Many-to-One, self-reference)

Votes
├── motionId → Motions._id (Many-to-One)
├── committeeId → Committees._id (Many-to-One)
└── userId → Users._id (Many-to-One)

Comments
├── motionId → Motions._id (Many-to-One)
├── committeeId → Committees._id (Many-to-One)
└── author → Users._id (Many-to-One)

Notifications
├── committeeId → Committees._id (Many-to-One)
├── requesterId → Users._id (Many-to-One)
├── targetId → Motions._id or Comments._id (Many-to-One, polymorphic)
└── handledBy → Users._id (Many-to-One)
```

### Detailed Relationships

1. **User ↔ Organization** (Many-to-One)
   - A user belongs to one organization via `users.organizationId`
   - An organization has many members via `organizations.members[]`

2. **Organization ↔ Committee** (One-to-Many)
   - An organization has many committees via `committees.organizationId`
   - A committee belongs to one organization

3. **User ↔ Committee** (Many-to-Many)
   - Users can have multiple roles in multiple committees
   - Stored bidirectionally:
     - `users.ownedCommittees[]`, `users.chairedCommittees[]`, `users.memberCommittees[]`, `users.guestCommittees[]`
     - `committees.members[]` array with role information

4. **Committee ↔ Motion** (One-to-Many, Embedded)
   - A committee has many motions via `committees.motions[]` (embedded array)
   - Motions are embedded documents within the committee
   - Also exists as separate collection for legacy compatibility

5. **Motion ↔ Motion** (Self-Reference, One-to-Many)
   - Motions can have subsidiary motions (amendments, etc.)
   - Via `motion.targetMotionId` pointing to parent motion

6. **User ↔ Vote ↔ Motion** (Many-to-Many through Votes)
   - A user can vote on many motions
   - A motion can have many votes
   - Junction table: `votes` collection
   - Unique constraint: One vote per user per motion

7. **Motion ↔ Comment** (One-to-Many)
   - A motion can have many comments
   - A comment belongs to one motion via `comments.motionId`

8. **User ↔ Notification** (One-to-Many)
   - A user can receive many notifications
   - Notifications track requester via `notifications.requesterId`
   - Notifications track handler via `notifications.handledBy`

---

## Cascade Deletion Rules

### When a User is Deleted:
- **Committees**: Ownership/chair transferred or committee deleted
- **Motions**: Author field cleared or motion voided
- **Votes**: User's votes deleted
- **Comments**: User's comments deleted
- **Notifications**: User's notifications deleted

### When an Organization is Deleted:
- **Committees**: All committees in the organization deleted (cascade)
- **Users**: Members' `organizationId` set to null
- **Motions**: Deleted via committee cascade

### When a Committee is Deleted:
- **Motions**: All embedded motions deleted
- **Votes**: All votes on committee motions deleted
- **Comments**: All comments on committee motions deleted
- **Users**: Committee removed from user's committee arrays

### When a Motion is Deleted:
- **Subsidiary Motions**: All child motions deleted
- **Votes**: All votes on the motion deleted
- **Comments**: All comments on the motion deleted

---

## Data Integrity Constraints

### Unique Constraints
- `users.email` - Must be unique
- `organizations.slug` - Must be unique
- `organizations.inviteCode` - Must be unique
- `committees.slug` - Should be unique within organization
- `votes.{motionId + userId}` - One vote per user per motion

### Required Fields
- All `_id` fields are required and auto-generated
- `createdAt` and `updatedAt` are required and auto-managed
- See individual collection schemas for other required fields

### Default Values
- Arrays default to `[]`
- Objects default to `{}`
- Booleans default to `false`
- Dates are auto-generated for timestamps

---

## Database Design Patterns

### 1. Embedded vs. Referenced Documents
- **Embedded**: Motions within committees (for performance)
- **Referenced**: Votes and comments (for data consistency)
- **Hybrid**: Motions exist both embedded and in separate collection

### 2. Denormalization
- Vote counts stored in motion document (`motion.votes`)
- Vote counts also calculated from votes collection
- Committee member information duplicated in users and committees
- Requester name and committee title stored in notifications (snapshots)

### 3. Polymorphic References
- `notifications.targetId` can reference different types (motion, comment)
- Determined by `notifications.targetType`

### 4. Soft Deletion
- Motions use status 'voided' instead of hard delete
- Comments may be marked as system messages instead of deleted

### 5. Backward Compatibility
- Both `targetMotionId` and `amendTargetMotionId` maintained
- Members array accepts both String and ObjectId formats
- Author fields accept both String and ObjectId formats

---

## Performance Optimization

### Indexes
Currently only the votes collection has explicit indexes:
- `{motionId: 1, userId: 1}` (unique)
- `motionId`
- `committeeId`
- `updatedAt`

### Recommended Additional Indexes
- `users.email` (unique)
- `users.organizationId`
- `organizations.slug` (unique)
- `committees.organizationId`
- `committees.slug`
- `comments.motionId`
- `notifications.type`, `notifications.status`

### Embedding Strategy
Motions are embedded in committees to reduce joins and improve read performance for common queries (loading committee with all motions).

---

## Migration Files

Migration scripts are located in `/backend/migrations/`:
- `add-slugs.js` - Adds slug fields to committees and organizations
- `embed-motions.js` - Embeds motions into committee documents

---

## Database Configuration

**Configuration File**: `/backend/config/database.js`

**Connection**: MongoDB connection via environment variable `MONGODB_URI`

---

## Model Files

All Mongoose model definitions are in `/backend/models/`:
- `User.js` - User model
- `Organization.js` - Organization model
- `Committee.js` - Committee model
- `Motion.js` - Motion model
- `Vote.js` - Vote model
- `Comment.js` - Comment model
- `Notification.js` - Notification model

---

## Summary Statistics

- **Total Collections**: 7
- **Total Base Fields**: ~100+
- **Foreign Key Relationships**: 15+
- **Unique Constraints**: 3-4
- **Explicit Indexes**: 4 (on votes collection)
- **Embedded Document Types**: 2 (members in committees, motions in committees)

---

## Notes

1. **MongoDB ObjectId**: 24-character hexadecimal string (12-byte value)
2. **Date Format**: ISO 8601 format stored as BSON Date type
3. **Array Fields**: Can be empty `[]` but should not be null
4. **Null vs. Undefined**: Use `null` for optional fields when not set
5. **Mixed Types**: Some fields accept both String and ObjectId for backward compatibility

---

## Support

For questions about the database structure or schema changes, please contact the development team or refer to the model files in `/backend/models/`.
