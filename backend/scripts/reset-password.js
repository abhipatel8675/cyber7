const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyber7';

async function run() {
  if (!EMAIL || !PASSWORD) {
    console.error('Usage: node reset-password.js <email> <password>');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  const user = await User.findOne({ email: EMAIL.toLowerCase() });
  if (!user) { console.error('User not found:', EMAIL); process.exit(1); }
  user.password = await bcrypt.hash(PASSWORD, 10);
  await user.save();
  console.log('Password reset for:', user.email, '| role:', user.role);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
