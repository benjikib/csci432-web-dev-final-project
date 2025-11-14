const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Motion {
  static collection() {
    return getDB().collection('motions');
  }

  static async create(motionData) {
    const motion = {
      committeeId: new ObjectId(motionData.committeeId),
      title: motionData.title,
      description: motionData.description,
      fullDescription: motionData.fullDescription || motionData.description,
      author: motionData.author || null, // User ID of the motion creator (optional for now)
      status: motionData.status || 'active', // active, past, voided
      votes: {
        yes: 0,
        no: 0,
        abstain: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(motion);
    return { _id: result.insertedId, ...motion };
  }

  static async findByCommittee(committeeId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const motions = await this.collection()
      .find({ committeeId: new ObjectId(committeeId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments({
      committeeId: new ObjectId(committeeId)
    });

    return {
      motions,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async findByIdAndCommittee(motionId, committeeId) {
    return await this.collection().findOne({
      _id: new ObjectId(motionId),
      committeeId: new ObjectId(committeeId)
    });
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

  static async updateVoteCounts(motionId) {
    const Vote = require('./Vote');
    const votes = await Vote.collection().find({
      motionId: new ObjectId(motionId)
    }).toArray();

    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.vote] = (acc[vote.vote] || 0) + 1;
      return acc;
    }, { yes: 0, no: 0, abstain: 0 });

    return await this.updateById(motionId, { votes: voteCounts });
  }
}

module.exports = Motion;
