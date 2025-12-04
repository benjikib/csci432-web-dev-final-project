# Backend Scripts

This directory contains utility scripts for managing the platform.

## Super-Admin Management

These scripts are used to grant or revoke platform-level super-admin privileges.

### Grant Super-Admin Privileges

```bash
node scripts/setSuperAdmin.js <email>
```

Example:
```bash
node scripts/setSuperAdmin.js admin@example.com
```

This will:
- Find the user with the specified email
- Add the `super-admin` role to their roles array
- Grant unrestricted platform-wide access

**⚠️ WARNING:** Super-admins have full access to all organizations and data. Only grant this privilege to trusted platform maintainers/developers.

### Revoke Super-Admin Privileges

```bash
node scripts/revokeSuperAdmin.js <email>
```

Example:
```bash
node scripts/revokeSuperAdmin.js admin@example.com
```

This will remove the `super-admin` role from the user's roles array.

## Admin Architecture

The platform uses a hybrid admin system:

### 1. Super-Admin (Platform Level)
- **Role:** `roles: ['super-admin']`
- **Scope:** Platform-wide access to all organizations
- **Use Case:** Developers, maintainers, platform operators
- **Data Filtering:** No organizationId filtering - sees everything
- **Assignment:** Manually via scripts (not through UI)

### 2. Organization Admin (Customer Level)
- **Role:** `organizationRole: 'admin'`
- **Scope:** Organization-scoped access only
- **Use Case:** Paying customers managing their organization
- **Data Filtering:** All queries filtered by organizationId
- **Assignment:** Promoted by organization owner through UI

## Security Best Practices

1. **Limit Super-Admins:** Only grant super-admin to essential personnel
2. **Use Organization Admins:** For customer management, use organizationRole: 'admin'
3. **Audit Regularly:** Keep track of who has super-admin privileges
4. **Revoke When Not Needed:** Remove super-admin access when users leave or no longer need it
5. **Never Through UI:** Super-admin privileges should never be assignable through the web interface

## Other Scripts

Additional utility scripts can be added here for:
- Database migrations
- Data cleanup
- Bulk operations
- Testing utilities
