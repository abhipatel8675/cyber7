/**
 * Seed two admin users with password: admin@mark123
 * Run from project root: node backend/scripts/seed-admins.js
 * Or from backend folder: node scripts/seed-admins.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMINS = [
  { email: 'admin1@cyber7.com', password: 'admin@mark123' },
  { email: 'admin2@cyber7.com', password: 'admin@mark123' },
];

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyber7';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB connected');

  const hashedPassword = await bcrypt.hash('admin@mark123', 10);

  for (const { email } of ADMINS) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.password = hashedPassword;
      existing.role = 'admin';
      await existing.save();
      console.log('Updated admin:', email);
    } else {
      await User.create({
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        companyId: null,
      });
      console.log('Created admin:', email);
    }
  }

  console.log('Done. Two admins ready: admin1@cyber7.com, admin2@cyber7.com / password: admin@mark123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
