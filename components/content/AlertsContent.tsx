import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import {
  fetchAlerts,
  updateAlertStatus,
  type AlertTicket,
  type AlertStatus,
} from '../../services/api';

const REFRESH_INTERVAL_MS = 60000;

type FilterTab = 'all' | AlertStatus;

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'resolved', label: 'Resolved' },
];

const AlertsContent: React.FC = () => {
  const { theme } = useTheme();
  const { token, logout } = useAuth();
  const [alerts, setAlerts] = useState<AlertTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const loadAlerts = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const tickets = await fetchAlerts(token);
      setAlerts(tickets);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load alerts';
      setError(msg);
      setAlerts([]);
      if (msg === 'Unauthorized') logout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) loadAlerts();
    else setLoading(false);
  }, [loadAlerts, token]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      loadAlerts();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const onManualRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const handleStatusAction = async (alert: AlertTicket, action: 'acknowledge' | 'resolve') => {
    if (!token) return;
    setUpdatingIds((prev) => new Set(prev).add(alert.id));

    // Optimistic update
    const newStatus: AlertStatus = action === 'acknowledge' ? 'acknowledged' : 'resolved';
    setAlerts((prev) =>
      prev.map((a) => (a.id === alert.id ? { ...a, status: newStatus } : a))
    );

    try {
      await updateAlertStatus(token, alert.id, action);
    } catch (err) {
      // Revert on error
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: alert.status } : a))
      );
      const msg = err instanceof Error ? err.message : 'Failed to update';
      if (msg === 'Unauthorized') logout();
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(alert.id);
        return next;
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.success;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.error;
      case 'acknowledged': return theme.colors.warning;
      case 'resolved': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const filteredAlerts =
    activeFilter === 'all' ? alerts : alerts.filter((a) => a.status === activeFilter);

  const getTabCount = (key: FilterTab) =>
    key === 'all' ? alerts.length : alerts.filter((a) => a.status === key).length;

  if (loading && alerts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading alerts...
        </Text>
      </View>
    );
  }

  if (error && alerts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Unable to load alerts</Text>
        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            setLoading(true);
            loadAlerts();
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onManualRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Alerts</Text>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.colors.surface }]}
          onPress={onManualRefresh}
        >
          <MaterialIcons name="refresh" size={20} color={theme.colors.text} />
          <Text style={[styles.refreshBtnText, { color: theme.colors.text }]}>
            {refreshing ? 'Syncing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = getTabCount(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? '#4A90E2' : theme.colors.surface,
                  borderColor: isActive ? '#4A90E2' : theme.colors.border,
                },
              ]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#ffffff' : theme.colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  {
                    backgroundColor: isActive
                      ? 'rgba(255,255,255,0.25)'
                      : theme.colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: isActive ? '#ffffff' : theme.colors.textSecondary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Syncing indicator */}
      {refreshing && alerts.length > 0 && (
        <View style={styles.syncRow}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>Syncing...</Text>
        </View>
      )}

      {/* Alert Cards */}
      <View style={styles.list}>
        {filteredAlerts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="check-circle" size={48} color={theme.colors.success} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All clear</Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
              No {activeFilter === 'all' ? '' : activeFilter} alerts right now.
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              theme={theme}
              isUpdating={updatingIds.has(alert.id)}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              onAcknowledge={() => handleStatusAction(alert, 'acknowledge')}
              onResolve={() => handleStatusAction(alert, 'resolve')}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

interface AlertCardProps {
  alert: AlertTicket;
  theme: any;
  isUpdating: boolean;
  getSeverityColor: (s: string) => string;
  getStatusColor: (s: string) => string;
  onAcknowledge: () => void;
  onResolve: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  theme,
  isUpdating,
  getSeverityColor,
  getStatusColor,
  onAcknowledge,
  onResolve,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.85}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardClientRow}>
          <Text style={[styles.cardClient, { color: theme.colors.text }]} numberOfLines={1}>
            {alert.client}
          </Text>
          <Text style={[styles.cardTime, { color: theme.colors.textSecondary }]}>
            {alert.time}
          </Text>
        </View>
        <View style={styles.cardBadgeRow}>
          <View style={[styles.badge, { backgroundColor: getSeverityColor(alert.severity) }]}>
            <Text style={styles.badgeText}>{alert.severity.toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: getStatusColor(alert.status), marginLeft: 6 },
            ]}
          >
            <Text style={styles.badgeText}>{alert.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Message */}
      <Text
        style={[styles.cardMessage, { color: theme.colors.text }]}
        numberOfLines={expanded ? undefined : 2}
      >
        {alert.message}
      </Text>

      {/* Type + expand hint */}
      <View style={styles.cardFooter}>
        <Text style={[styles.cardType, { color: theme.colors.textSecondary }]}>
          {alert.type}
        </Text>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={18}
          color={theme.colors.textSecondary}
        />
      </View>

      {/* Action Buttons (shown when expanded or always for active/acknowledged) */}
      {(expanded || alert.status !== 'resolved') && (
        <View style={styles.actionRow}>
          {isUpdating ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <>
              {alert.status === 'active' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.warning + '22', borderColor: theme.colors.warning }]}
                  onPress={onAcknowledge}
                >
                  <MaterialIcons name="thumb-up" size={14} color={theme.colors.warning} />
                  <Text style={[styles.actionBtnText, { color: theme.colors.warning }]}>
                    Acknowledge
                  </Text>
                </TouchableOpacity>
              )}
              {(alert.status === 'active' || alert.status === 'acknowledged') && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.colors.success + '22', borderColor: theme.colors.success }]}
                  onPress={onResolve}
                >
                  <MaterialIcons name="check-circle" size={14} color={theme.colors.success} />
                  <Text style={[styles.actionBtnText, { color: theme.colors.success }]}>
                    Resolve
                  </Text>
                </TouchableOpacity>
              )}
              {alert.status === 'resolved' && (
                <View style={styles.resolvedRow}>
                  <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                  <Text style={[styles.resolvedText, { color: theme.colors.success }]}>
                    Resolved
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  tabsScroll: {
    marginBottom: 16,
  },
  tabsContainer: {
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  syncText: {
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  emptyCard: {
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  // Alert Card
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardClientRow: {
    flex: 1,
    marginRight: 8,
  },
  cardClient: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 11,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resolvedText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default AlertsContent;
