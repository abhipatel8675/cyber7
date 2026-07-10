const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const PushToken = require('../models/PushToken');
const AlertState = require('../models/AlertState');
const { fetchTicketsFromConnectWise } = require('../lib/connectwise');

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
// Non-admin users see only state changes for tickets in their own company.
router.get('/', authMiddleware, async (req, res) => {
  try {
    const recent = await AlertState.find({})
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    const { role, companyId } = req.user;
    let visible = recent;

    if (role !== 'admin') {
      const userIdent = String(companyId || '').toLowerCase();
      if (!userIdent) return res.json([]);
      // Build ticketId → companyIdentifier map from CW tickets
      let tickets = [];
      try {
        tickets = await fetchTicketsFromConnectWise();
      } catch (err) {
        console.error('Notifications: CW fetch failed, returning empty:', err.message);
        return res.json([]);
      }
      const ticketCompany = new Map();
      for (const t of tickets) {
        ticketCompany.set(t.id, (t.companyIdentifier || '').toLowerCase());
      }
      visible = recent.filter((s) => ticketCompany.get(s.ticketId) === userIdent);
    }

    const notifications = visible.slice(0, 50).map((s) => ({
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
