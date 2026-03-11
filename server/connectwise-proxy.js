/**
 * ConnectWise API proxy — run this when using the app in the browser to avoid CORS.
 *
 * From project root:
 *   node server/connectwise-proxy.js
 *   (Loads .env from project root if dotenv is installed: npm install dotenv)
 *
 * Then in .env set: EXPO_PUBLIC_CW_PROXY_URL=http://localhost:3001
 */

try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (_) {
  // dotenv not installed; use env vars set in shell
}

const http = require('http');

const PORT = process.env.CW_PROXY_PORT || 3001;

function getAuthHeader() {
  const companyId = process.env.EXPO_PUBLIC_CW_COMPANY_ID || process.env.CW_COMPANY_ID;
  const publicKey = process.env.EXPO_PUBLIC_CW_PUBLIC_KEY || process.env.CW_PUBLIC_KEY;
  const privateKey = process.env.EXPO_PUBLIC_CW_PRIVATE_KEY || process.env.CW_PRIVATE_KEY;
  console.log('companyId', companyId);
  console.log('publicKey', publicKey);
  console.log('privateKey', privateKey);
  if (!companyId || !publicKey || !privateKey) {
    throw new Error('Missing CW credentials. Set EXPO_PUBLIC_CW_* or CW_* in env.');
  }
  const credentials = `${companyId}+${publicKey}:${privateKey}`;
  return 'Basic ' + Buffer.from(credentials, 'utf8').toString('base64');
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' || req.url !== '/tickets') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use GET /tickets' }));
    return;
  }

  const baseUrl = process.env.EXPO_PUBLIC_CW_BASE_URL || process.env.CW_BASE_URL || 'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId = process.env.EXPO_PUBLIC_CW_CLIENT_ID || process.env.CW_CLIENT_ID || '';

  const url = `${baseUrl}/service/tickets?orderBy=dateEntered%20desc&pageSize=100`;

  try {
    const auth = getAuthHeader();
    const response = await fetch(url, {
      headers: {
        Authorization: auth,
        clientId,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(data);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`ConnectWise proxy running at http://localhost:${PORT}`);
  console.log('Use GET http://localhost:' + PORT + '/tickets');
});
