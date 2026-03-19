/**
 * Background job: polls ConnectWise every 60 seconds for new alerts.
 * When new tickets appear, sends push notifications to all registered devices.
 */
const { fetchTicketsFromConnectWise } = require('./connectwise');
const { sendPushNotifications } = require('./notifications');
const PushToken = require('../models/PushToken');

let lastAlertIds = new Set();
let isFirstPoll = true;

async function pollAlerts() {
  try {
    const alerts = await fetchTicketsFromConnectWise();
    const currentIds = new Set(alerts.map((a) => a.id));

    if (!isFirstPoll) {
      const newAlerts = alerts.filter((a) => !lastAlertIds.has(a.id));
      if (newAlerts.length > 0) {
        const tokens = await PushToken.find({});
        const tokenStrings = tokens.map((t) => t.token);

        const criticalCount = newAlerts.filter((a) => a.severity === 'critical').length;
        const title =
          criticalCount > 0
            ? `${criticalCount} Critical Alert${criticalCount > 1 ? 's' : ''}`
            : `${newAlerts.length} New Alert${newAlerts.length > 1 ? 's' : ''}`;
        const body =
          newAlerts.length === 1
            ? newAlerts[0].message
            : `${newAlerts.length} new alerts require attention`;

        await sendPushNotifications(tokenStrings, title, body, { type: 'new_alerts' });
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
