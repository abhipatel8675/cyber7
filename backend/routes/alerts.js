const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { fetchTicketsFromConnectWise, resolveTicketInConnectWise } = require('../lib/connectwise');
const AlertState = require('../models/AlertState');

const router = express.Router();

// GET /alerts/test – returns fake alerts for UI testing (no ConnectWise needed)
// Usage: hit GET /alerts/test while logged in to see sample critical/high alerts
router.get('/test', authMiddleware, (req, res) => {
  res.json([
    {
      id: 9001,
      client: 'Acme Corp',
      companyIdentifier: 'acme',
      type: 'Priority 1 - Critical',
      message: '[TEST] Server CPU at 99% — immediate action required',
      time: 'Just now',
      status: 'active',
      severity: 'critical',
    },
    {
      id: 9002,
      client: 'Tech Solutions',
      companyIdentifier: 'techsolutions',
      type: 'Priority 2 - High',
      message: '[TEST] Firewall rule violation detected on network segment B',
      time: '3 min ago',
      status: 'active',
      severity: 'high',
    },
    {
      id: 9003,
      client: 'Acme Corp',
      companyIdentifier: 'acme',
      type: 'Priority 1 - Critical',
      message: '[TEST] Database connection pool exhausted — services degraded',
      time: '10 min ago',
      status: 'acknowledged',
      severity: 'critical',
    },
    {
      id: 9004,
      client: 'StartUp LLC',
      companyIdentifier: 'startupllc',
      type: 'Priority 2 - High',
      message: '[TEST] SSL certificate expiring in 3 days',
      time: '1 hour ago',
      status: 'resolved',
      severity: 'high',
    },
  ]);
});

// GET /alerts – requires auth. Admin: all alerts; User: only their company's alerts.
// Merges ConnectWise tickets with local state (acknowledged / resolved).
router.get('/', authMiddleware, async (req, res) => {
  try {
    let alerts = await fetchTicketsFromConnectWise();

    // Only surface high-priority alerts — filter out medium (warning) and info
    alerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

    const { role, companyId } = req.user;

    if (role === 'user' && companyId) {
      const normalized = String(companyId).trim().toLowerCase();
      alerts = alerts.filter(
        (a) => a.companyIdentifier && a.companyIdentifier === normalized
      );
    }

    // Merge with local state overrides
    const ticketIds = alerts.map((a) => a.id);
    const states = await AlertState.find({ ticketId: { $in: ticketIds } }).lean();
    const stateMap = {};
    for (const s of states) {
      stateMap[s.ticketId] = s.state;
    }

    alerts = alerts.map((alert) => {
      const localState = stateMap[alert.id];
      if (localState === 'acknowledged' && alert.status === 'active') {
        return { ...alert, status: 'acknowledged' };
      }
      if (localState === 'resolved') {
        return { ...alert, status: 'resolved' };
      }
      return alert;
    });

    res.json(alerts);
  } catch (err) {
    console.error('Alerts fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load alerts' });
  }
});

// PATCH /alerts/:id/status – acknowledge or resolve an alert
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { action } = req.body; // 'acknowledge' | 'resolve'
    const userId = req.user._id.toString();

    if (!action || !['acknowledge', 'resolve'].includes(action)) {
      return res.status(400).json({ error: 'Action must be acknowledge or resolve' });
    }

    const state = action === 'acknowledge' ? 'acknowledged' : 'resolved';

    await AlertState.findOneAndUpdate(
      { ticketId },
      { state, updatedBy: userId },
      { upsert: true, new: true }
    );

    // For resolve, also attempt to close in ConnectWise
    if (action === 'resolve') {
      try {
        await resolveTicketInConnectWise(ticketId);
      } catch (cwErr) {
        // Log but don't fail — local state is saved
        console.error('ConnectWise resolve failed (local state saved):', cwErr.message);
      }
    }

    res.json({ success: true, ticketId, status: state });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

module.exports = router;
