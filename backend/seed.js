require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedSpecialist = async () => {
  try {
    await connectDB();

    const email = process.argv[2] || 'admin@refercare.com';
    const password = process.argv[3] || 'admin123';

    console.log(`Seeding specialist account with email: ${email}`);

    let specialist = await User.findOne({ email: email.toLowerCase() });

    if (specialist) {
      if (specialist.role !== 'Specialist') {
        specialist.role = 'Specialist';
      }
      specialist.password = password;
      specialist.name = 'Admin Specialist';
      specialist.isEmailVerified = true;
      await specialist.save();
      console.log('Existing account updated to Specialist with new password.');
    } else {
      specialist = await User.create({
        name: 'Admin Specialist',
        email: email.toLowerCase(),
        password,
        role: 'Specialist',
        phone: '7331105294',
        specialization: 'General',
        isEmailVerified: true,
      });
      console.log('New specialist account successfully created.');
    }

    console.log('\n--- Credentials ---');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSpecialist();
