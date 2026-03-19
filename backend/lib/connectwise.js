/**
 * Fetch tickets from ConnectWise API. Used by the alerts route.
 * Expects env: CW_BASE_URL, CW_COMPANY_ID, CW_PUBLIC_KEY, CW_PRIVATE_KEY, CW_CLIENT_ID
 */
function getAuthHeader() {
  const companyId = process.env.CW_COMPANY_ID || process.env.EXPO_PUBLIC_CW_COMPANY_ID;
  const publicKey = process.env.CW_PUBLIC_KEY || process.env.EXPO_PUBLIC_CW_PUBLIC_KEY;
  const privateKey = process.env.CW_PRIVATE_KEY || process.env.EXPO_PUBLIC_CW_PRIVATE_KEY;
  if (!companyId || !publicKey || !privateKey) {
    throw new Error('Missing ConnectWise credentials in environment');
  }
  const credentials = `${companyId}+${publicKey}:${privateKey}`;
  return 'Basic ' + Buffer.from(credentials, 'utf8').toString('base64');
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function mapPriorityToSeverity(priorityName) {
  if (!priorityName) return 'info';
  const name = String(priorityName).toLowerCase();
  if (name.includes('critical') || name.includes('1')) return 'critical';
  if (name.includes('high') || name.includes('2')) return 'high';
  if (name.includes('medium') || name.includes('3')) return 'warning';
  return 'info';
}

function mapTicketToAlert(ticket) {
  const priorityName = ticket.priority?.name || 'Unknown';
  const severity = mapPriorityToSeverity(priorityName);
  const companyName =
    typeof ticket.company === 'object' && ticket.company?.name
      ? ticket.company.name
      : ticket.company?.identifier || 'Unknown Company';
  const companyIdentifier = (ticket.company?.identifier || ticket.company?.name || '').toLowerCase();
  return {
    id: ticket.id ?? 0,
    client: companyName,
    companyIdentifier,
    type: priorityName,
    message: ticket.summary || 'No summary',
    time: ticket.dateEntered ? formatTimeAgo(ticket.dateEntered) : 'Unknown',
    status: ticket.closedFlag ? 'resolved' : 'active',
    severity,
  };
}

async function fetchTicketsFromConnectWise() {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const url = `${baseUrl}/service/tickets?orderBy=dateEntered%20desc&pageSize=100`;
  const auth = getAuthHeader();
  const response = await fetch(url, {
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise API error ${response.status}: ${text}`);
  }
  const tickets = await response.json();
  return tickets.map(mapTicketToAlert);
}

/**
 * Fetch companies from ConnectWise (for registration dropdown).
 * GET /company/companies, then dedupe by identifier.
 */
async function fetchCompaniesFromConnectWise() {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const url = `${baseUrl}/company/companies?pageSize=1000&orderBy=name asc`;
  const response = await fetch(url, {
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise companies API error ${response.status}: ${text}`);
  }
  const raw = await response.json();
  const seen = new Set();
  const companies = [];
  for (const c of raw) {
    const identifier = (c.identifier || c.name || '').trim().toLowerCase();
    if (!identifier || seen.has(identifier)) continue;
    seen.add(identifier);
    companies.push({
      id: c.id,
      identifier: c.identifier || c.name || '',
      name: c.name || c.identifier || '',
    });
  }
  companies.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return companies;
}

/**
 * Check if an email exists in ConnectWise contacts.
 * Returns true if found, false otherwise.
 */
async function checkEmailInConnectWise(email) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();

  // Try defaultEmailAddress field (supported in ConnectWise v4+)
  const condition = encodeURIComponent(`defaultEmailAddress like "${email}"`);
  const url = `${baseUrl}/company/contacts?conditions=${condition}&pageSize=1&fields=id`;
  const response = await fetch(url, {
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 400) {
    // Field not supported on this CW instance — fetch a small page and search manually
    const fallbackUrl = `${baseUrl}/company/contacts?pageSize=200&fields=id,defaultEmailAddress`;
    const fallback = await fetch(fallbackUrl, {
      headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
    });
    if (!fallback.ok) {
      const text = await fallback.text();
      throw new Error(`ConnectWise contacts API error ${fallback.status}: ${text}`);
    }
    const contacts = await fallback.json();
    return Array.isArray(contacts) &&
      contacts.some((c) => (c.defaultEmailAddress || '').toLowerCase() === email.toLowerCase());
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise contacts API error ${response.status}: ${text}`);
  }
  const contacts = await response.json();
  return Array.isArray(contacts) && contacts.length > 0;
}

/**
 * Resolve a ticket in ConnectWise by setting closedFlag = true.
 */
async function resolveTicketInConnectWise(ticketId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const url = `${baseUrl}/service/tickets/${ticketId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{ op: 'replace', path: '/closedFlag', value: true }]),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise PATCH error ${response.status}: ${text}`);
  }
  return response.json();
}

module.exports = {
  fetchTicketsFromConnectWise,
  fetchCompaniesFromConnectWise,
  checkEmailInConnectWise,
  resolveTicketInConnectWise,
};