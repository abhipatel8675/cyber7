/**
 * Seed test employee user.
 * Run: node backend/scripts/seed-test-user.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const EMAIL = 'test@cyber7.com';
const PASSWORD = 'test@123';
const COMPANY_ID = 'Cyber7';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyber7';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const existing = await User.findOne({ email: EMAIL.toLowerCase() });
  if (existing) {
    existing.password = hashed;
    existing.role = 'user';
    existing.companyId = COMPANY_ID;
    await existing.save();
    console.log('Updated test user:', EMAIL);
  } else {
    await User.create({
      email: EMAIL.toLowerCase(),
      password: hashed,
      role: 'user',
      companyId: COMPANY_ID,
    });
    console.log('Created test user:', EMAIL);
  }

  console.log(`Login: ${EMAIL} / ${PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
