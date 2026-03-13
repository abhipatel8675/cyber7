const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { fetchTicketsFromConnectWise } = require('../lib/connectwise');

const router = express.Router();

// GET /alerts – requires auth. Admin: all alerts; User: only their company's alerts.
router.get('/', authMiddleware, async (req, res) => {
  try {
    let alerts = await fetchTicketsFromConnectWise();
    const { role, companyId } = req.user;
    if (role === 'user' && companyId) {
      const normalized = String(companyId).trim().toLowerCase();
      alerts = alerts.filter(
        (a) => a.companyIdentifier && a.companyIdentifier === normalized
      );
    }
    res.json(alerts);
  } catch (err) {
    console.error('Alerts fetch error:', err);
    res.status(500).json({
      error: err.message || 'Failed to load alerts',
    });
  }
});

module.exports = router;
