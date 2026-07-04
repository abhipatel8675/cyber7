const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  fetchTicketsFromConnectWise,
  resolveTicketInConnectWise,
  fetchTicketDetail,
  fetchTicketNotes,
  addTicketNoteInConnectWise,
  updateTicketFieldsInConnectWise,
  fetchBoardSubTypes,
  fetchBoardStatuses,
  fetchServicePriorities,
} = require('../lib/connectwise');

const TICKET_STATUSES = [
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
];

const TICKET_SUBTYPES = [
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
];
const AlertState = require('../models/AlertState');
const {
  isDemoUser,
  isDemoAlertId,
  getDemoAlerts,
  getDemoDetail,
} = require('../lib/demoAlerts');

const router = express.Router();

/** Apply local acknowledged/resolved overrides to a list of alerts. */
async function applyLocalState(alerts) {
  const ticketIds = alerts.map((a) => a.id);
  const states = await AlertState.find({ ticketId: { $in: ticketIds } }).lean();
  const stateMap = {};
  for (const s of states) stateMap[s.ticketId] = s.state;
  return alerts.map((alert) => {
    const localState = stateMap[alert.id];
    if (localState === 'acknowledged' && alert.status === 'active') {
      return { ...alert, status: 'acknowledged' };
    }
    if (localState === 'resolved') return { ...alert, status: 'resolved' };
    return alert;
  });
}

/**
 * Enforce per-company isolation on a single ticket.
 * Admin: always allowed. User: ticket's company.identifier must match user.companyId.
 * Returns the fetched ticket (so callers can reuse) or sends 403/404 and returns null.
 */
async function assertTicketAccess(req, res, ticketId) {
  let ticket;
  try {
    ticket = await fetchTicketDetail(ticketId);
  } catch (err) {
    res.status(404).json({ error: 'Ticket not found' });
    return null;
  }
  if (req.user.role === 'admin') return ticket;
  const tIdent = String(ticket.company?.identifier || '').toLowerCase();
  const uIdent = String(req.user.companyId || '').toLowerCase();
  if (!uIdent || !tIdent || tIdent !== uIdent) {
    res.status(403).json({ error: 'Forbidden: ticket not in your company' });
    return null;
  }
  return ticket;
}

// GET /alerts/test – returns fake alerts for UI testing (no ConnectWise needed)
// Usage: hit GET /alerts/test while logged in to see sample critical/high alerts
router.get('/test', authMiddleware, (req, res) => {
  res.json([
    {
      id: 9001,
      client: 'Acme Corp',
      companyIdentifier: 'acme',
      type: 'Priority 1 - Critical',
      message: '[TEST] Server CPU at 99% — immediate action required',
      time: 'Just now',
      status: 'active',
      severity: 'critical',
    },
    {
      id: 9002,
      client: 'Tech Solutions',
      companyIdentifier: 'techsolutions',
      type: 'Priority 2 - High',
      message: '[TEST] Firewall rule violation detected on network segment B',
      time: '3 min ago',
      status: 'active',
      severity: 'high',
    },
    {
      id: 9003,
      client: 'Acme Corp',
      companyIdentifier: 'acme',
      type: 'Priority 1 - Critical',
      message: '[TEST] Database connection pool exhausted — services degraded',
      time: '10 min ago',
      status: 'acknowledged',
      severity: 'critical',
    },
    {
      id: 9004,
      client: 'StartUp LLC',
      companyIdentifier: 'startupllc',
      type: 'Priority 2 - High',
      message: '[TEST] SSL certificate expiring in 3 days',
      time: '1 hour ago',
      status: 'resolved',
      severity: 'high',
    },
  ]);
});

// GET /alerts – requires auth. Admin: all alerts; User: only their company's alerts.
// Merges ConnectWise tickets with local state (acknowledged / resolved).
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Demo/App Review account: serve sample data, never touch ConnectWise.
    if (isDemoUser(req.user)) {
      const demo = await applyLocalState(getDemoAlerts());
      return res.json(demo);
    }

    let alerts = await fetchTicketsFromConnectWise();

    // Only surface high-priority alerts — filter out medium (warning) and info
    alerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high');

    const { role, companyId } = req.user;

    if (role === 'user' && companyId) {
      const normalized = String(companyId).trim().toLowerCase();
      alerts = alerts.filter(
        (a) => a.companyIdentifier && a.companyIdentifier === normalized
      );
    }

    alerts = await applyLocalState(alerts);

    res.json(alerts);
  } catch (err) {
    console.error('Alerts fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load alerts' });
  }
});

// GET /alerts/:id/subtypes – fetch live subtypes from CW for this ticket's board
router.get('/:id/statuses', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

    // Demo/App Review account: return the static list, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      return res.json({ statuses: [...TICKET_STATUSES].sort() });
    }

    const ticket = await assertTicketAccess(req, res, ticketId);
    if (!ticket) return;

    const boardId = ticket.board?.id;
    if (!boardId) return res.status(404).json({ error: 'Ticket has no board' });

    const raw = await fetchBoardStatuses(boardId);
    const statuses = (Array.isArray(raw) ? raw : [])
      .map((s) => s.name)
      .filter(Boolean)
      .sort();

    res.json({ statuses });
  } catch (err) {
    console.error('Statuses fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load statuses' });
  }
});

router.get('/:id/subtypes', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

    // Demo/App Review account: return the static list, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      return res.json({ subtypes: [...TICKET_SUBTYPES].sort() });
    }

    const ticket = await assertTicketAccess(req, res, ticketId);
    if (!ticket) return;

    const boardId = ticket.board?.id;
    if (!boardId) return res.status(404).json({ error: 'Ticket has no board' });

    const raw = await fetchBoardSubTypes(boardId);
    const subtypes = (Array.isArray(raw) ? raw : [])
      .map((s) => s.name)
      .filter(Boolean)
      .sort();

    res.json({ subtypes });
  } catch (err) {
    console.error('Subtypes fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load subtypes' });
  }
});

// GET /alerts/:id – full ticket detail (company, ticket fields, notes)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

    // Demo/App Review account: serve sample detail, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      const detail = getDemoDetail(ticketId);
      if (!detail) return res.status(404).json({ error: 'Ticket not found' });
      const localState = await AlertState.findOne({ ticketId }).lean();
      if (localState?.state === 'resolved') detail.status = 'resolved';
      else if (localState?.state === 'acknowledged' && detail.status === 'active') {
        detail.status = 'acknowledged';
      }
      return res.json(detail);
    }

    const ticket = await assertTicketAccess(req, res, ticketId);
    if (!ticket) return; // response already sent
    const notes = await fetchTicketNotes(ticketId);

    // Build company block
    const company = {
      name: ticket.company?.name || '',
      identifier: ticket.company?.identifier || '',
      contact: ticket.contact?.name || '',
      email: ticket.contactEmailAddress || '',
      site: ticket.site?.name || '',
      addressLine1: ticket.addressLine1 || '',
      addressLine2: ticket.addressLine2 || '',
      city: ticket.city || '',
      state: ticket.stateIdentifier || '',
      zip: ticket.zip || '',
      country: ticket.country?.name || '',
    };

    // Build ticket block
    const ticketDetail = {
      board: ticket.board?.name || '',
      status: ticket.status?.name || '',
      type: ticket.type?.name || '',
      subType: ticket.subType?.name || '',
      item: ticket.item?.name || '',
      owner: ticket.owner?.name || '',
      sla: ticket.sla?.name || '',
      agreement: ticket.agreement?.name || '',
      priority: ticket.priority?.name || '',
      priorityId: ticket.priority?.id || null,
      impact: ticket.impact || '',
      urgency: ticket.urgency || '',
      estimatedStartDate: ticket.estimatedStartDate || '',
      requiredDate: ticket.requiredDate || '',
      slaStatus: ticket.slaStatus || '',
      budgetHours: ticket.budgetHours || 0,
      actualHours: ticket.actualHours || 0,
      enteredBy: ticket.enteredBy || '',
      enteredDate: ticket.dateEntered || '',
      assignedBy: ticket.assignedBy || '',
    };

    // Build notes array
    const mappedNotes = (Array.isArray(notes) ? notes : []).map((n) => ({
      id: n.id,
      text: n.text || '',
      noteType: n.noteType || 'Discussion',
      member: n.member?.name || n.createdBy || '',
      dateCreated: n.dateCreated || n.lastUpdated || '',
      detailDescriptionFlag: n.detailDescriptionFlag || false,
      internalAnalysisFlag: n.internalAnalysisFlag || false,
      resolutionFlag: n.resolutionFlag || false,
    }));

    // Merge local status
    const localState = await AlertState.findOne({ ticketId }).lean();
    const severity = (() => {
      const p = (ticket.priority?.name || '').toLowerCase();
      if (p.includes('critical') || p.includes('1')) return 'critical';
      if (p.includes('high') || p.includes('2')) return 'high';
      if (p.includes('medium') || p.includes('3')) return 'warning';
      return 'info';
    })();
    const baseStatus = ticket.closedFlag ? 'resolved' : 'active';
    const status = localState?.state === 'resolved'
      ? 'resolved'
      : localState?.state === 'acknowledged' && baseStatus === 'active'
        ? 'acknowledged'
        : baseStatus;

    res.json({
      id: ticket.id,
      summary: ticket.summary || '',
      severity,
      status,
      time: ticket.dateEntered,
      company,
      ticket: ticketDetail,
      notes: mappedNotes,
    });
  } catch (err) {
    console.error('Alert detail fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load alert detail' });
  }
});

// PATCH /alerts/:id/status – acknowledge or resolve an alert
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { action } = req.body; // 'acknowledge' | 'resolve'
    const userId = req.user._id.toString();

    if (!action || !['acknowledge', 'resolve'].includes(action)) {
      return res.status(400).json({ error: 'Action must be acknowledge or resolve' });
    }

    // Demo/App Review account: persist state locally only, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      const state = action === 'acknowledge' ? 'acknowledged' : 'resolved';
      await AlertState.findOneAndUpdate(
        { ticketId },
        { state, updatedBy: req.user._id.toString() },
        { upsert: true, new: true }
      );
      return res.json({ success: true, ticketId, status: state });
    }

    if (!(await assertTicketAccess(req, res, ticketId))) return;

    const state = action === 'acknowledge' ? 'acknowledged' : 'resolved';

    await AlertState.findOneAndUpdate(
      { ticketId },
      { state, updatedBy: userId },
      { upsert: true, new: true }
    );

    // For resolve, also close in ConnectWise — fail loudly if CW rejects
    if (action === 'resolve') {
      try {
        await resolveTicketInConnectWise(ticketId);
      } catch (cwErr) {
        console.error('ConnectWise resolve failed:', cwErr.message);
        // Roll back local state so app + CW stay consistent
        await AlertState.findOneAndUpdate(
          { ticketId },
          { state: 'acknowledged', updatedBy: userId },
          { upsert: true, new: true }
        );
        return res
          .status(502)
          .json({ error: `Could not close ticket in ConnectWise: ${cwErr.message}` });
      }
    }

    res.json({ success: true, ticketId, status: state });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// POST /alerts/:id/notes – add a note to a ticket (synced to ConnectWise)
router.post('/:id/notes', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

    const { text, type } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Note text is required' });
    }
    const noteType = ['Discussion', 'Internal', 'Resolution'].includes(type) ? type : 'Discussion';

    // Demo/App Review account: echo the note back, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      return res.json({
        id: Date.now(),
        text: text.trim(),
        noteType,
        member: req.user.name || req.user.email || '',
        dateCreated: new Date().toISOString(),
        detailDescriptionFlag: noteType === 'Discussion',
        internalAnalysisFlag: noteType === 'Internal',
        resolutionFlag: noteType === 'Resolution',
      });
    }

    if (!(await assertTicketAccess(req, res, ticketId))) return;

    const created = await addTicketNoteInConnectWise(ticketId, { text: text.trim(), type: noteType });

    res.json({
      id: created.id,
      text: created.text || text,
      noteType,
      member: req.user.name || req.user.email || created.member?.name || created.createdBy || '',
      dateCreated: created.dateCreated || created.lastUpdated || new Date().toISOString(),
      detailDescriptionFlag: !!created.detailDescriptionFlag,
      internalAnalysisFlag: !!created.internalAnalysisFlag,
      resolutionFlag: !!created.resolutionFlag,
    });
  } catch (err) {
    console.error('Add note error:', err);
    res.status(500).json({ error: err.message || 'Failed to add note' });
  }
});

// PATCH /alerts/:id/ticket – update CW ticket fields (status, subType, priority)
router.patch('/:id/ticket', authMiddleware, async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) return res.status(400).json({ error: 'Invalid ticket ID' });

    const { status, subType, priority, priorityId } = req.body || {};
    const patches = {};

    if (status !== undefined) {
      if (typeof status !== 'string' || !status.trim()) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      patches.status = status;
    }
    if (subType !== undefined) {
      patches.subType = subType;
    }
    if (priority !== undefined) {
      if (typeof priority !== 'string' || !priority.trim()) {
        return res.status(400).json({ error: 'Invalid priority' });
      }
      patches.priority = priority;
      if (priorityId) patches.priorityId = priorityId;
    }
    if (!Object.keys(patches).length) {
      return res.status(400).json({ error: 'No fields provided' });
    }

    // Demo/App Review account: apply locally only, never touch ConnectWise.
    if (isDemoUser(req.user) && isDemoAlertId(ticketId)) {
      if (status === 'Closed') {
        await AlertState.findOneAndUpdate(
          { ticketId },
          { state: 'resolved', updatedBy: req.user._id.toString() },
          { upsert: true, new: true }
        );
      }
      return res.json({ success: true, ticketId, ...patches });
    }

    if (!(await assertTicketAccess(req, res, ticketId))) return;

    await updateTicketFieldsInConnectWise(ticketId, patches);

    // Mirror Closed → local resolved state so the alerts list filter stays consistent
    if (status === 'Closed') {
      const userId = req.user._id.toString();
      await AlertState.findOneAndUpdate(
        { ticketId },
        { state: 'resolved', updatedBy: userId },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, ticketId, ...patches });
  } catch (err) {
    console.error('Ticket update error:', err);
    res.status(500).json({ error: err.message || 'Failed to update ticket' });
  }
});

// GET /alerts/meta/options – returns dropdown lists for statuses + subtypes
router.get('/meta/options', authMiddleware, (req, res) => {
  res.json({ statuses: TICKET_STATUSES, subTypes: TICKET_SUBTYPES });
});

// GET /alerts/meta/priorities – fetch live priority list from CW
router.get('/meta/priorities', authMiddleware, async (req, res) => {
  try {
    const raw = await fetchServicePriorities();
    const priorities = (Array.isArray(raw) ? raw : [])
      .filter((p) => p.name)
      .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99))
      .map((p) => ({ id: p.id, name: p.name }));
    res.json({ priorities });
  } catch (err) {
    console.error('Priorities fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to load priorities' });
  }
});

module.exports = router;
