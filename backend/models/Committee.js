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
}

module.exports = Committee;
