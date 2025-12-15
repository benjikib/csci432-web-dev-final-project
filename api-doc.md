# Backend API Documentation

## Overview

This is the REST API documentation for the Parliamentary Motion Management System. The API is built with Express.js and MongoDB, providing endpoints for committee management, motion tracking, voting, and discussions.

**Base URL (Local)**: `http://localhost:3001`
**Framework**: Express.js with Node.js
**Database**: MongoDB
**Authentication**: JWT (JSON Web Tokens)
**Deployment**: Vercel (serverless) with fallback to local server

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "communityCode": "optional-code",
  "organizationInviteCode": "ORG-slug-xxxxx" // optional
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**: Same as register response

#### Logout
**POST** `/auth/logout`

Invalidate the current session token.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
**GET** `/auth/me`

Get the current authenticated user's profile.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"],
    "organizationId": "507f1f77bcf86cd799439012",
    "settings": {
      "theme": "light",
      "notifications": true
    }
  }
}
```

---

## User Management

#### Get User Settings
**GET** `/auth/settings`

Get current user's settings.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "notifications": true,
    "displayName": "John Doe"
  }
}
```

#### Update User Settings
**PUT** `/auth/settings`

Update user settings.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "theme": "dark",
  "notifications": false
}
```

#### Update User Profile
**PUT** `/auth/profile`

Update user profile information.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "name": "John Smith",
  "nickname": "Johnny"
}
```

#### List All Users (Admin)
**GET** `/auth/users`

Get list of all users (filtered by organization for org-admins).

**Headers**: Requires JWT + Admin role

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "roles": ["user"]
    }
  ]
}
```

#### Update User Roles (Admin)
**PUT** `/auth/users/:userId`

Update a user's roles and permissions.

**Headers**: Requires JWT + Admin role

**Request Body**:
```json
{
  "roles": ["admin", "user"],
  "permissions": ["edit_any_committee"]
}
```

#### Delete User
**DELETE** `/auth/user/:userId`

Delete a user account and cascade delete related data.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "deletedCommittees": 2,
    "updatedCommittees": 5
  }
}
```

---

## Committee Management

#### Get My Chaired Committees
**GET** `/committees/my-chairs`

Get all committees where the current user is chair (or all committees for admins).

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Budget Committee",
      "slug": "budget-committee",
      "chair": "507f1f77bcf86cd799439012",
      "members": []
    }
  ]
}
```

#### List Committees (Paginated)
**GET** `/committees/:page`

Get paginated list of committees.

**Headers**: Requires JWT

**Query Parameters**:
- `page` (path): Page number (default: 1)
- `limit` (query): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5
}
```

#### Get Committee Details
**GET** `/committee/:id`

Get a specific committee by ID or slug.

**Headers**: JWT optional (public committees)

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Budget Committee",
    "slug": "budget-committee",
    "description": "Handles budget proposals",
    "chair": "507f1f77bcf86cd799439012",
    "organizationId": "507f1f77bcf86cd799439013",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439012",
        "role": "chair",
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "settings": {}
  }
}
```

#### Get Committee Members
**GET** `/committee/:id/members`

Get full user objects for all committee members.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "chair"
    }
  ]
}
```

#### Get Potential Members
**GET** `/committee/:id/potential-members`

Get users eligible to be added to the committee.

**Headers**: Requires JWT

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page

#### Create Committee
**POST** `/committee/create`

Create a new committee.

**Headers**: Requires JWT + Permission

**Request Body**:
```json
{
  "title": "New Committee",
  "description": "Committee description",
  "chair": "507f1f77bcf86cd799439012",
  "members": [
    {
      "userId": "507f1f77bcf86cd799439013",
      "role": "member"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Committee created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "New Committee",
    "slug": "new-committee"
  }
}
```

#### Update Committee
**PUT** `/committee/:id`

Update committee information.

**Headers**: Requires JWT + Permission (Chair or Admin)

**Request Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "settings": {}
}
```

#### Update Committee Settings
**PATCH** `/committee/:id/settings`

Update only committee settings.

**Headers**: Requires JWT + Permission

**Request Body**:
```json
{
  "requireQuorum": true,
  "minimumDiscussionTime": 3600
}
```

#### Add Committee Member
**POST** `/committee/:id/member/add`

Add a user to the committee.

**Headers**: Requires JWT + Permission

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "role": "member"
}
```

#### Remove Committee Member
**DELETE** `/committee/:id/member/:userId`

Remove a user from the committee.

**Headers**: Requires JWT + Permission

#### Delete Committee
**DELETE** `/committee/:id`

Delete a committee and all associated data (cascade delete).

**Headers**: Requires JWT + Permission

**Response**:
```json
{
  "success": true,
  "message": "Committee deleted successfully"
}
```

---

## Motion Management

#### List Motions
**GET** `/committee/:id/motions/:page`

Get paginated list of motions in a committee.

**Query Parameters**:
- `page` (path): Page number
- `type`: Filter by motion type
- `status`: Filter by status ('active', 'passed', 'failed', 'tabled')
- `targetMotion`: Get subsidiaries of specific motion
- `includeSubsidiaries`: Include subsidiary motions (default: false)

**Response**:
```json
{
  "success": true,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Approve Budget",
      "description": "FY 2024 budget approval",
      "author": "507f1f77bcf86cd799439012",
      "motionType": "main",
      "status": "active",
      "votingStatus": "open",
      "votes": {
        "yes": 5,
        "no": 2,
        "abstain": 1
      },
      "debatable": true,
      "amendable": true,
      "voteRequired": "majority"
    }
  ],
  "page": 1,
  "total": 25
}
```

#### Get Motion Details
**GET** `/committee/:id/motion/:motionId`

Get specific motion details.

**Response**: Same structure as motion object above

#### Get Subsidiary Motions
**GET** `/committee/:id/motion/:motionId/subsidiaries`

Get all subsidiary motions (amendments, etc.) for a motion.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "title": "Amendment to Budget",
      "motionType": "amend",
      "targetMotionId": "507f1f77bcf86cd799439011"
    }
  ]
}
```

#### Create Motion
**POST** `/committee/:id/motion/create`

Create a new motion.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "title": "Approve New Policy",
  "description": "Short description",
  "fullDescription": "Full detailed description",
  "motionType": "main",
  "debatable": true,
  "amendable": true,
  "voteRequired": "majority",
  "isAnonymous": false,
  "targetMotionId": null
}
```

**Motion Types**: `main`, `amend`, `refer_to_committee`, `postpone`, `limit_debate`, `previous_question`, `table`, `reconsider`

**Vote Required**: `majority`, `supermajority`, `unanimous`

#### Update Motion
**PUT** `/committee/:id/motion/:motionId`

Update motion details.

**Headers**: Requires JWT + Permission (Author, Chair, or Admin)

**Request Body**:
```json
{
  "title": "Updated Title",
  "status": "passed",
  "votingStatus": "closed"
}
```

#### Delete Motion
**DELETE** `/committee/:id/motion/:motionId`

Delete a motion.

**Headers**: Requires JWT + Permission

---

## Voting

#### Get Vote Summary
**GET** `/committee/:id/motion/:motionId/votes`

Get vote counts and current user's vote.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "votes": {
      "yes": 5,
      "no": 2,
      "abstain": 1
    },
    "userVote": {
      "vote": "yes",
      "isAnonymous": false
    },
    "totalVoters": 8,
    "totalEligibleVoters": 10
  }
}
```

#### Cast Vote
**POST** `/committee/:id/motion/:motionId/vote`

Cast or update a vote on a motion.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "vote": "yes",
  "isAnonymous": false
}
```

**Vote Options**: `yes`, `no`, `abstain`

**Response**:
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": "yes",
    "isAnonymous": false
  }
}
```

#### Remove Vote
**DELETE** `/committee/:id/motion/:motionId/vote`

Remove your vote from a motion.

**Headers**: Requires JWT

---

## Motion Control

#### Second a Motion
**POST** `/motion-control/:committeeId/:motionId/second`

Second a motion to enable voting.

**Headers**: Requires JWT (Committee member)

**Response**:
```json
{
  "success": true,
  "message": "Motion seconded successfully",
  "data": {
    "secondedBy": "507f1f77bcf86cd799439012"
  }
}
```

#### Check Voting Eligibility
**GET** `/motion-control/:committeeId/:motionId/voting-eligibility`

Check if motion is eligible for voting and reasons why/why not.

**Headers**: Requires JWT

**Response**:
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "reasons": [],
    "votingStatus": "open",
    "requiresSecond": false,
    "hasSecond": true,
    "meetsDiscussionRequirement": true,
    "meetsQuorum": true
  }
}
```

#### Open Voting (Chair Only)
**POST** `/motion-control/:committeeId/:motionId/open-voting`

Manually open voting period (bypasses standard requirements).

**Headers**: Requires JWT (Chair)

**Response**:
```json
{
  "success": true,
  "message": "Voting opened successfully"
}
```

#### Close Voting (Chair Only)
**POST** `/motion-control/:committeeId/:motionId/close-voting`

Manually close voting period.

**Headers**: Requires JWT (Chair)

**Response**:
```json
{
  "success": true,
  "message": "Voting closed successfully",
  "data": {
    "finalStatus": "passed",
    "votes": {
      "yes": 7,
      "no": 2,
      "abstain": 1
    }
  }
}
```

---

## Comments & Discussion

#### List Comments
**GET** `/committee/:id/motion/:motionId/comments/:page`

Get paginated comments on a motion.

**Query Parameters**:
- `page` (path): Page number
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "author": "507f1f77bcf86cd799439012",
      "content": "I support this motion because...",
      "stance": "pro",
      "isSystemMessage": false,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "page": 1,
  "total": 15
}
```

#### Create Comment
**POST** `/committee/:id/motion/:motionId/comment/create`

Add a comment to a motion.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "content": "I think we should consider...",
  "stance": "neutral"
}
```

**Stance Options**: `pro`, `con`, `neutral`

#### Update Comment
**PUT** `/committee/:id/motion/:motionId/comment/:commentId`

Update your own comment.

**Headers**: Requires JWT (Author)

**Request Body**:
```json
{
  "content": "Updated comment text",
  "stance": "pro"
}
```

#### Delete Comment
**DELETE** `/committee/:id/motion/:motionId/comment/:commentId`

Delete a comment.

**Headers**: Requires JWT (Author, Chair, or Admin)

---

## Notifications

#### List Notifications
**GET** `/notifications`

Get user's notifications (paginated).

**Headers**: Requires JWT

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "access_request",
      "committeeTitle": "Budget Committee",
      "requesterName": "John Doe",
      "message": "I would like to join this committee",
      "status": "pending",
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "page": 1,
  "total": 5
}
```

**Notification Types**:
- `access_request` - Request to join committee
- `voting_opened` - Voting is now open
- `voting_deadline_approaching` - Voting deadline near
- `meeting_scheduled` - Meeting scheduled
- `motion_update` - Motion status changed

#### Create Notification
**POST** `/notifications`

Create a new notification.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "type": "motion_update",
  "message": "Motion status changed to passed",
  "targetType": "motion",
  "targetId": "507f1f77bcf86cd799439011",
  "committeeId": "507f1f77bcf86cd799439012"
}
```

#### Get Target Notifications
**GET** `/notifications/target`

Get notifications for a specific target.

**Headers**: Requires JWT

**Query Parameters**:
- `targetType`: Type of target (e.g., 'motion')
- `targetId`: ID of target resource

#### Request Committee Access
**POST** `/committee/:id/request-access`

Request access to a committee.

**Headers**: Requires JWT

**Request Body**:
```json
{
  "message": "I would like to join this committee"
}
```

#### Handle Notification
**PUT** `/notifications/:id`

Approve, deny, or mark as seen.

**Headers**: Requires JWT (Admin/Chair)

**Request Body**:
```json
{
  "action": "approve"
}
```

**Action Options**: `approve`, `deny`, `mark_seen`

---

## Organization Management

#### List Organizations
**GET** `/organizations`

Get all organizations (super-admin only).

**Headers**: Requires JWT (Super-admin)

#### Create Organization
**POST** `/organizations`

Create a new organization.

**Request Body**:
```json
{
  "name": "My Organization",
  "description": "Organization description",
  "userId": "507f1f77bcf86cd799439012",
  "subscriptionData": {
    "plan": "basic"
  }
}
```

#### Get Organization
**GET** `/organizations/:id`

Get organization by ID or slug.

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "My Organization",
    "slug": "my-organization",
    "inviteCode": "ORG-my-organization-abc123",
    "owner": "507f1f77bcf86cd799439012",
    "members": [],
    "subscription": {
      "status": "trial",
      "plan": "basic"
    }
  }
}
```

#### Update Organization
**PUT** `/organizations/:id`

Update organization details.

**Headers**: Requires JWT (Admin)

**Request Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "settings": {},
  "branding": {
    "primaryColor": "#007bff"
  }
}
```

#### Delete Organization
**DELETE** `/organizations/:id`

Delete organization and cascade delete all committees.

**Headers**: Requires JWT (Owner/Admin/Super-admin)

#### List Organization Members
**GET** `/organizations/:id/members`

Get all members of an organization.

#### Add Organization Member
**POST** `/organizations/:id/members`

Add member via invite code.

**Request Body**:
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "inviteCode": "ORG-my-organization-abc123"
}
```

#### Remove Organization Member
**DELETE** `/organizations/:id/members/:userId`

Remove a member from organization.

**Headers**: Requires JWT (Admin)

#### Promote to Admin
**POST** `/organizations/:id/admins`

Promote a member to organization admin.

**Headers**: Requires JWT (Admin)

**Request Body**:
```json
{
  "requestUserId": "507f1f77bcf86cd799439012",
  "targetUserId": "507f1f77bcf86cd799439013"
}
```

#### Demote Admin
**DELETE** `/organizations/:id/admins/:userId`

Demote an admin to regular member.

**Headers**: Requires JWT (Owner)

#### Regenerate Invite Code
**POST** `/organizations/:id/invite-code`

Generate a new invite code for the organization.

**Headers**: Requires JWT (Admin)

#### Verify Invite Code
**POST** `/organizations/verify-invite`

Check if an invite code is valid.

**Request Body**:
```json
{
  "inviteCode": "ORG-my-organization-abc123"
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "items": [],
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token/expired) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate/already exists) |
| 500 | Server Error |

---

## Authorization & Permissions

### User Roles
- `super-admin` - Platform maintainer (all organizations)
- `admin` - Platform-level admin
- `user` - Standard user
- `guest` - Limited access (cannot vote/comment)

### Organization Roles
- `admin` - Organization administrator
- `member` - Organization member

### Committee Roles
- `owner` - Committee owner
- `chair` - Committee chair
- `member` - Committee member
- `guest` - Committee guest

### Permissions
- `create_any_committee` - Create committees
- `edit_any_committee` - Edit any committee
- `delete_any_committee` - Delete any committee
- `edit_any_motion` - Edit any motion
- `delete_any_motion` - Delete any motion

---

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

---

## Versioning

API Version: 1.0
No explicit versioning in URLs currently. All endpoints are at the root level.

---

## Support

For issues or questions, please refer to the project repository or contact the development team.
