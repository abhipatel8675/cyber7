/**
 * Backend API client. Base URL from EXPO_PUBLIC_API_URL (e.g. http://localhost:3001).
 */

// Production backend on Railway. Used as the fallback so a build that somehow
// ships without EXPO_PUBLIC_API_URL still reaches a real HTTPS backend rather
// than an unreachable localhost (which iOS ATS also blocks over http://).
const PROD_API_URL = 'https://cyber7-api-production-be17.up.railway.app';

const getBaseUrl = () => {
  const url =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_CW_PROXY_URL ||
    PROD_API_URL;
  return url.replace(/\/$/, '');
};

export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface AlertTicket {
  id: number;
  client: string;
  companyIdentifier: string;
  type: string;
  message: string;
  time: string;
  status: AlertStatus;
  severity: 'critical' | 'high' | 'warning' | 'info';
}

export async function fetchAlerts(token: string): Promise<AlertTicket[]> {
  const res = await fetch(`${getBaseUrl()}/alerts`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface TicketNote {
  id: number;
  text: string;
  noteType: string;
  member: string;
  dateCreated: string;
  detailDescriptionFlag: boolean;
  internalAnalysisFlag: boolean;
  resolutionFlag: boolean;
}

export interface AlertDetail {
  id: number;
  summary: string;
  severity: string;
  status: AlertStatus;
  time: string;
  company: {
    name: string;
    identifier: string;
    contact: string;
    email: string;
    site: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  ticket: {
    board: string;
    status: string;
    type: string;
    subType: string;
    item: string;
    owner: string;
    sla: string;
    agreement: string;
    priority: string;
    priorityId: number | null;
    impact: string;
    urgency: string;
    estimatedStartDate: string;
    requiredDate: string;
    slaStatus: string;
    budgetHours: number;
    actualHours: number;
    enteredBy: string;
    enteredDate: string;
    assignedBy: string;
  };
  notes: TicketNote[];
}

export async function fetchAlertDetail(token: string, id: number): Promise<AlertDetail> {
  const res = await fetch(`${getBaseUrl()}/alerts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to load alert detail`);
  }
  return res.json();
}

export async function updateAlertStatus(
  token: string,
  alertId: number,
  action: 'acknowledge' | 'resolve'
): Promise<{ success: boolean; ticketId: number; status: AlertStatus }> {
  const res = await fetch(`${getBaseUrl()}/alerts/${alertId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action }),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update status');
  }
  return res.json();
}

export const TICKET_STATUSES = [
  'New',
  'Reopened',
  'Assigned',
  'Scheduled',
  'In Progress',
  'Waiting Customer Response',
  'Waiting for 3rd Party Vendor',
  'On Hold',
  'Customer Responded',
  'Closed',
] as const;
export type TicketStatus = typeof TICKET_STATUSES[number];

export const TICKET_PRIORITIES = [
  'Priority 1 - Critical',
  'Priority 2 - High',
  'Priority 3 - Medium',
  'Priority 4 - Low',
  'Priority 5 - Planning',
] as const;
export type TicketPriority = typeof TICKET_PRIORITIES[number];

export const TICKET_SUBTYPES = [
  'Data Theft',
  'DDos',
  'Default',
  'Elevation of Privilege',
  'Improper Computer Use',
  'Malware Outbreak',
  'Phishing Email Attack',
  'Ransomware',
  'RAT Access',
  'Remote Exploit',
  'Root Access',
  'Unauth Access',
  'Virus Outbreak',
] as const;
export type TicketSubType = typeof TICKET_SUBTYPES[number];

export async function fetchTicketSubtypes(token: string, ticketId: number): Promise<string[]> {
  const res = await fetch(`${getBaseUrl()}/alerts/${ticketId}/subtypes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.subtypes) ? data.subtypes : [];
}

export async function fetchTicketStatuses(token: string, ticketId: number): Promise<string[]> {
  const res = await fetch(`${getBaseUrl()}/alerts/${ticketId}/statuses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.statuses) ? data.statuses : [];
}

export type PriorityOption = { id: number; name: string };

export async function fetchTicketPriorities(token: string): Promise<PriorityOption[]> {
  const res = await fetch(`${getBaseUrl()}/alerts/meta/priorities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.priorities) ? data.priorities : [];
}

export async function updateTicketFields(
  token: string,
  ticketId: number,
  fields: { status?: string; subType?: string; priority?: string; priorityId?: number | null }
): Promise<{ success: boolean; ticketId: number; status?: string; subType?: string; priority?: string }> {
  const res = await fetch(`${getBaseUrl()}/alerts/${ticketId}/ticket`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fields),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to update ticket');
  }
  return res.json();
}

export type NoteType = 'Discussion' | 'Internal' | 'Resolution';

export async function addAlertNote(
  token: string,
  ticketId: number,
  text: string,
  type: NoteType = 'Discussion'
): Promise<TicketNote> {
  const res = await fetch(`${getBaseUrl()}/alerts/${ticketId}/notes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, type }),
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to add note');
  }
  return res.json();
}

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; name: string | null; role: string; companyId: string | null };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${getBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  return data;
}

/** Register a new user (company required). Admin accounts cannot be created via registration. */
export async function register(
  email: string,
  password: string,
  companyId: string,
  companyRecId: string,
  name?: string
): Promise<LoginResponse> {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, companyId, companyRecId, name }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export interface Company {
  id: number;
  identifier: string;
  name: string;
}

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch(`${getBaseUrl()}/companies`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load companies');
  }
  return res.json();
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  title: string;
  companyName: string;
  companyIdentifier: string;
}

export async function fetchContactsByCompany(
  token: string,
  identifier: string
): Promise<Contact[]> {
  const res = await fetch(
    `${getBaseUrl()}/companies/${encodeURIComponent(identifier)}/contacts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  if (res.status === 401) throw new Error('Unauthorized');
  if (res.status === 403) throw new Error('Admin access required');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load contacts');
  }
  return res.json();
}

export async function getMe(token: string): Promise<LoginResponse['user']> {
  const res = await fetch(`${getBaseUrl()}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    throw new Error('Failed to get user');
  }
  const data = await res.json();
  return data.user;
}

export interface Client {
  id: number;
  name: string;
  identifier: string;
  alertCount: number;
  criticalCount: number;
  highCount: number;
  lastAlert: string;
  status: 'active' | 'clear';
}

export async function fetchClients(token: string): Promise<Client[]> {
  const res = await fetch(`${getBaseUrl()}/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load clients');
  }
  return res.json();
}

export async function registerPushToken(
  token: string,
  pushToken: string,
  platform: string = 'mobile'
): Promise<void> {
  try {
    await fetch(`${getBaseUrl()}/notifications/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: pushToken, platform }),
    });
  } catch {
    // Non-critical — don't throw
  }
}

export interface AppNotification {
  id: string;
  ticketId: number;
  state: string;
  time: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
}

export async function fetchNotifications(token: string): Promise<AppNotification[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
