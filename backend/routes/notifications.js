const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const PushToken = require('../models/PushToken');
const AlertState = require('../models/AlertState');

const router = express.Router();

// POST /notifications/token – register Expo push token for this user
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    await PushToken.findOneAndUpdate(
      { userId: req.user._id.toString() },
      { token, platform: platform || 'mobile' },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Push token save error:', err);
    res.status(500).json({ error: 'Failed to save token' });
  }
});

// GET /notifications – recent alert activity (state changes)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recent = await AlertState.find({})
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const notifications = recent.map((s) => ({
      id: s._id.toString(),
      ticketId: s.ticketId,
      state: s.state,
      updatedBy: s.updatedBy,
      time: formatTimeAgo(s.updatedAt),
      type: s.state === 'resolved' ? 'success' : 'info',
      title: s.state === 'resolved' ? 'Alert Resolved' : 'Alert Acknowledged',
      message: `Ticket #${s.ticketId} was ${s.state}`,
      read: true,
    }));

    res.json(notifications);
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

function formatTimeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

module.exports = router;
