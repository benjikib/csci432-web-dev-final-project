const { connectDB, client } = require('./config/database');
const Committee = require('./models/Committee');
const Motion = require('./models/Motion');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await connectDB();

    // Create committees
    console.log('Creating committees...');

    const financeCommittee = await Committee.create({
      title: 'Finance Committee',
      description: 'Oversees budget, financial planning, and expense approvals for the community.',
      members: []
    });
    console.log(`✅ Created Finance Committee (ID: ${financeCommittee._id})`);

    const landscapingCommittee = await Committee.create({
      title: 'Landscaping Committee',
      description: 'Manages community landscaping, garden maintenance, and outdoor aesthetics.',
      members: []
    });
    console.log(`✅ Created Landscaping Committee (ID: ${landscapingCommittee._id})`);

    const safetyCommittee = await Committee.create({
      title: 'Safety & Security Committee',
      description: 'Handles community safety measures, security protocols, and emergency preparedness.',
      members: []
    });
    console.log(`✅ Created Safety & Security Committee (ID: ${safetyCommittee._id})`);

    // Create motions for Finance Committee
    console.log('\nCreating motions...');

    await Motion.create({
      committeeId: financeCommittee._id,
      title: 'Motion to Approve Annual Budget',
      description: 'I move that we approve the proposed annual budget for the next fiscal year.',
      fullDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      status: 'active'
    });

    await Motion.create({
      committeeId: financeCommittee._id,
      title: 'Motion to Increase Reserve Fund',
      description: 'Proposal to increase the reserve fund by 10% to prepare for emergencies.',
      fullDescription: 'This motion proposes a strategic increase in our community reserve fund to ensure we have adequate resources for unexpected expenses and emergency situations.',
      status: 'active'
    });

    // Create motions for Landscaping Committee
    await Motion.create({
      committeeId: landscapingCommittee._id,
      title: 'Motion to Install New Garden Features',
      description: 'I move that we install new decorative garden features in the community park.',
      fullDescription: 'This proposal includes the installation of decorative planters, benches, and a small fountain to enhance the aesthetic appeal of our community park area.',
      status: 'active'
    });

    await Motion.create({
      committeeId: landscapingCommittee._id,
      title: 'Motion to Hire Landscaping Service',
      description: 'Proposal to contract a professional landscaping service for quarterly maintenance.',
      fullDescription: 'To maintain the quality of our community grounds, this motion proposes hiring a professional landscaping service that will provide quarterly maintenance including mowing, trimming, and seasonal plantings.',
      status: 'active'
    });

    // Create motions for Safety Committee
    await Motion.create({
      committeeId: safetyCommittee._id,
      title: 'Motion to Install Security Cameras',
      description: 'Proposal to install security cameras at community entry points.',
      fullDescription: 'This motion proposes the installation of modern security cameras at all main entry and exit points of the community to enhance safety and deter criminal activity.',
      status: 'active'
    });

    await Motion.create({
      committeeId: safetyCommittee._id,
      title: 'Motion to Establish Neighborhood Watch',
      description: 'I move that we establish a formal neighborhood watch program.',
      fullDescription: 'This proposal seeks to create a structured neighborhood watch program with regular meetings, communication channels, and coordination with local law enforcement.',
      status: 'active'
    });

    console.log('✅ Created 6 motions across all committees');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Committees: 3`);
    console.log(`   - Motions: 6`);
    console.log('\n💡 You can now use these committee IDs in your frontend:');
    console.log(`   Finance Committee: ${financeCommittee._id}`);
    console.log(`   Landscaping Committee: ${landscapingCommittee._id}`);
    console.log(`   Safety & Security Committee: ${safetyCommittee._id}`);

    // Close connection
    await client.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
