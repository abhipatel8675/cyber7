const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { fetchCompaniesFromConnectWise, fetchTicketsFromConnectWise } = require('../lib/connectwise');

const router = express.Router();

// GET /clients – admin only
// Returns ConnectWise companies enriched with real alert counts
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const [companies, tickets] = await Promise.all([
      fetchCompaniesFromConnectWise(),
      fetchTicketsFromConnectWise(),
    ]);

    // Only critical + high tickets (same filter as /alerts)
    const relevantTickets = tickets.filter(
      (t) => t.severity === 'critical' || t.severity === 'high'
    );

    // Build per-company stats
    const statsMap = {};
    for (const ticket of relevantTickets) {
      const key = ticket.companyIdentifier;
      if (!key) continue;
      if (!statsMap[key]) {
        statsMap[key] = { total: 0, critical: 0, high: 0, lastTime: null };
      }
      statsMap[key].total += 1;
      if (ticket.severity === 'critical') statsMap[key].critical += 1;
      if (ticket.severity === 'high') statsMap[key].high += 1;
      // Keep the most recent ticket time
      if (!statsMap[key].lastTime || ticket.time === 'Just now') {
        statsMap[key].lastTime = ticket.time;
      }
    }

    const clients = companies.map((company) => {
      const key = (company.identifier || '').toLowerCase();
      const stats = statsMap[key] || { total: 0, critical: 0, high: 0, lastTime: null };
      return {
        id: company.id,
        name: company.name,
        identifier: company.identifier,
        alertCount: stats.total,
        criticalCount: stats.critical,
        highCount: stats.high,
        lastAlert: stats.lastTime || 'No alerts',
        status: stats.total > 0 ? 'active' : 'clear',
      };
    });

    // Sort: companies with alerts first, then alphabetically
    clients.sort((a, b) => {
      if (b.alertCount !== a.alertCount) return b.alertCount - a.alertCount;
      return a.name.localeCompare(b.name);
    });

    res.json(clients);
  } catch (err) {
    console.error('Clients fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load clients' });
  }
});

module.exports = router;
