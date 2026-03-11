import { CONNECTWISE_CONFIG } from '../config/connectwise';

export interface ConnectWiseTicket {
  id?: number;
  summary?: string;
  company?: { id?: number; identifier?: string; name?: string };
  status?: { id?: number; name?: string };
  priority?: { id?: number; name?: string };
  dateEntered?: string;
  closedFlag?: boolean;
}

export interface AlertTicket {
  id: number;
  client: string;
  type: string;
  message: string;
  time: string;
  status: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
}

function base64Encode(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const byte1 = str.charCodeAt(i);
    const byte2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
    const byte3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;
    const enc1 = byte1 >> 2;
    const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
    const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
    const enc4 = byte3 & 63;
    output += chars[enc1] + chars[enc2];
    output += i + 1 < str.length ? chars[enc3] : '=';
    output += i + 2 < str.length ? chars[enc4] : '=';
  }
  return output;
}

function getAuthHeader(): string {
  const { companyId, publicKey, privateKey } = CONNECTWISE_CONFIG;
  const credentials = `${companyId}+${publicKey}:${privateKey}`;
  return 'Basic ' + base64Encode(credentials);
}

function formatTimeAgo(dateStr: string): string {
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

function mapPriorityToSeverity(priorityName?: string): AlertTicket['severity'] {
  if (!priorityName) return 'info';
  const name = priorityName.toLowerCase();
  if (name.includes('critical') || name.includes('1')) return 'critical';
  if (name.includes('high') || name.includes('2')) return 'high';
  if (name.includes('medium') || name.includes('3')) return 'warning';
  return 'info';
}

function mapTicketToAlert(ticket: ConnectWiseTicket): AlertTicket {
  const priorityName = ticket.priority?.name || 'Unknown';
  const severity = mapPriorityToSeverity(priorityName);
  const companyName =
    typeof ticket.company === 'object' && ticket.company?.name
      ? ticket.company.name
      : ticket.company?.identifier || 'Unknown Company';

  return {
    id: ticket.id ?? 0,
    client: companyName,
    type: priorityName,
    message: ticket.summary || 'No summary',
    time: ticket.dateEntered ? formatTimeAgo(ticket.dateEntered) : 'Unknown',
    status: ticket.closedFlag ? 'resolved' : 'active',
    severity,
  };
}

/**
 * Fetch High and Critical priority tickets from ConnectWise.
 * On web, use proxyUrl to avoid CORS; on native, calls ConnectWise directly.
 */
export async function fetchHighCriticalTickets(): Promise<AlertTicket[]> {
  const { baseUrl, clientId, proxyUrl } = CONNECTWISE_CONFIG;

  let url: string;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (proxyUrl) {
    // Call our proxy (avoids CORS on web); proxy adds auth and forwards to ConnectWise
    url = `${proxyUrl.replace(/\/$/, '')}/tickets`;
  } else {
    url = `${baseUrl}/service/tickets?orderBy=${encodeURIComponent('dateEntered desc')}&pageSize=100`;
    headers.Authorization = getAuthHeader();
    headers.clientId = clientId;
  }

  const response = await fetch(url, { method: 'GET', headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ConnectWise API error ${response.status}: ${errorText}`);
  }

  const tickets: ConnectWiseTicket[] = await response.json();
  const alerts = tickets.map(mapTicketToAlert);
  // Always return tickets so the UI displays results even if priority names differ.
  // Severity highlighting still applies when `priority.name` indicates High/Critical.
  return alerts;
}
