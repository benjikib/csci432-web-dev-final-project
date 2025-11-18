# API Documentation
---
## Authentication

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/auth/register` | POST | Register a new user | No |
| `/auth/login` | POST | Login and receive JWT token | No |
| `/auth/logout` | POST | Logout (invalidate token) | Yes |
| `/auth/me` | GET | Get current user info | Yes |

---

## Committees

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/committees/my-chairs` | GET | Get committees where current user is chair | Yes |
| `/committees/:page` | GET | Get all committees (paginated) | Yes |
| `/committee/:id` | GET | Get specific committee details | Yes |
| `/committee/:id/settings` | GET | Get committee settings only | Yes |
| `/committee/:id/settings` | PATCH | Update committee settings | Yes |
| `/committee/create` | POST | Create a new committee | Yes |
| `/committee/:id` | PUT | Update a committee | Yes |
| `/committee/:id` | DELETE | Delete a committee | Yes |

---

## Motions

**Base**: `/committee/:id`

**Query Parameters for GET motions:**
- `type` - Filter by motion type (e.g., main, amend, postpone)
- `status` - Filter by status (e.g., active, past, voided)
- `targetMotion` - Filter subsidiary motions by target motion ID

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/committee/:id/motions/:page` | GET | Get all motions in committee (paginated, filterable) | Yes |
| `/committee/:id/motion/:motionId` | GET | Get specific motion details | Yes |
| `/committee/:id/motion/:motionId/subsidiaries` | GET | Get all subsidiary motions for a motion | Yes |
| `/committee/:id/motion/create` | POST | Create a new motion | Yes |
| `/committee/:id/motion/:motionId` | PUT | Update a motion | Yes |
| `/committee/:id/motion/:motionId` | DELETE | Delete a motion | Yes |

### Motion Object Fields

Motions now include Robert's Rules of Order metadata:
- `motionType` - Type of motion (main, amend, postpone, etc.)
- `motionTypeLabel` - Human-readable label
- `debatable` - Whether motion can be debated
- `amendable` - Whether motion can be amended
- `voteRequired` - Vote threshold (majority, two-thirds, unanimous, none)
- `amendTargetMotionId` - Reference to target motion (for subsidiary motions)

## Comments

**Base**: `/committee/:id/motion/:motionId`

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/committee/:id/motion/:motionId/comments/:page` | GET | Get all comments (paginated) | Yes |
| `/committee/:id/motion/:motionId/comment/create` | POST | Create a comment | Yes |
| `/committee/:id/motion/:motionId/comment/:commentId` | PUT | Update a comment | Yes |
| `/committee/:id/motion/:motionId/comment/:commentId` | DELETE | Delete a comment | Yes |

---

## Voting

**Base**: `/committee/:id/motion/:motionId`

| Endpoint | Method | Description | Auth Required |
| --- | --- | --- | --- |
| `/committee/:id/motion/:motionId/votes` | GET | Get vote summary and details | Yes |
| `/committee/:id/motion/:motionId/vote` | POST | Cast or update a vote | Yes |
| `/committee/:id/motion/:motionId/vote` | DELETE | Remove your vote | Yes |

