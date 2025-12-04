const express = require('express');
const router = express.Router();
const Organization = require('../models/Organization');
const User = require('../models/User');
const Committee = require('../models/Committee');
const { ObjectId } = require('mongodb');
const { authenticate, isSuperAdmin } = require('../middleware/auth');

/**
 * GET /organizations
 * Get all organizations (super-admin only)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // Only super-admins can list all organizations
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super-admins can list all organizations' 
      });
    }

    const organizations = await Organization.collection()
      .find({})
      .project({ name: 1, description: 1, subscriptionStatus: 1, createdAt: 1, owner: 1 })
      .toArray();

    res.json({ 
      success: true, 
      organizations 
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch organizations' 
    });
  }
});

/**
 * POST /organizations
 * Create a new organization (requires payment verification in production)
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, userId, subscriptionData } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'Name and userId are required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      description,
      owner: new ObjectId(userId),
      subscriptionStatus: subscriptionData?.status || 'trial',
      subscriptionPlan: subscriptionData?.plan || 'basic',
      stripeCustomerId: subscriptionData?.stripeCustomerId,
      stripeSubscriptionId: subscriptionData?.stripeSubscriptionId
    });

    // Update user to reference this organization
    await User.collection().updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          organizationId: organization._id,
          organizationRole: 'admin'
        }
      }
    );

    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

/**
 * GET /organizations/:id
 * Get organization by ID or slug
 */
router.get('/:id', async (req, res) => {
  try {
    const organization = await Organization.findByIdOrSlug(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

/**
 * GET /organizations
 * Get all organizations (admin only)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Organization.findAll(page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

/**
 * PUT /organizations/:id
 * Update organization (admin only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { userId, name, description, settings, branding } = req.body;

    // Verify user is admin of this organization
    const isAdmin = await Organization.isAdmin(req.params.id, userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can update organization' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (settings) updates.settings = settings;
    if (branding) updates.branding = branding;

    const organization = await Organization.updateById(req.params.id, updates);
    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

/**
 * DELETE /organizations/:id
 * Delete organization and all associated data (super-admin or org-admin only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ 
        success: false,
        error: 'Organization not found' 
      });
    }

    // Check authorization: super-admin OR org-admin of this organization OR organization owner
    const isSuperAdmin = req.user.roles && req.user.roles.includes('super-admin');
    const isOrgAdmin = req.user.organizationRole === 'admin' && 
                       String(req.user.organizationId) === String(organization._id);
    const isOwner = String(organization.owner) === String(req.user.userId);

    if (!isSuperAdmin && !isOrgAdmin && !isOwner) {
      return res.status(403).json({ 
        success: false,
        error: 'Only super-admins or organization admins can delete organizations' 
      });
    }

    const { getDB } = require('../config/database');
    const db = getDB();
    const orgId = new ObjectId(req.params.id);

    console.log(`Starting cascade delete for organization: ${organization.name} (${orgId})`);

    // 1. Get all committees in this organization
    const committees = await db.collection('committees')
      .find({ organizationId: orgId })
      .toArray();
    
    const committeeIds = committees.map(c => c._id);
    console.log(`Found ${committeeIds.length} committees to delete`);

    // 2. Get all motions in these committees
    const motionIds = [];
    for (const committee of committees) {
      if (committee.motions && Array.isArray(committee.motions)) {
        motionIds.push(...committee.motions.map(m => m._id || m.id));
      }
    }
    console.log(`Found ${motionIds.length} motions to delete`);

    // 3. Delete all votes for these motions
    if (motionIds.length > 0) {
      const votesResult = await db.collection('votes').deleteMany({
        motionId: { $in: motionIds }
      });
      console.log(`Deleted ${votesResult.deletedCount} votes`);

      // 4. Delete all comments for these motions
      const commentsResult = await db.collection('comments').deleteMany({
        motionId: { $in: motionIds }
      });
      console.log(`Deleted ${commentsResult.deletedCount} comments`);
    }

    // 5. Delete all notifications for these committees
    if (committeeIds.length > 0) {
      const notificationsResult = await db.collection('notifications').deleteMany({
        committeeId: { $in: committeeIds }
      });
      console.log(`Deleted ${notificationsResult.deletedCount} notifications`);
    }

    // 6. Delete all committees
    const committeesResult = await db.collection('committees').deleteMany({
      organizationId: orgId
    });
    console.log(`Deleted ${committeesResult.deletedCount} committees`);

    // 7. Get all users in this organization
    const orgUsers = await db.collection('users')
      .find({ organizationId: orgId })
      .toArray();
    console.log(`Found ${orgUsers.length} users in organization`);

    // 8. Remove organization reference from all users (don't delete the users themselves)
    await db.collection('users').updateMany(
      { organizationId: orgId },
      { 
        $unset: { 
          organizationId: '', 
          organizationRole: '' 
        }
      }
    );
    console.log(`Removed organization reference from ${orgUsers.length} users`);

    // 9. Delete the organization
    await Organization.deleteById(req.params.id);
    console.log(`Deleted organization: ${organization.name}`);

    res.json({ 
      success: true,
      message: 'Organization and all associated data deleted successfully',
      stats: {
        committees: committeesResult.deletedCount,
        motions: motionIds.length,
        users: orgUsers.length,
        organizationName: organization.name
      }
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete organization' 
    });
  }
});

/**
 * POST /organizations/:id/members
 * Add member to organization using invite code
 */
router.post('/:id/members', async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;

    if (!userId || !inviteCode) {
      return res.status(400).json({ error: 'userId and inviteCode are required' });
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Verify invite code
    if (organization.inviteCode !== inviteCode) {
      return res.status(403).json({ error: 'Invalid invite code' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add user to organization
    await Organization.addMember(req.params.id, userId);

    // Update user with organization reference and ensure they have member role
    await User.collection().updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          organizationId: organization._id,
          organizationRole: 'member'
        },
        $addToSet: {
          roles: 'member' // Add member role to roles array
        }
      }
    );

    res.json({ message: 'Successfully joined organization' });
  } catch (error) {
    console.error('Error adding member to organization:', error);
    res.status(500).json({ error: 'Failed to add member to organization' });
  }
});

/**
 * DELETE /organizations/:id/members/:userId
 * Remove member from organization (admin only)
 */
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const { requestUserId } = req.body;

    // Verify requesting user is admin
    const isAdmin = await Organization.isAdmin(req.params.id, requestUserId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can remove members' });
    }

    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Cannot remove the owner
    if (String(organization.owner) === String(req.params.userId)) {
      return res.status(403).json({ error: 'Cannot remove organization owner' });
    }

    // Remove member
    await Organization.removeMember(req.params.id, req.params.userId);

    // Remove organization reference from user
    await User.collection().updateOne(
      { _id: new ObjectId(req.params.userId) },
      { 
        $unset: { organizationId: '', organizationRole: '' }
      }
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

/**
 * POST /organizations/:id/admins
 * Promote member to admin (admin only)
 */
router.post('/:id/admins', async (req, res) => {
  try {
    const { requestUserId, targetUserId } = req.body;

    // Verify requesting user is admin
    const isAdmin = await Organization.isAdmin(req.params.id, requestUserId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can promote members' });
    }

    // Add admin
    await Organization.addAdmin(req.params.id, targetUserId);

    // Update user role
    await User.collection().updateOne(
      { _id: new ObjectId(targetUserId) },
      { 
        $set: { organizationRole: 'admin' }
      }
    );

    res.json({ message: 'User promoted to admin' });
  } catch (error) {
    console.error('Error promoting user:', error);
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

/**
 * DELETE /organizations/:id/admins/:userId
 * Demote admin to member (owner only)
 */
router.delete('/:id/admins/:userId', async (req, res) => {
  try {
    const { requestUserId } = req.body;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Only owner can demote admins
    if (String(organization.owner) !== String(requestUserId)) {
      return res.status(403).json({ error: 'Only organization owner can demote admins' });
    }

    // Cannot demote the owner
    if (String(organization.owner) === String(req.params.userId)) {
      return res.status(403).json({ error: 'Cannot demote organization owner' });
    }

    // Remove admin
    await Organization.removeAdmin(req.params.id, req.params.userId);

    // Update user role
    await User.collection().updateOne(
      { _id: new ObjectId(req.params.userId) },
      { 
        $set: { organizationRole: 'member' }
      }
    );

    res.json({ message: 'Admin demoted to member' });
  } catch (error) {
    console.error('Error demoting admin:', error);
    res.status(500).json({ error: 'Failed to demote admin' });
  }
});

/**
 * POST /organizations/:id/invite-code
 * Regenerate invite code (admin only)
 */
router.post('/:id/invite-code', async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify user is admin
    const isAdmin = await Organization.isAdmin(req.params.id, userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only organization admins can regenerate invite code' });
    }

    const newInviteCode = await Organization.regenerateInviteCode(req.params.id);
    res.json({ inviteCode: newInviteCode });
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    res.status(500).json({ error: 'Failed to regenerate invite code' });
  }
});

/**
 * POST /organizations/verify-invite
 * Verify an invite code is valid
 */
router.post('/verify-invite', async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    const organization = await Organization.findByInviteCode(inviteCode);
    
    if (!organization) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid invite code' 
      });
    }

    res.json({ 
      valid: true, 
      organization: {
        _id: organization._id,
        name: organization.name,
        slug: organization.slug,
        description: organization.description
      }
    });
  } catch (error) {
    console.error('Error verifying invite code:', error);
    res.status(500).json({ error: 'Failed to verify invite code' });
  }
});

/**
 * GET /organizations/:id/members
 * Get all members of an organization
 */
router.get('/:id/members', async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Fetch user details for all members
    const memberIds = organization.members.map(id => new ObjectId(id));
    const members = await User.collection()
      .find({ _id: { $in: memberIds } })
      .project({ password: 0 }) // Exclude password
      .toArray();

    // Add role information
    const membersWithRoles = members.map(member => ({
      ...member,
      isAdmin: organization.admins.some(adminId => String(adminId) === String(member._id)),
      isOwner: String(organization.owner) === String(member._id)
    }));

    res.json(membersWithRoles);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
