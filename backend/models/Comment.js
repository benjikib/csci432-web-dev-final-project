const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Comment {
  static collection() {
    return getDB().collection('comments');
  }

  static async create(commentData) {
    const comment = {
      motionId: new ObjectId(commentData.motionId),
      committeeId: new ObjectId(commentData.committeeId),
      author: commentData.author, // User ID
      content: commentData.content,
      stance: commentData.stance || 'neutral', // pro, con, neutral
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(comment);
    return { _id: result.insertedId, ...comment };
  }

  static async findByMotion(motionId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const comments = await this.collection()
      .find({ motionId: new ObjectId(motionId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await this.collection().countDocuments({
      motionId: new ObjectId(motionId)
    });

    return {
      comments,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total
    };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
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
}

module.exports = Comment;
