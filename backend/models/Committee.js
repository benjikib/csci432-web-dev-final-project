const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { slugify } = require('../utils/slugify');

class Committee {
  static collection() {
    return getDB().collection('committees');
  }

  static async create(committeeData) {
    const slug = committeeData.slug || slugify(committeeData.title);

    const committee = {
      title: committeeData.title,
      slug: slug,
      description: committeeData.description,
      members: committeeData.members || [], // Array of user IDs
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
    const committees = await this.collection()
      .find({ members: userId })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments({ members: userId });

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
    return await this.collection().updateOne(
      { _id: new ObjectId(committeeId) },
      { $addToSet: { members: userId } }
    );
  }

  static async removeMember(committeeId, userId) {
    return await this.collection().updateOne(
      { _id: new ObjectId(committeeId) },
      { $pull: { members: userId } }
    );
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
      amendTargetMotionId: motionData.amendTargetMotionId ? new ObjectId(motionData.amendTargetMotionId) : null,
      
      status: motionData.status || 'active',
      votes: {
        yes: 0,
        no: 0,
        abstain: 0
      },
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

  static async findMotions(committeeId, page = 1, limit = 10) {
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

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedMotions = sortedMotions.slice(skip, skip + limit);

    return {
      motions: paginatedMotions,
      page,
      limit,
      totalPages: Math.ceil(sortedMotions.length / limit),
      total: sortedMotions.length
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
