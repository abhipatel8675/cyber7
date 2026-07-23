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
    signal: AbortSignal.timeout(15000),
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
 * Fetch contacts for a company in ConnectWise by company identifier.
 * Returns array of { id, name, email, phone, title, companyName, companyIdentifier }.
 */
async function fetchContactsByCompanyFromConnectWise(companyIdentifier) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const condition = encodeURIComponent(`company/identifier="${companyIdentifier}"`);
  const url = `${baseUrl}/company/contacts?conditions=${condition}&pageSize=1000&orderBy=lastName asc`;
  const response = await fetch(url, {
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise contacts API error ${response.status}: ${text}`);
  }
  const raw = await response.json();
  return (Array.isArray(raw) ? raw : []).map((c) => {
    const phone =
      (Array.isArray(c.communicationItems) &&
        c.communicationItems.find((ci) => /phone/i.test(ci.type?.name || ''))?.value) ||
      '';
    const email =
      c.defaultEmailAddress ||
      (Array.isArray(c.communicationItems) &&
        c.communicationItems.find((ci) => /email/i.test(ci.type?.name || ''))?.value) ||
      '';
    const first = c.firstName || '';
    const last = c.lastName || '';
    const name = `${first} ${last}`.trim() || c.name || 'Unknown';
    return {
      id: c.id,
      name,
      email,
      phone,
      title: c.title || '',
      companyName: c.company?.name || '',
      companyIdentifier: c.company?.identifier || companyIdentifier,
    };
  });
}

/**
 * Verify an email belongs to a contact within a specific company in ConnectWise.
 * Returns true only if a contact in that company has this email (case-insensitive).
 */
async function verifyEmailInCompany(email, companyIdentifier) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();

  // Try server-side filter first
  const condition = encodeURIComponent(
    `defaultEmailAddress="${email}" AND company/identifier="${companyIdentifier}"`
  );
  const url = `${baseUrl}/company/contacts?conditions=${condition}&pageSize=1&fields=id`;
  const response = await fetch(url, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });

  if (response.ok) {
    const contacts = await response.json();
    if (Array.isArray(contacts) && contacts.length > 0) return true;
  }

  // Fallback: paginate company's contacts and match email manually
  const fallbackCond = encodeURIComponent(`company/identifier="${companyIdentifier}"`);
  const fallbackUrl = `${baseUrl}/company/contacts?conditions=${fallbackCond}&pageSize=1000&fields=id,defaultEmailAddress,communicationItems`;
  const fb = await fetch(fallbackUrl, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (!fb.ok) return false;
  const list = await fb.json();
  const target = email.toLowerCase();
  return (
    Array.isArray(list) &&
    list.some((c) => {
      if ((c.defaultEmailAddress || '').toLowerCase() === target) return true;
      if (Array.isArray(c.communicationItems)) {
        return c.communicationItems.some(
          (ci) =>
            /email/i.test(ci.type?.name || '') &&
            (ci.value || '').toLowerCase() === target
        );
      }
      return false;
    })
  );
}

/**
 * Verify a company exists in ConnectWise with matching identifier AND numeric id (RecID).
 * Returns the company's identifier string on success, or null on mismatch.
 */
async function verifyCompanyByIdAndRecId(companyIdentifier, companyRecId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();

  const condition = encodeURIComponent(`identifier="${companyIdentifier}"`);
  const url = `${baseUrl}/company/companies?conditions=${condition}&pageSize=1&fields=id,identifier`;
  const response = await fetch(url, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise company lookup error ${response.status}: ${text}`);
  }
  const list = await response.json();
  if (!Array.isArray(list) || list.length === 0) return null;
  const company = list[0];
  if (Number(company.id) !== Number(companyRecId)) return null;
  return company.identifier;
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

/**
 * Fetch a single ticket's full detail from ConnectWise.
 */
async function fetchTicketDetail(ticketId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const response = await fetch(`${baseUrl}/service/tickets/${ticketId}`, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise ticket detail error ${response.status}: ${text}`);
  }
  return response.json();
}

/**
 * Add a note to a ticket in ConnectWise.
 * type: 'Discussion' | 'Internal' | 'Resolution' — maps to CW flags.
 */
async function addTicketNoteInConnectWise(ticketId, { text, type = 'Discussion' }) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();

  const body = {
    text,
    detailDescriptionFlag: type === 'Discussion',
    internalAnalysisFlag: type === 'Internal',
    resolutionFlag: type === 'Resolution',
  };

  const response = await fetch(`${baseUrl}/service/tickets/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      clientId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ConnectWise add note error ${response.status}: ${errText}`);
  }
  return response.json();
}

/**
 * Fetch statuses for a board.
 */
async function fetchBoardStatuses(boardId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const url = `${baseUrl}/service/boards/${boardId}/statuses?pageSize=200`;
  const response = await fetch(url, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise board statuses error ${response.status}: ${text}`);
  }
  return response.json();
}

/**
 * Fetch sub-types for a board. Returns empty array if endpoint is inaccessible.
 */
async function fetchBoardSubTypes(boardId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();

  const r1 = await fetch(`${baseUrl}/service/boards/${boardId}/subtypes?pageSize=200`, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (r1.ok) return r1.json();
  return [];
}

/**
 * Update one or more ticket fields in ConnectWise.
 * Accepts { status?: string, subType?: string } — resolves names to IDs via the ticket's board.
 */
async function fetchServicePriorities() {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const response = await fetch(`${baseUrl}/service/priorities?pageSize=200&orderBy=sortOrder asc`, {
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise priorities error ${response.status}: ${text}`);
  }
  return response.json();
}

async function updateTicketFieldsInConnectWise(ticketId, { status, subType, priority, priorityId } = {}) {
  if (status === undefined && subType === undefined && priority === undefined) {
    throw new Error('No fields to update');
  }

  const ops = [];

  if (status !== undefined) {
    ops.push({ op: 'replace', path: '/status', value: { name: status } });
  }

  if (subType !== undefined) {
    ops.push({ op: 'replace', path: '/subType', value: { name: subType } });
  }

  if (priority !== undefined) {
    if (priorityId) {
      ops.push({ op: 'replace', path: '/priority', value: { id: priorityId, name: priority } });
    } else {
      const priorities = await fetchServicePriorities();
      const match = priorities.find((p) => p.name === priority);
      if (!match) throw new Error(`Unknown priority: ${priority}`);
      ops.push({ op: 'replace', path: '/priority', value: { id: match.id, name: match.name } });
    }
  }

  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const response = await fetch(`${baseUrl}/service/tickets/${ticketId}`, {
    method: 'PATCH',
    headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
    body: JSON.stringify(ops),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise ticket PATCH error ${response.status}: ${text}`);
  }
  return response.json();
}

/**
 * Fetch all notes for a ticket from ConnectWise.
 */
async function fetchTicketNotes(ticketId) {
  const baseUrl =
    process.env.CW_BASE_URL ||
    process.env.EXPO_PUBLIC_CW_BASE_URL ||
    'https://api-na.myconnectwise.net/v4_6_release/apis/3.0';
  const clientId =
    process.env.CW_CLIENT_ID || process.env.EXPO_PUBLIC_CW_CLIENT_ID || '';
  const auth = getAuthHeader();
  const response = await fetch(
    `${baseUrl}/service/tickets/${ticketId}/notes?orderBy=dateCreated asc&pageSize=100`,
    {
      headers: { Authorization: auth, clientId, 'Content-Type': 'application/json' },
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ConnectWise ticket notes error ${response.status}: ${text}`);
  }
  return response.json();
}

module.exports = {
  fetchTicketsFromConnectWise,
  fetchCompaniesFromConnectWise,
  fetchContactsByCompanyFromConnectWise,
  verifyCompanyByIdAndRecId,
  verifyEmailInCompany,
  checkEmailInConnectWise,
  resolveTicketInConnectWise,
  fetchTicketDetail,
  fetchTicketNotes,
  addTicketNoteInConnectWise,
  fetchBoardStatuses,
  fetchBoardSubTypes,
  updateTicketFieldsInConnectWise,
  fetchServicePriorities,
};