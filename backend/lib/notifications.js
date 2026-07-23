/**
 * Send a single push message to Expo's push API and report the real outcome.
 */
async function sendOne(message) {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify([message]),
    });
    const result = await response.json();
    const ticket = Array.isArray(result?.data) ? result.data[0] : result?.data;
    if (result?.errors || ticket?.status === 'error') {
      console.error(`Push notification failed for ${message.to}:`, JSON.stringify(result.errors || ticket));
      return { token: message.to, ok: false, result };
    }
    return { token: message.to, ok: true, result };
  } catch (err) {
    console.error(`Push notification send error for ${message.to}:`, err.message);
    return { token: message.to, ok: false, error: err.message };
  }
}

/**
 * Send push notifications via Expo Push API.
 * Sends each token as its own request — Expo rejects an entire batch if it
 * mixes tokens from different Expo projects, which would otherwise silently
 * block delivery to every recipient because of one unrelated bad token.
 * tokens: array of Expo push token strings
 */
async function sendPushNotifications(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return [];

  const messages = tokens
    .filter((t) => t && typeof t === 'string')
    .map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

  if (messages.length === 0) return [];

  const results = await Promise.all(messages.map(sendOne));
  const succeeded = results.filter((r) => r.ok).length;
  console.log(`Sent ${succeeded}/${messages.length} push notification(s)`);
  return results;
}

module.exports = { sendPushNotifications };
