const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { slugify } = require('../utils/slugify');

class Committee {
  static collection() {
    return getDB().collection('committees');
  }

  static normalizeMembers(members) {
    // members can be array of ids or array of objects, normalize to objects
    if (!Array.isArray(members)) return [];
    return members.map(m => {
      if (!m) return null;
      if (typeof m === 'string' || ObjectId.isValid(m)) {
        return { userId: m, role: 'member', joinedAt: new Date() };
      }
      // obj may be {_id, id, userId, role }
      const userId = m.userId || m._id || m.id || m._id;
      return { userId, role: m.role || 'member', joinedAt: m.joinedAt || new Date() };
    }).filter(Boolean);
  }

  static async create(committeeData) {
    const slug = committeeData.slug || slugify(committeeData.title);

    const committee = {
      title: committeeData.title,
      slug: slug,
      description: committeeData.description,
      members: this.normalizeMembers(committeeData.members || []),
      owner: committeeData.owner || null, // User ID of the owner (optional for now)
      chair: committeeData.chair || null, // User ID of the chair
      settings: committeeData.settings || {},
      motions: [], // Array of embedded motion documents
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(committee);
    return { _id: result.insertedId, ...committee };
  }

  static async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const committees = await this.collection()
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments();

    return {
      committees,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findBySlug(slug) {
    return await this.collection().findOne({ slug: slug });
  }

  static async findByIdOrSlug(identifier) {
    // Try to find by slug first
    let committee = await this.findBySlug(identifier);

    // If not found and identifier looks like an ObjectId, try finding by ID
    if (!committee && ObjectId.isValid(identifier)) {
      committee = await this.findById(identifier);
    }

    return committee;
  }

  static async findByMember(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    // Support both legacy members array and role-aware object members
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    const query = { $or: [ { members: uid }, { 'members.userId': uid } ] };
    const committees = await this.collection()
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments({ $or: [ { members: userId }, { 'members.userId': userId } ] });

    return {
      committees,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  static async updateById(id, updates) {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // If title is being updated, regenerate the slug
    if (updates.title) {
      updateData.slug = slugify(updates.title);
    }

    const result = await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result;
  }

  static async deleteById(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }

  static async addMember(committeeId, userId) {
    // legacy compatibility: still add to user-friendly array if callers expect it
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    const newMember = { userId: uid, role: 'member', joinedAt: new Date() };
    // Remove existing entry for the userId if present, then push new object
    await this.collection().updateOne(
      { _id: new ObjectId(committeeId) },
      { $pull: { members: { userId: uid } } }
    );
    return await this.collection().updateOne(
      { _id: new ObjectId(committeeId) },
      { $push: { members: newMember } }
    );
  }

  static async removeMember(committeeId, userId) {
    // The members array can have userId as either a string OR an ObjectId object
    // We need to handle both cases with separate pull operations
    const userIdStr = String(userId);
    const userIdObj = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
    
    const committeeObjId = new ObjectId(committeeId);
    
    // Remove entries where userId is a string
    await this.collection().updateOne(
      { _id: committeeObjId },
      { $pull: { members: { userId: userIdStr } } }
    );
    
    // Remove entries where userId is an ObjectId (if valid)
    if (userIdObj) {
      await this.collection().updateOne(
        { _id: committeeObjId },
        { $pull: { members: { userId: userIdObj } } }
      );
    }
    
    return { success: true };
  }

  // New helper to add member with a role (member|guest|chair|owner)
  static async addMemberWithRole(committeeId, userId, role = 'member') {
    const uid = ObjectId.isValid(userId) ? new ObjectId(userId) : userId;
    const newMember = { userId: uid, role, joinedAt: new Date() };
    // remove any existing member entry for userId and push the new one
    await this.collection().updateOne({ _id: new ObjectId(committeeId) }, { $pull: { members: { userId: uid } } });
    return await this.collection().updateOne({ _id: new ObjectId(committeeId) }, { $push: { members: newMember } });
  }

  static async getMemberRole(committeeId, userId) {
    const committee = await this.findById(committeeId);
    if (!committee) return null;
    // check explicit chair/owner fields first
    if (committee.chair && String(committee.chair) === String(userId)) return 'chair';
    if (committee.owner && String(committee.owner) === String(userId)) return 'owner';
    if (!committee.members) return null;
    for (const m of committee.members) {
      if (!m) continue;
      if (typeof m === 'string' || ObjectId.isValid(m)) {
        if (String(m) === String(userId)) return 'member';
        continue;
      }
      const mid = m.userId || m._id || m.id;
      if (mid && String(mid) === String(userId)) return m.role || 'member';
    }
    return null;
  }

  static async isGuest(committeeId, userId) {
    const role = await this.getMemberRole(committeeId, userId);
    return role === 'guest';
  }

  static async isMember(committeeId, userId) {
    const role = await this.getMemberRole(committeeId, userId);
    return role && role !== 'guest';
  }

  static async isChair(committeeId, userId) {
    const role = await this.getMemberRole(committeeId, userId);
    return role === 'chair' || role === 'owner';
  }

  static async addChair(committeeId, userId) {
    await this.updateById(committeeId, { chair: userId });
    // ensure membership record for chair
    return this.addMemberWithRole(committeeId, userId, 'chair');
  }

  // Motion-related methods (embedded documents)

  static async createMotion(committeeId, motionData) {
    const motion = {
      _id: new ObjectId(),
      title: motionData.title,
      description: motionData.description,
      fullDescription: motionData.fullDescription || motionData.description,
      author: motionData.author ? (typeof motionData.author === 'string' ? new ObjectId(motionData.author) : motionData.author) : null,
      
      // Robert's Rules of Order fields
      motionType: motionData.motionType || 'main',
      motionTypeLabel: motionData.motionTypeLabel || 'Main Motion',
      debatable: motionData.debatable !== undefined ? motionData.debatable : true,
      amendable: motionData.amendable !== undefined ? motionData.amendable : true,
      voteRequired: motionData.voteRequired || 'majority',
      // Canonical field: targetMotionId; keep amendTargetMotionId for backward compatibility
      targetMotionId: motionData.targetMotionId ? new ObjectId(motionData.targetMotionId) : (motionData.amendTargetMotionId ? new ObjectId(motionData.amendTargetMotionId) : null),
      amendTargetMotionId: motionData.amendTargetMotionId ? new ObjectId(motionData.amendTargetMotionId) : null,
      
      status: motionData.status || 'active',
      votes: {
        yes: 0,
        no: 0,
        abstain: 0
      },
      
      // Chair Control Panel fields
      isAnonymous: motionData.isAnonymous || false,
      secondedBy: motionData.secondedBy ? new ObjectId(motionData.secondedBy) : null,
      votingStatus: motionData.votingStatus || 'not-started', // 'not-started' | 'open' | 'closed'
      votingOpenedAt: motionData.votingOpenedAt || null,
      votingClosedAt: motionData.votingClosedAt || null,
      
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().findOneAndUpdate(
      { _id: new ObjectId(committeeId) },
      {
        $push: { motions: motion },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    return motion;
  }

  static async findMotions(committeeId, page = 1, limit = 10, options = {}) {
    const includeSubsidiaries = !!options.includeSubsidiaries;
    const typeFilter = options.type || null;
    const statusFilter = options.status || null;
    const targetMotion = options.targetMotion || null;
    const committee = await this.findById(committeeId);

    if (!committee || !committee.motions) {
      return {
        motions: [],
        page,
        limit,
        totalPages: 0,
        total: 0
      };
    }

    // Sort motions by createdAt (newest first)
    const sortedMotions = committee.motions.sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Build parent/child map so we can optionally attach subsidiaries to parent motions
    const childMap = {};
    for (const m of sortedMotions) {
      try {
        const parentId = String(m.targetMotionId || m.targetMotionId?._id || m.amendTargetMotionId || m.amendTargetMotionId?._id || '');
        if (parentId) {
          childMap[parentId] = childMap[parentId] || [];
          childMap[parentId].push(m);
        }
      } catch (e) { /* ignore */ }
    }

    // Select the set of motions to paginate over, applying requested filters first
    // Start from either all motions or top-level motions depending on includeSubsidiaries
    // Note: Reconsider motions are treated as top-level even though they have a targetMotionId
    const motionsBase = includeSubsidiaries ? sortedMotions : sortedMotions.filter(m => {
      const targetId = m.targetMotionId || m.targetMotionId?._id || m.amendTargetMotionId || m.amendTargetMotionId?._id;
      // Include motions without a target, OR reconsider motions (which should appear standalone)
      return !targetId || m.motionType === 'reconsider';
    });

    // Apply filters across the base set
    let filteredUnpaginated = motionsBase;
    if (typeFilter) {
      filteredUnpaginated = filteredUnpaginated.filter(m => m.motionType === typeFilter);
    }
    if (statusFilter) {
      filteredUnpaginated = filteredUnpaginated.filter(m => m.status === statusFilter);
    }
    if (targetMotion) {
      filteredUnpaginated = filteredUnpaginated.filter(m => {
        const t = m.targetMotionId || m.amendTargetMotionId;
        return t && String(t) === String(targetMotion);
      });
    }

    if (includeSubsidiaries) {
      // Return full paginated motions (including subsidiaries), but attach subsidiaries to each motion in the page
      const skip = (page - 1) * limit;
      const paginatedMotions = filteredUnpaginated.slice(skip, skip + limit);
      const withSubs = paginatedMotions.map(m => ({ ...m, subsidiaries: childMap[String(m._id || m.id)] || [] }));
      return {
        motions: withSubs,
        page,
        limit,
        totalPages: Math.ceil(filteredUnpaginated.length / limit),
        total: filteredUnpaginated.length
      };
    }

    // Exclude subsidiary motions: filter out motions that reference a parent
    // Apply pagination to filtered top-level motions
    const skipTop = (page - 1) * limit;
    const paginatedTopMotions = filteredUnpaginated.slice(skipTop, skipTop + limit);
    const withSubsTop = paginatedTopMotions.map(m => ({ ...m, subsidiaries: childMap[String(m._id || m.id)] || [] }));
    return {
      motions: withSubsTop,
      page,
      limit,
      totalPages: Math.ceil(filteredUnpaginated.length / limit),
      total: filteredUnpaginated.length
    };
  }

  static async findMotionById(committeeId, motionId) {
    const committee = await this.findById(committeeId);

    if (!committee || !committee.motions) {
      return null;
    }

    return committee.motions.find(m => m._id.toString() === motionId.toString());
  }

  static async updateMotion(committeeId, motionId, updates) {
    const updateFields = {};
    // Convert id-like fields to ObjectId where appropriate
    if (updates.targetMotionId !== undefined && updates.targetMotionId !== null) {
      try { updates.targetMotionId = ObjectId.isValid(updates.targetMotionId) ? new ObjectId(updates.targetMotionId) : updates.targetMotionId; } catch(e) {}
    }
    if (updates.amendTargetMotionId !== undefined && updates.amendTargetMotionId !== null) {
      try { updates.amendTargetMotionId = ObjectId.isValid(updates.amendTargetMotionId) ? new ObjectId(updates.amendTargetMotionId) : updates.amendTargetMotionId; } catch(e) {}
    }
    Object.keys(updates).forEach(key => {
      updateFields[`motions.$.${key}`] = updates[key];
    });

    updateFields['motions.$.updatedAt'] = new Date();
    updateFields['updatedAt'] = new Date();

    const result = await this.collection().findOneAndUpdate(
      {
        _id: new ObjectId(committeeId),
        'motions._id': new ObjectId(motionId)
      },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (result) {
      return result.motions.find(m => m._id.toString() === motionId.toString());
    }

    return null;
  }

  static async deleteMotion(committeeId, motionId) {
    return await this.collection().updateOne(
      { _id: new ObjectId(committeeId) },
      {
        $pull: { motions: { _id: new ObjectId(motionId) } },
        $set: { updatedAt: new Date() }
      }
    );
  }

  static async updateMotionVoteCounts(committeeId, motionId, voteCounts) {
    return await this.updateMotion(committeeId, motionId, { votes: voteCounts });
  }
}

module.exports = Committee;
