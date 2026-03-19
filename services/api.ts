/**
 * Backend API client. Base URL from EXPO_PUBLIC_API_URL (e.g. http://localhost:3001).
 */

const getBaseUrl = () => {
  const url =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_CW_PROXY_URL ||
    'http://localhost:3001';
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

export interface LoginResponse {
  token: string;
  user: { id: string; email: string; role: string; companyId: string | null };
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
  companyId: string
): Promise<LoginResponse> {
  const res = await fetch(`${getBaseUrl()}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, companyId }),
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
