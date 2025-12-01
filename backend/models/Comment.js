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
      isSystemMessage: commentData.isSystemMessage || false,
      messageType: commentData.messageType || null, // 'voting-eligible' | 'roll-call-vote' | 'voting-opened' | 'voting-closed'
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
      .sort({ createdAt: 1 })  // Sort ascending (oldest first) for chat-like display
      .skip(skip)
      .limit(limit)
      .toArray();

    // Populate author information
    const userCollection = getDB().collection('users');
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        if (comment.author) {
          // Try both ObjectId and string format for author field
          let user = null;
          try {
            // First try as ObjectId
            user = await userCollection.findOne(
              { _id: new ObjectId(comment.author) },
              { projection: { name: 1, email: 1, picture: 1 } }
            );
          } catch (e) {
            // If that fails, try as string (in case it's stored differently)
            user = await userCollection.findOne(
              { _id: comment.author },
              { projection: { name: 1, email: 1, picture: 1 } }
            );
          }
          
          // Also try userId field if _id didn't work
          if (!user) {
            user = await userCollection.findOne(
              { userId: comment.author },
              { projection: { name: 1, email: 1, picture: 1 } }
            );
          }
          
          return {
            ...comment,
            authorName: user?.name || 'Unknown User',
            authorInfo: user ? { name: user.name, email: user.email, picture: user.picture } : null
          };
        }
        return {
          ...comment,
          authorName: 'Unknown User',
          authorInfo: null
        };
      })
    );

    const total = await this.collection().countDocuments({
      motionId: new ObjectId(motionId)
    });

    return {
      comments: commentsWithAuthors,
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
