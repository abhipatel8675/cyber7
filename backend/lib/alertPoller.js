/**
 * Background job: polls ConnectWise every 60 seconds for new alerts.
 * When new tickets appear, pushes notifications scoped per company:
 *  - Users in the alert's company receive their company's alerts only.
 *  - Admins receive all alerts.
 */
const { fetchTicketsFromConnectWise } = require('./connectwise');
const { sendPushNotifications } = require('./notifications');
const PushToken = require('../models/PushToken');
const User = require('../models/User');

let lastAlertIds = new Set();
let isFirstPoll = true;

async function tokensForUserIds(userIds) {
  if (!userIds.length) return [];
  const ids = userIds.map((id) => String(id));
  const rows = await PushToken.find({ userId: { $in: ids } }).lean();
  return rows.map((r) => r.token).filter(Boolean);
}

function buildTitleBody(alerts) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const title =
    criticalCount > 0
      ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}`
      : `${alerts.length} New Alert${alerts.length > 1 ? 's' : ''}`;
  const body =
    alerts.length === 1
      ? alerts[0].message
      : `${alerts.length} new alerts require attention`;
  return { title, body };
}

async function pollAlerts() {
  try {
    const alerts = await fetchTicketsFromConnectWise();
    const currentIds = new Set(alerts.map((a) => a.id));

    if (!isFirstPoll) {
      const newAlerts = alerts.filter(
        (a) => !lastAlertIds.has(a.id) && (a.severity === 'critical' || a.severity === 'high')
      );
      if (newAlerts.length > 0) {
        // Group new alerts by companyIdentifier
        const byCompany = new Map();
        for (const a of newAlerts) {
          const key = (a.companyIdentifier || '').toLowerCase();
          if (!byCompany.has(key)) byCompany.set(key, []);
          byCompany.get(key).push(a);
        }

        // Pre-fetch admins (always notified)
        const admins = await User.find({ role: 'admin' }).select('_id').lean();
        const adminIds = admins.map((u) => u._id.toString());

        for (const [companyIdent, group] of byCompany) {
          const recipientIds = new Set(adminIds);

          if (companyIdent) {
            // Case-insensitive match on user.companyId
            const escaped = companyIdent.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const users = await User.find({
              role: 'user',
              companyId: { $regex: `^${escaped}$`, $options: 'i' },
            })
              .select('_id')
              .lean();
            for (const u of users) recipientIds.add(u._id.toString());
          }

          if (recipientIds.size === 0) continue;
          const tokens = await tokensForUserIds([...recipientIds]);
          if (tokens.length === 0) continue;

          const { title, body } = buildTitleBody(group);
          await sendPushNotifications(tokens, title, body, {
            type: 'new_alerts',
            company: companyIdent,
          });
        }
      }
    }

    lastAlertIds = currentIds;
    isFirstPoll = false;
  } catch (err) {
    console.error('Alert polling error:', err.message);
  }
}

function startAlertPolling() {
  pollAlerts(); // immediate first run to seed lastAlertIds
  setInterval(pollAlerts, 60000); // every 60 seconds
  console.log('Alert polling started (60s interval)');
}

module.exports = { startAlertPolling };
