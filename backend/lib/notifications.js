/**
 * Send push notifications via Expo Push API.
 * tokens: array of Expo push token strings
 */
async function sendPushNotifications(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return;

  const messages = tokens
    .filter((t) => t && typeof t === 'string')
    .map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

  if (messages.length === 0) return;

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    });
    const result = await response.json();
    console.log(`Sent ${messages.length} push notification(s)`);
    return result;
  } catch (err) {
    console.error('Push notification send error:', err.message);
  }
}

module.exports = { sendPushNotifications };
