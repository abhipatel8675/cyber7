const mongoose = require('mongoose');

// Singleton document persisting the alert poller's last-seen ticket IDs,
// so a server restart doesn't silently drop the next new alert.
const pollerStateSchema = new mongoose.Schema({
  _id: { type: String, default: 'alertPoller' },
  knownIds: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('PollerState', pollerStateSchema);
