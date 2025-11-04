const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Vote {
  static collection() {
    return getDB().collection('votes');
  }

  static async create(voteData) {
    const vote = {
      motionId: new ObjectId(voteData.motionId),
      committeeId: new ObjectId(voteData.committeeId),
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
    return await this.collection()
      .find({ motionId: new ObjectId(motionId) })
      .toArray();
  }

  static async findByUserAndMotion(userId, motionId) {
    return await this.collection().findOne({
      userId,
      motionId: new ObjectId(motionId)
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
      return result;
    } else {
      // Create new vote
      return await this.create({
        motionId,
        committeeId,
        userId,
        vote: voteValue,
        isAnonymous
      });
    }
  }

  static async deleteByUserAndMotion(userId, motionId) {
    return await this.collection().deleteOne({
      userId,
      motionId: new ObjectId(motionId)
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
