const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('csci432-final-project');
    const users = await db.collection('users').find({}).toArray();
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log('\n---');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Auth0 ID:', user.auth0Id);
      console.log('Password type:', typeof user.password);
      console.log('Password value:', user.password ? (typeof user.password === 'string' ? '(hashed string)' : JSON.stringify(user.password)) : 'null');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUsers();
