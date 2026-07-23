import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchAlertDetail,
  fetchTicketSubtypes,
  fetchTicketStatuses,
  fetchTicketPriorities,
  updateAlertStatus,
  addAlertNote,
  updateTicketFields,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  type AlertDetail,
  type TicketNote,
  type AlertStatus,
  type NoteType,
  type PriorityOption,
} from '../../services/api';

const POLL_INTERVAL_MS = 30000;
const PRIORITY_RED = '#dc3545';
const PRIORITY_ORANGE = '#ff9500';

type NoteFilter = 'All' | 'Discussion' | 'Internal' | 'Resolution';

interface Props {
  ticketId: number;
  onBack: () => void;
  onStatusChange: (id: number, status: AlertStatus) => void;
}

const AlertDetailScreen: React.FC<Props> = ({ ticketId, onBack, onStatusChange }) => {
  const { theme } = useTheme();
  const { token, logout } = useAuth();
  const [detail, setDetail] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteFilter, setNoteFilter] = useState<NoteFilter>('All');
  const [updating, setUpdating] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteType, setNewNoteType] = useState<NoteType>('Discussion');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);
  const [alertStatusPickerOpen, setAlertStatusPickerOpen] = useState(false);
  const [subTypePickerOpen, setSubTypePickerOpen] = useState(false);
  const [priorityPickerOpen, setPriorityPickerOpen] = useState(false);
  const [savingField, setSavingField] = useState<null | 'status' | 'subType' | 'priority'>(null);
  const [dynamicSubtypes, setDynamicSubtypes] = useState<string[]>([]);
  const [dynamicStatuses, setDynamicStatuses] = useState<string[]>([]);
  const [dynamicPriorities, setDynamicPriorities] = useState<PriorityOption[]>([]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!token) return;
    if (!opts?.silent) setLoading(true);
    setError(null);
    try {
      const data = await fetchAlertDetail(token, ticketId);
      setDetail(data);
      if (!opts?.silent) {
        fetchTicketSubtypes(token, ticketId)
          .then((subs) => { if (subs.length) setDynamicSubtypes(subs); })
          .catch(() => {});
        fetchTicketStatuses(token, ticketId)
          .then((sts) => { if (sts.length) setDynamicStatuses(sts); })
          .catch(() => {});
        fetchTicketPriorities(token)
          .then((pris) => { if (pris.length) setDynamicPriorities(pris); })
          .catch(() => {});
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load';
      if (msg === 'Unauthorized') logout();
      if (!opts?.silent) setError(msg);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [token, ticketId, logout]);

  useEffect(() => { load(); }, [load]);

  // Poll CW for outside changes (status/subtype updated in ConnectWise web UI, etc.)
  useEffect(() => {
    const id = setInterval(() => load({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const handleFieldChange = async (field: 'status' | 'subType' | 'priority', value: string, selectedPriorityId?: number) => {
    if (!token || !detail) return;
    if (field === 'status' && value === detail.ticket.status) return;
    if (field === 'subType' && value === detail.ticket.subType) return;
    if (field === 'priority' && value === detail.ticket.priority) return;

    setSavingField(field);
    const prevTicket = detail.ticket;
    setDetail((d) => (d ? { ...d, ticket: { ...d.ticket, [field]: value } } : d));
    try {
      const extraFields = field === 'priority' && selectedPriorityId ? { priorityId: selectedPriorityId } : {};
      await updateTicketFields(token, ticketId, { [field]: value, ...extraFields });
      if (field === 'status' && value === 'Closed') {
        setDetail((d) => (d ? { ...d, status: 'resolved' } : d));
        onStatusChange(ticketId, 'resolved');
      }
    } catch (err) {
      setDetail((d) => (d ? { ...d, ticket: prevTicket } : d));
      const msg = err instanceof Error ? err.message : 'Failed to update';
      if (msg === 'Unauthorized') logout();
      else Alert.alert('Update failed', msg);
    } finally {
      setSavingField(null);
    }
  };

  const handleAddNote = async () => {
    if (!token || !detail) return;
    const text = newNoteText.trim();
    if (!text) return;
    setSubmittingNote(true);
    try {
      const created = await addAlertNote(token, ticketId, text, newNoteType);
      setDetail((d) => (d ? { ...d, notes: [...d.notes, created] } : d));
      setNewNoteText('');
      setNewNoteType('Discussion');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add note';
      if (msg === 'Unauthorized') logout();
      else Alert.alert('Add note failed', msg);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAction = async (action: 'acknowledge' | 'resolve') => {
    if (!token || !detail) return;
    setUpdating(true);
    const newStatus: AlertStatus = action === 'acknowledge' ? 'acknowledged' : 'resolved';
    try {
      await updateAlertStatus(token, ticketId, action);
      setDetail((d) => d ? { ...d, status: newStatus } : d);
      onStatusChange(ticketId, newStatus);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed';
      if (msg === 'Unauthorized') logout();
      else Alert.alert('Update failed', msg);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityColor = (s: string) => {
    if (s === 'critical') return PRIORITY_RED;
    if (s === 'high') return PRIORITY_ORANGE;
    if (s === 'warning') return theme.colors.warning;
    return theme.colors.success;
  };

  const getPriorityColor = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('critical') || p.includes('1')) return PRIORITY_RED;
    if (p.includes('high') || p.includes('2')) return PRIORITY_ORANGE;
    if (p.includes('medium') || p.includes('3')) return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  const getStatusColor = (s: string) => {
    if (s === 'active') return theme.colors.error;
    if (s === 'acknowledged') return theme.colors.warning;
    return theme.colors.success;
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const getNoteLabel = (note: TicketNote): string | null => {
    if (note.resolutionFlag) return 'Resolution';
    if (note.internalAnalysisFlag) return 'Internal';
    if (note.detailDescriptionFlag) return 'Description';
    return null;
  };

  const getNoteColor = (note: TicketNote) => {
    if (note.resolutionFlag) return '#34C759';
    if (note.internalAnalysisFlag) return '#4A90E2';
    return theme.colors.textSecondary;
  };

  const filteredNotes = (detail?.notes ?? []).filter((n) => {
    if (noteFilter === 'All') return true;
    if (noteFilter === 'Resolution') return n.resolutionFlag;
    if (noteFilter === 'Internal') return n.internalAnalysisFlag;
    if (noteFilter === 'Discussion') return !n.resolutionFlag && !n.internalAnalysisFlag;
    return true;
  });

  const countFor = (f: NoteFilter) => {
    if (!detail) return 0;
    if (f === 'All') return detail.notes.length;
    if (f === 'Resolution') return detail.notes.filter((n) => n.resolutionFlag).length;
    if (f === 'Internal') return detail.notes.filter((n) => n.internalAnalysisFlag).length;
    return detail.notes.filter((n) => !n.resolutionFlag && !n.internalAnalysisFlag).length;
  };

  const initialDescription = detail?.notes.find((n) => n.detailDescriptionFlag) ?? null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {detail ? `Ticket #${detail.id}` : 'Alert Detail'}
        </Text>
        <TouchableOpacity onPress={() => load()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="refresh" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading ticket...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : detail ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={80}
        >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Summary Banner */}
          <View style={[styles.summaryBanner, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.summaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Summary</Text>
                <Text style={[styles.summaryText, { color: theme.colors.text }]}>{detail.summary}</Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: getSeverityColor(detail.severity) }]}>
                <Text style={styles.badgeText}>{detail.severity.toUpperCase()}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: getStatusColor(detail.status), marginLeft: 8 }]}>
                <Text style={styles.badgeText}>{detail.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Key Info */}
          <View style={[styles.keyInfoCard, { backgroundColor: theme.colors.surface }]}>
            <KeyRow label="Company" value={detail.company.name} theme={theme} />
            <KeyRow label="Country" value={detail.company.country} theme={theme} />
            <KeyRow label="Ticket #" value={String(detail.id)} theme={theme} />
            <KeyDropdownRow
              label="Status"
              value={detail.ticket.status || '—'}
              busy={savingField === 'status' || dynamicStatuses.length === 0}
              onPress={() => dynamicStatuses.length > 0 && setStatusPickerOpen(true)}
              theme={theme}
            />
            <KeyDropdownRow
              label="Priority"
              value={detail.ticket.priority || '—'}
              busy={savingField === 'priority'}
              onPress={() => setPriorityPickerOpen(true)}
              theme={theme}
              valueColor={getPriorityColor(detail.ticket.priority)}
            />
            <KeyRow label="Ticket Owner" value={detail.ticket.owner} theme={theme} />
            <KeyDropdownRow
              label="Subtype"
              value={detail.ticket.subType || '—'}
              busy={savingField === 'subType'}
              onPress={() => setSubTypePickerOpen(true)}
              theme={theme}
            />
          </View>

          {/* Action Buttons */}
          <View style={[styles.keyInfoCard, { backgroundColor: theme.colors.surface }]}>
            <KeyDropdownRow
              label="Alert Status"
              value={detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
              busy={updating}
              onPress={() => !updating && setAlertStatusPickerOpen(true)}
              theme={theme}
              valueColor={detail.status === 'active' ? theme.colors.danger : detail.status === 'acknowledged' ? theme.colors.warning : theme.colors.success}
            />
          </View>

          {/* Company Details */}
          <Section title={`Company: ${detail.company.name}`} theme={theme}>
            <FieldGrid fields={[
              { label: 'Company', value: detail.company.name },
              { label: 'Site', value: detail.company.site },
              { label: 'Contact', value: detail.company.contact },
              { label: 'Address 1', value: detail.company.addressLine1 },
              { label: 'Email', value: detail.company.email },
              { label: 'Address 2', value: detail.company.addressLine2 },
              { label: 'Identifier', value: detail.company.identifier },
              { label: 'Suburb/Locality', value: detail.company.city },
              { label: 'State', value: detail.company.state },
              { label: 'Postcode', value: detail.company.zip },
              { label: 'Country', value: detail.company.country },
            ]} theme={theme} />
          </Section>

          {/* Ticket Details */}
          <Section title={`Ticket #${detail.id}`} theme={theme}>
            <FieldGrid fields={[
              { label: 'Board', value: detail.ticket.board },
              { label: 'SLA', value: detail.ticket.sla },
              { label: 'Status', value: detail.ticket.status },
              { label: 'Agreement', value: detail.ticket.agreement },
              { label: 'Type', value: detail.ticket.type },
              { label: 'Priority', value: detail.ticket.priority },
              { label: 'Subtype', value: detail.ticket.subType },
              { label: 'Impact/Urgency', value: [detail.ticket.impact, detail.ticket.urgency].filter(Boolean).join('/') },
              { label: 'Item', value: detail.ticket.item },
              { label: 'SLA Status', value: detail.ticket.slaStatus },
              { label: 'Owner', value: detail.ticket.owner },
              { label: 'Est. Start', value: detail.ticket.estimatedStartDate ? formatDate(detail.ticket.estimatedStartDate) : '' },
              { label: 'Due Date', value: detail.ticket.requiredDate ? formatDate(detail.ticket.requiredDate) : '' },
              { label: 'Entered By', value: detail.ticket.enteredBy },
              { label: 'Entered Date', value: detail.ticket.enteredDate ? formatDate(detail.ticket.enteredDate) : '' },
              { label: 'Assigned By', value: detail.ticket.assignedBy },
            ]} theme={theme} />
          </Section>

          {/* Time Budget */}
          {(detail.ticket.budgetHours > 0 || detail.ticket.actualHours > 0) && (
            <Section title="Time Budget Analysis" theme={theme}>
              <FieldGrid fields={[
                { label: 'Budget Hours', value: String(detail.ticket.budgetHours) },
                { label: 'Actual Hours', value: String(detail.ticket.actualHours) },
                { label: 'Remaining Hours', value: String(detail.ticket.budgetHours - detail.ticket.actualHours) },
              ]} theme={theme} />
            </Section>
          )}

          {/* Initial Description */}
          {initialDescription && (
            <Section title="Initial Description" theme={theme} titleColor="#4A90E2">
              <NoteCard note={initialDescription} theme={theme} formatDate={formatDate} getNoteLabel={getNoteLabel} getNoteColor={getNoteColor} />
            </Section>
          )}

          {/* Notes */}
          <Section title="Notes" theme={theme}>
            {/* Add Note input */}
            <View style={[styles.addNoteBox, { borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.noteInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                placeholder="Add a note..."
                placeholderTextColor={theme.colors.textSecondary}
                value={newNoteText}
                onChangeText={setNewNoteText}
                multiline
                editable={!submittingNote}
              />
              <View style={styles.noteTypeRow}>
                {(['Discussion', 'Internal', 'Resolution'] as NoteType[]).map((t) => {
                  const active = newNoteType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setNewNoteType(t)}
                      style={[
                        styles.noteTypeChip,
                        {
                          borderColor: active ? '#4A90E2' : theme.colors.border,
                          backgroundColor: active ? '#4A90E2' + '22' : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.noteTypeChipText, { color: active ? '#4A90E2' : theme.colors.textSecondary }]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  backgroundColor: '#4A90E2',
                  paddingVertical: 10,
                  borderRadius: 8,
                  opacity: !newNoteText.trim() || submittingNote ? 0.4 : 1,
                }}
                onPress={handleAddNote}
                disabled={!newNoteText.trim() || submittingNote}
              >
                {submittingNote ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={15} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Note</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Note filter tabs */}
            {detail.notes.length > 0 && (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={styles.noteTabRow}>
                    {(['All', 'Discussion', 'Internal', 'Resolution'] as NoteFilter[]).map((f) => {
                      const count = countFor(f);
                      const active = noteFilter === f;
                      return (
                        <TouchableOpacity
                          key={f}
                          onPress={() => setNoteFilter(f)}
                          style={styles.noteTab}
                        >
                          <Text style={[
                            styles.noteTabText,
                            { color: active ? '#4A90E2' : theme.colors.textSecondary },
                            active && styles.noteTabTextActive,
                          ]}>
                            {f} {count}
                          </Text>
                          {active && <View style={[styles.noteTabUnderline, { backgroundColor: '#4A90E2' }]} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    theme={theme}
                    formatDate={formatDate}
                    getNoteLabel={getNoteLabel}
                    getNoteColor={getNoteColor}
                  />
                ))}
              </>
            )}
          </Section>
        </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      <PickerModal
        visible={alertStatusPickerOpen}
        title="Alert Status"
        options={detail?.status === 'active' ? ['Active', 'Acknowledged', 'Resolved'] : ['Acknowledged', 'Resolved']}
        selected={detail ? detail.status.charAt(0).toUpperCase() + detail.status.slice(1) : ''}
        onSelect={(v) => {
          setAlertStatusPickerOpen(false);
          const lower = v.toLowerCase() as AlertStatus;
          if (lower !== detail?.status) {
            const action = lower === 'acknowledged' ? 'acknowledge' : 'resolve';
            handleAction(action);
          }
        }}
        onClose={() => setAlertStatusPickerOpen(false)}
        theme={theme}
      />
      <PickerModal
        visible={statusPickerOpen}
        title="Status"
        options={dynamicStatuses}
        selected={detail?.ticket.status || ''}
        onSelect={(v) => { setStatusPickerOpen(false); handleFieldChange('status', v); }}
        onClose={() => setStatusPickerOpen(false)}
        theme={theme}
      />
      <PickerModal
        visible={subTypePickerOpen}
        title="Subtype"
        options={dynamicSubtypes.length ? dynamicSubtypes : []}
        selected={detail?.ticket.subType || ''}
        onSelect={(v) => { setSubTypePickerOpen(false); handleFieldChange('subType', v); }}
        onClose={() => setSubTypePickerOpen(false)}
        theme={theme}
      />
      <PickerModal
        visible={priorityPickerOpen}
        title="Priority"
        options={dynamicPriorities.length ? dynamicPriorities.map((p) => p.name) : (TICKET_PRIORITIES as readonly string[])}
        selected={detail?.ticket.priority || ''}
        onSelect={(v) => {
          setPriorityPickerOpen(false);
          const match = dynamicPriorities.find((p) => p.name === v);
          handleFieldChange('priority', v, match?.id);
        }}
        onClose={() => setPriorityPickerOpen(false)}
        theme={theme}
      />
    </SafeAreaView>
  );
};

const KeyRow: React.FC<{
  label: string;
  value: string;
  theme: any;
  valueColor?: string;
  valueBold?: boolean;
}> = ({ label, value, theme, valueColor, valueBold }) => (
  <View style={[styles.keyRow, { borderBottomColor: theme.colors.border }]}>
    <Text style={[styles.keyLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    <Text
      style={[
        styles.keyValue,
        { color: valueColor || theme.colors.text },
        valueBold && { fontWeight: '700' },
      ]}
      numberOfLines={2}
    >
      {value || '—'}
    </Text>
  </View>
);

const KeyDropdownRow: React.FC<{
  label: string;
  value: string;
  busy: boolean;
  onPress: () => void;
  theme: any;
  valueColor?: string;
}> = ({ label, value, busy, onPress, theme, valueColor }) => (
  <TouchableOpacity
    style={[styles.keyRow, { borderBottomColor: theme.colors.border }]}
    onPress={onPress}
    disabled={busy}
    activeOpacity={0.7}
  >
    <Text style={[styles.keyLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    <View style={styles.keyDropdownRight}>
      <Text style={[styles.keyValue, { color: valueColor || theme.colors.text, fontWeight: valueColor ? '700' : '500' }]} numberOfLines={1}>
        {value || '—'}
      </Text>
      {busy ? (
        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginLeft: 6 }} />
      ) : (
        <MaterialIcons name="arrow-drop-down" size={22} color={theme.colors.textSecondary} />
      )}
    </View>
  </TouchableOpacity>
);

const PickerModal: React.FC<{
  visible: boolean;
  title: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  theme: any;
}> = ({ visible, title, options, selected, onSelect, onClose, theme }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <Pressable
        style={[styles.modalSheet, { backgroundColor: theme.colors.surface }]}
        onPress={(e) => e.stopPropagation()}
      >
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ maxHeight: 420 }}>
          {options.map((opt) => {
            const active = opt === selected;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.modalOption, { borderBottomColor: theme.colors.border }]}
                onPress={() => onSelect(opt)}
              >
                <Text style={[styles.modalOptionText, { color: theme.colors.text }, active && { fontWeight: '700', color: '#4A90E2' }]}>
                  {opt}
                </Text>
                {active && <MaterialIcons name="check" size={18} color="#4A90E2" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

/* ── Helpers ────────────────────────────────────────────────────────────── */

const Section: React.FC<{
  title: string;
  theme: any;
  titleColor?: string;
  children: React.ReactNode;
}> = ({ title, theme, titleColor, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen((v) => !v)}>
        <Text style={[styles.sectionTitle, { color: titleColor ?? theme.colors.text }]}>{title}</Text>
        <MaterialIcons
          name={open ? 'expand-less' : 'expand-more'}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

const FieldGrid: React.FC<{ fields: { label: string; value: string }[]; theme: any }> = ({ fields, theme }) => (
  <View style={styles.grid}>
    {fields.map(({ label, value }) => (
      <View key={label} style={styles.gridCell}>
        <Text style={[styles.gridLabel, { color: theme.colors.textSecondary }]}>{label}:</Text>
        <Text style={[styles.gridValue, { color: theme.colors.text }]}>{value || '—'}</Text>
      </View>
    ))}
  </View>
);

const NoteCard: React.FC<{
  note: TicketNote;
  theme: any;
  formatDate: (d: string) => string;
  getNoteLabel: (n: TicketNote) => string | null;
  getNoteColor: (n: TicketNote) => string;
}> = ({ note, theme, formatDate, getNoteLabel, getNoteColor }) => {
  const label = getNoteLabel(note);
  const color = getNoteColor(note);
  const initials = note.member
    ? note.member.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[styles.noteCard, { borderTopColor: theme.colors.border }]}>
      <View style={styles.noteHeader}>
        <View style={styles.noteLeft}>
          {label && (
            <View style={[styles.noteLabel, { backgroundColor: color + '22', borderColor: color }]}>
              {label === 'Resolution' && <MaterialIcons name="check" size={10} color={color} />}
              <Text style={[styles.noteLabelText, { color }]}>{label}</Text>
            </View>
          )}
        </View>
        <View style={styles.noteRight}>
          <View style={{ alignItems: 'flex-end', marginRight: 8 }}>
            <Text style={[styles.noteMember, { color: theme.colors.text }]}>{note.member || 'Unknown'}</Text>
            <Text style={[styles.noteDate, { color: theme.colors.textSecondary }]}>{formatDate(note.dateCreated)}</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: '#8BC34A' }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.noteText, { color: theme.colors.text }]}>{note.text || '(empty)'}</Text>
    </View>
  );
};

/* ── Styles ─────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 2 },
  topBarTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { marginTop: 12, fontSize: 15, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  scroll: { padding: 12, paddingBottom: 40, gap: 10 },

  // Summary
  summaryBanner: { borderRadius: 10, padding: 14 },
  summaryRow: { marginBottom: 10 },
  summaryLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  summaryText: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  badgeRow: { flexDirection: 'row' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  // Key info card
  keyInfoCard: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  keyLabel: { fontSize: 13, fontWeight: '500', flexShrink: 0 },
  keyValue: { fontSize: 14, fontWeight: '500', flex: 1, textAlign: 'right' },
  keyDropdownRight: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },

  // Picker modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  modalSheet: { borderRadius: 12, overflow: 'hidden' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalOptionText: { fontSize: 15 },

  // Action bar
  actionBar: { flexDirection: 'row', gap: 10, borderRadius: 10, padding: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: '600' },

  // Section
  section: { borderRadius: 10, overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14 },

  // Field grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridCell: { width: '50%', paddingVertical: 5, paddingRight: 8 },
  gridLabel: { fontSize: 11, fontWeight: '500', marginBottom: 1 },
  gridValue: { fontSize: 13, fontWeight: '400' },

  // Note tabs
  noteTabRow: { flexDirection: 'row', gap: 4 },
  noteTab: { paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center' },
  noteTabText: { fontSize: 13, fontWeight: '500' },
  noteTabTextActive: { fontWeight: '700' },
  noteTabUnderline: { height: 2, width: '100%', borderRadius: 1, marginTop: 2 },

  // Add note box
  addNoteBox: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: 10, marginBottom: 12, gap: 8 },
  noteInput: {
    minHeight: 60, maxHeight: 140, borderWidth: StyleSheet.hairlineWidth, borderRadius: 6,
    padding: 8, fontSize: 14, textAlignVertical: 'top',
  },
  addNoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  noteTypeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  noteTypePicker: { flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' },
  noteTypeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  noteTypeChipText: { fontSize: 12, fontWeight: '600' },
  submitNoteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6,
  },
  submitNoteText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Note card
  noteCard: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  noteLeft: { flexDirection: 'row', gap: 6 },
  noteRight: { flexDirection: 'row', alignItems: 'center' },
  noteLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1,
  },
  noteLabelText: { fontSize: 11, fontWeight: '600' },
  noteMember: { fontSize: 12, fontWeight: '600' },
  noteDate: { fontSize: 11 },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  noteText: { fontSize: 14, lineHeight: 20 },
});

export default AlertDetailScreen;
