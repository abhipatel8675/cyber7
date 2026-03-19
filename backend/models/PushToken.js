const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  platform: { type: String, default: 'mobile' },
}, { timestamps: true });

module.exports = mongoose.model('PushToken', pushTokenSchema);
