# Hybrid Admin Architecture

## Overview

The platform implements a hybrid admin architecture that separates platform-level administration from organization-level administration. This ensures clear security boundaries and proper privilege separation.

## Two Types of Administrators

### 1. Super-Admin (Platform Level)

**Purpose:** Platform maintainers, developers, and operators

**Characteristics:**
- **Role Field:** `roles: ['super-admin']`
- **Organization:** No organizationId (or can have one but it's ignored for permissions)
- **Data Access:** Unrestricted - sees all data across all organizations
- **Filtering:** All database queries skip organizationId filtering for super-admins
- **Use Cases:**
  - Platform maintenance and debugging
  - System-wide configuration
  - Multi-organization analytics
  - Developer access for troubleshooting
  - Support for customers across organizations

**Assignment:**
- **NOT** assignable through web UI
- Must be manually granted via command-line script
- See `backend/scripts/setSuperAdmin.js`

**Example:**
```javascript
// Super-admin user document
{
  _id: ObjectId("..."),
  email: "developer@platform.com",
  roles: ["super-admin"],  // ← Key field
  organizationId: null,     // No org assignment needed
  organizationRole: null
}
```

### 2. Organization Admin (Customer Level)

**Purpose:** Paying customers who manage their own organization

**Characteristics:**
- **Role Field:** `organizationRole: 'admin'`
- **Organization:** Must have an organizationId
- **Data Access:** Scoped to their organization only
- **Filtering:** All database queries filtered by organizationId
- **Use Cases:**
  - Managing organization members
  - Creating/editing committees within their org
  - Viewing analytics for their organization
  - Configuring organization settings

**Assignment:**
- Assignable through web UI by organization owner
- See `OrganizationSettings` component
- Promotes existing organization members to admin

**Example:**
```javascript
// Organization admin user document
{
  _id: ObjectId("..."),
  email: "admin@customer-company.com",
  roles: ["user"],           // Regular user role
  organizationId: ObjectId("..."),  // ← Must have org
  organizationRole: "admin"  // ← Key field for org admin
}
```

## Implementation Details

### Middleware (backend/middleware/auth.js)

**New Middleware Functions:**

1. `requireSuperAdmin` - Checks if user has `super-admin` role
2. `requireOrgAdmin` - Checks if user has `organizationRole: 'admin'`
3. `requireAnyAdmin` - Accepts either super-admin OR org-admin
4. `isSuperAdmin(user)` - Helper function to check super-admin status
5. `isOrgAdmin(user)` - Helper function to check org-admin status

**Updated Authentication:**
The `authenticate` middleware now attaches organization data to `req.user`:
```javascript
req.user = {
  userId: user._id.toString(),
  email: user.email,
  name: user.name,
  roles: user.roles || [],              // ← Includes 'super-admin'
  organizationId: user.organizationId,  // ← For filtering
  organizationRole: user.organizationRole // ← 'admin' or 'member'
};
```

### Route Protection

**Routes Updated to Support Hybrid Admins:**

1. **GET /auth/users** - Super-admins see all users, org-admins see only their org
2. **GET /auth/users/list** - Same filtering logic
3. **GET /committees/:page** - Super-admins see all committees, org-admins see only their org
4. **GET /notifications** - Super-admins see all, org-admins see only their org's notifications

**Pattern Used:**
```javascript
router.get('/some-route', authenticate, async (req, res) => {
  const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
  
  let filter = {};
  if (!isSuperAdmin) {
    // Apply organization filtering for non-super-admins
    const user = await User.findById(req.user.userId);
    if (user.organizationId) {
      filter.organizationId = new ObjectId(user.organizationId);
    }
  }
  
  // Query with filter
  const data = await Collection.find(filter);
  // ...
});
```

### Frontend Updates

**AdminPanel Component:**
- Shows admin type badge (Super-Admin vs Organization Administrator)
- Purple badge for super-admins
- Blue badge for org-admins
- Displays "Organization Scoped Access" for org-admins

**User API:**
- `getCurrentUser()` returns `organizationRole` field
- Frontend can check `user.roles.includes('super-admin')` for platform admin
- Frontend can check `user.organizationRole === 'admin'` for org admin

## Security Boundaries

### Super-Admin Boundaries
✅ **Can:**
- View all organizations
- View all users across all organizations
- View all committees across all organizations
- Debug cross-organization issues
- Access platform-wide analytics

❌ **Cannot (by convention):**
- Should not modify customer data without reason
- Should not interfere with organization settings
- Should follow platform policies for data access

### Organization Admin Boundaries
✅ **Can:**
- View all users in their organization
- View all committees in their organization
- Manage organization settings
- Promote/demote other members to org-admin
- Create committees for their organization

❌ **Cannot:**
- View users from other organizations
- View committees from other organizations
- Access platform-level settings
- Grant super-admin privileges
- View notifications from other organizations

## Granting Super-Admin Access

**For Platform Maintainers:**

1. Connect to production server/database
2. Run the super-admin script:
```bash
cd backend
node scripts/setSuperAdmin.js developer@example.com
```

3. Verify the change:
```bash
# In MongoDB shell or admin tool
db.users.findOne({ email: "developer@example.com" })
```

4. User should now have:
```javascript
{
  roles: ["super-admin"],
  // ... other fields
}
```

**Revoking Super-Admin:**
```bash
node scripts/revokeSuperAdmin.js developer@example.com
```

## Migration Notes

**Existing Admins:**
- Users with `roles: ['admin']` are treated as regular organization admins
- They see only their organization's data (filtered by organizationId)
- To make them super-admins, run the setSuperAdmin script
- Organization owners can still promote users via UI (sets organizationRole: 'admin')

**Database:**
- No migration needed for existing users
- Super-admin role is additive - add to roles array
- Organization admin uses existing organizationRole field

## Testing

**Test Super-Admin Access:**
1. Create a user without an organization
2. Grant super-admin: `node scripts/setSuperAdmin.js test@example.com`
3. Login and verify access to all organizations in admin panel
4. Check admin badge shows "Platform Super-Admin"

**Test Organization Admin:**
1. Create an organization
2. Join organization as a member
3. Have owner promote you to admin via OrganizationSettings
4. Login and verify access only to your organization
5. Check admin badge shows "Organization Administrator"

## Best Practices

1. **Minimize Super-Admins:** Only grant to essential platform personnel
2. **Use Org-Admins for Customers:** Never give customers super-admin access
3. **Document Access:** Keep a list of who has super-admin privileges
4. **Regular Audits:** Review super-admin list periodically
5. **Principle of Least Privilege:** Use org-admin whenever possible
6. **No UI Assignment:** Never create UI to grant super-admin (security risk)
7. **Logging:** Consider logging super-admin actions for audit trail

## Future Enhancements

**Potential Improvements:**
- Audit logging for super-admin actions
- Time-limited super-admin grants
- Multi-factor authentication for super-admins
- Super-admin approval workflow for sensitive operations
- Platform-level analytics dashboard for super-admins
- Organization impersonation for support purposes (with logging)
