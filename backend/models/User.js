const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

class User {
  static collection() {
    return getDB().collection('users');
  }

  static async create(userData) {
    const user = {
      email: userData.email,
      password: userData.password, // Should be hashed before passing here
      name: userData.name,
      communityCode: userData.communityCode || null,
      bio: userData.bio || '',
      phoneNumber: userData.phoneNumber || '',
      address: userData.address || '',
      profilePicture: userData.profilePicture || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(user);
    return { _id: result.insertedId, ...user };
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ email });
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

module.exports = User;
