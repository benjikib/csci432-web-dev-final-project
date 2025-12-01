const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Vote {
  static collection() {
    return getDB().collection('votes');
  }

  static toObjectId(value) {
    // Return null if value cannot be converted
    if (!value && value !== 0) return null;
    try {
      if (value && typeof value === 'object' && value._bsontype === 'ObjectID') return value;
      if (ObjectId.isValid(value)) return new ObjectId(value);
      return null;
    } catch (err) {
      return null;
    }
  }

  static async create(voteData) {
    // Defensive casting: accept string or ObjectId
    const motionObjId = this.toObjectId(voteData.motionId);
    const committeeObjId = this.toObjectId(voteData.committeeId);

    if (!motionObjId) {
      throw new Error(`Invalid motionId provided to Vote.create: ${JSON.stringify(voteData.motionId)}`);
    }
    if (!committeeObjId) {
      throw new Error(`Invalid committeeId provided to Vote.create: ${JSON.stringify(voteData.committeeId)}`);
    }

    const vote = {
      motionId: motionObjId,
      committeeId: committeeObjId,
      userId: voteData.userId,
      vote: voteData.vote, // 'yes', 'no', 'abstain'
      isAnonymous: voteData.isAnonymous || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(vote);
    return { _id: result.insertedId, ...vote };
  }

  static async findByMotion(motionId) {
    const mid = this.toObjectId(motionId);
    if (!mid) return [];
    return await this.collection()
      .find({ motionId: mid })
      .toArray();
  }

  static async findByUserAndMotion(userId, motionId) {
    const mid = this.toObjectId(motionId);
    if (!mid) return null;
    return await this.collection().findOne({
      userId,
      motionId: mid
    });
  }

  static async updateOrCreate(userId, motionId, committeeId, voteValue, isAnonymous = false) {
    const existingVote = await this.findByUserAndMotion(userId, motionId);

    if (existingVote) {
      // Update existing vote
      const result = await this.collection().findOneAndUpdate(
        { _id: existingVote._id },
        {
          $set: {
            vote: voteValue,
            isAnonymous,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );
      // Normalize to consistently return the document
      return result.value;
    } else {
      // Create new vote
      const newVote = await this.create({
        motionId,
        committeeId,
        userId,
        vote: voteValue,
        isAnonymous
      });
      return newVote;
    }
  }

  static async deleteByUserAndMotion(userId, motionId) {
    const mid = this.toObjectId(motionId);
    if (!mid) return { deletedCount: 0 };
    return await this.collection().deleteOne({
      userId,
      motionId: mid
    });
  }

  static async getVoteSummary(motionId) {
    const votes = await this.findByMotion(motionId);

    const summary = votes.reduce((acc, vote) => {
      acc[vote.vote] = (acc[vote.vote] || 0) + 1;
      acc.total += 1;
      return acc;
    }, { yes: 0, no: 0, abstain: 0, total: 0 });

    return summary;
  }
}

module.exports = Vote;
