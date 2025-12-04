const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { slugify } = require('../utils/slugify');
const crypto = require('crypto');

class Organization {
  static collection() {
    return getDB().collection('organizations');
  }

  /**
   * Generate a unique invite code for an organization
   * Format: ORG-{slug}-{random}
   */
  static generateInviteCode(slug) {
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ORG-${slug.toUpperCase()}-${randomPart}`;
  }

  /**
   * Create a new organization
   */
  static async create(organizationData) {
    const slug = organizationData.slug || slugify(organizationData.name);
    const inviteCode = this.generateInviteCode(slug);

    const organization = {
      name: organizationData.name,
      slug: slug,
      description: organizationData.description || '',
      inviteCode: inviteCode,
      owner: organizationData.owner, // User ID of the organization owner/admin
      admins: [organizationData.owner], // Array of admin user IDs
      members: [organizationData.owner], // Array of all member user IDs
      subscription: {
        status: organizationData.subscriptionStatus || 'trial', // 'trial', 'active', 'cancelled', 'expired'
        plan: organizationData.subscriptionPlan || 'basic', // 'basic', 'premium', 'enterprise'
        stripeCustomerId: organizationData.stripeCustomerId || null,
        stripeSubscriptionId: organizationData.stripeSubscriptionId || null,
        trialEndsAt: organizationData.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        currentPeriodEnd: organizationData.currentPeriodEnd || null
      },
      settings: {
        maxCommittees: organizationData.maxCommittees || 10,
        maxMembersPerCommittee: organizationData.maxMembersPerCommittee || 100,
        maxUsers: organizationData.maxUsers || 50,
        features: {
          advancedReporting: organizationData.advancedReporting || false,
          customBranding: organizationData.customBranding || false,
          apiAccess: organizationData.apiAccess || false
        }
      },
      branding: {
        logoUrl: organizationData.logoUrl || null,
        primaryColor: organizationData.primaryColor || '#2D5016',
        secondaryColor: organizationData.secondaryColor || '#A4C639'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(organization);
    return { _id: result.insertedId, ...organization };
  }

  /**
   * Find organization by ID
   */
  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Find organization by slug
   */
  static async findBySlug(slug) {
    return await this.collection().findOne({ slug: slug });
  }

  /**
   * Find organization by ID or slug
   */
  static async findByIdOrSlug(identifier) {
    let organization = await this.findBySlug(identifier);
    if (!organization && ObjectId.isValid(identifier)) {
      organization = await this.findById(identifier);
    }
    return organization;
  }

  /**
   * Find organization by invite code
   */
  static async findByInviteCode(inviteCode) {
    return await this.collection().findOne({ inviteCode: inviteCode });
  }

  /**
   * Get all organizations (paginated)
   */
  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const organizations = await this.collection()
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments();

    return {
      organizations,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  /**
   * Update organization
   */
  static async updateById(id, updates) {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return await this.findById(id);
  }

  /**
   * Delete organization
   */
  static async deleteById(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  /**
   * Add a user to the organization
   */
  static async addMember(organizationId, userId) {
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    return await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $addToSet: { members: uid },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Remove a user from the organization
   */
  static async removeMember(organizationId, userId) {
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    return await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $pull: { members: uid, admins: uid },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Add admin to organization
   */
  static async addAdmin(organizationId, userId) {
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    return await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $addToSet: { admins: uid, members: uid },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Remove admin from organization
   */
  static async removeAdmin(organizationId, userId) {
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    return await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $pull: { admins: uid },
        $set: { updatedAt: new Date() }
      }
    );
  }

  /**
   * Regenerate invite code
   */
  static async regenerateInviteCode(organizationId) {
    const organization = await this.findById(organizationId);
    if (!organization) return null;

    const newInviteCode = this.generateInviteCode(organization.slug);
    await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $set: { 
          inviteCode: newInviteCode,
          updatedAt: new Date()
        }
      }
    );

    return newInviteCode;
  }

  /**
   * Check if user is admin of organization
   */
  static async isAdmin(organizationId, userId) {
    const organization = await this.findById(organizationId);
    if (!organization) return false;

    const uid = String(userId);
    return organization.admins.some(adminId => String(adminId) === uid);
  }

  /**
   * Check if user is member of organization
   */
  static async isMember(organizationId, userId) {
    const organization = await this.findById(organizationId);
    if (!organization) return false;

    const uid = String(userId);
    return organization.members.some(memberId => String(memberId) === uid);
  }

  /**
   * Update subscription status
   */
  static async updateSubscription(organizationId, subscriptionData) {
    return await this.collection().updateOne(
      { _id: new ObjectId(organizationId) },
      { 
        $set: { 
          subscription: subscriptionData,
          updatedAt: new Date()
        }
      }
    );
  }
}

module.exports = Organization;
