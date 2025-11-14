require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', uri.replace(/:[^:@]+@/, ':****@')); // Hide password

const client = new MongoClient(uri, {
  tls: true,
  serverSelectionTimeoutMS: 5000,
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');

    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping successful!');

    const db = client.db('commie');
    const collections = await db.listCollections().toArray();
    console.log('✅ Collections:', collections.map(c => c.name));

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

testConnection();
