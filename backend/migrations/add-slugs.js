const { connectDB, client } = require('../config/database');
const { slugify } = require('../utils/slugify');

async function addSlugsToCommittees() {
  try {
    const db = await connectDB();
    const committeesCollection = db.collection('committees');

    // Find all committees without slugs
    const committees = await committeesCollection.find({ slug: { $exists: false } }).toArray();

    console.log(`Found ${committees.length} committees without slugs`);

    for (const committee of committees) {
      const slug = slugify(committee.title);

      await committeesCollection.updateOne(
        { _id: committee._id },
        { $set: { slug: slug } }
      );

      console.log(`Added slug "${slug}" to committee "${committee.title}"`);
    }

    console.log('✅ Migration completed successfully');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addSlugsToCommittees();
