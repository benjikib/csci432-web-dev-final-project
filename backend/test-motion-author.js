require('dotenv').config();
const { connectDB } = require('./config/database');
const Committee = require('./models/Committee');
const User = require('./models/User');

async function testMotionAuthor() {
  try {
    await connectDB();
    console.log('Connected to database\n');

    // Get all committees
    const committees = await Committee.collection().find({}).toArray();
    console.log(`Found ${committees.length} committees\n`);

    // Check first committee's motions
    if (committees.length > 0) {
      const firstCommittee = committees[0];
      console.log(`Committee: ${firstCommittee.title}`);
      console.log(`Motions count: ${firstCommittee.motions?.length || 0}\n`);

      if (firstCommittee.motions && firstCommittee.motions.length > 0) {
        console.log('\nChecking all motions for authors:');
        let motionsWithAuthors = 0;

        for (const motion of firstCommittee.motions) {
          if (motion.author) {
            motionsWithAuthors++;
            console.log(`\n✅ Motion "${motion.title}" has author:`, motion.author);
            try {
              const author = await User.findById(motion.author.toString());
              console.log('   Author name:', author ? author.name : 'NOT FOUND');
              console.log('   Author email:', author?.email);
            } catch (err) {
              console.error('   Error looking up author:', err.message);
            }
          } else {
            console.log(`❌ Motion "${motion.title}" - NO AUTHOR`);
          }
        }

        console.log(`\n📊 Summary: ${motionsWithAuthors} out of ${firstCommittee.motions.length} motions have authors`);
      }
    }

    // Check if there are any users
    const users = await User.collection().find({}).toArray();
    console.log(`\nTotal users in database: ${users.length}`);
    if (users.length > 0) {
      console.log('First user:', users[0].name, '-', users[0].email);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testMotionAuthor();
