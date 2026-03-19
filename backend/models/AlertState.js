const mongoose = require('mongoose');

const alertStateSchema = new mongoose.Schema({
  ticketId: { type: Number, required: true, unique: true },
  state: { type: String, enum: ['acknowledged', 'resolved'], required: true },
  updatedBy: { type: String, required: true }, // userId
}, { timestamps: true });

module.exports = mongoose.model('AlertState', alertStateSchema);
