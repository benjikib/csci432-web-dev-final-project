const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global variable to cache the database connection
let cachedClient = null;
let cachedDb = null;

async function connectDB() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoClient with optimized settings for serverless
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10, // Limit connection pool for serverless
    minPoolSize: 1,
  });

  try {
    // Connect the client to the server
    await client.connect();

    // Get the database instance
    const db = client.db("commie");

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

function getDB() {
  if (!cachedDb) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return cachedDb;
}

module.exports = { connectDB, getDB, client: cachedClient };
