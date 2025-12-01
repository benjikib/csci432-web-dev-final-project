const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class Notification {
  static collection() {
    return getDB().collection('notifications');
  }

  static async create(notification) {
    // Helper to try converting to ObjectId but fall back to raw value when conversion fails
    const toOidOrRaw = (val) => {
      if (val === undefined || val === null) return null;
      try {
        return new ObjectId(val);
      } catch (e) {
        // not a valid ObjectId string; store raw value
        return val;
      }
    };

    const doc = {
      type: notification.type || 'access_request',
      committeeId: toOidOrRaw(notification.committeeId),
      committeeTitle: notification.committeeTitle || null,
      requesterId: toOidOrRaw(notification.requesterId),
      requesterName: notification.requesterName || null,
      message: notification.message || null,
      // Generic targets to support motions/comments/other future types
      targetType: notification.targetType || null, // e.g., 'motion', 'comment'
      targetId: toOidOrRaw(notification.targetId),
      metadata: notification.metadata || null,
      status: notification.status || 'pending', // pending, approved, denied, seen
      handledBy: toOidOrRaw(notification.handledBy),
      handledAt: notification.handledAt || null,
      seenAt: notification.seenAt || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async find(filter = {}, options = {}) {
    const cursor = this.collection().find(filter);
    if (options.skip) cursor.skip(options.skip);
    if (options.limit) cursor.limit(options.limit);
    if (options.sort) cursor.sort(options.sort);
    return await cursor.toArray();
  }

  static async updateById(id, updates) {
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await this.collection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  static async deleteById(id) {
    return await this.collection().deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = Notification;
