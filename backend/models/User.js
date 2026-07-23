const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  name: {
    type: String,
    trim: true,
    default: null,
  },
  // ConnectWise company identifier – used to filter alerts for role 'user'. Optional for admin.
  companyId: {
    type: String,
    trim: true,
    default: null,
  },
  // ConnectWise numeric company RecID – paired with companyId to verify company ownership at signup.
  companyRecId: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
