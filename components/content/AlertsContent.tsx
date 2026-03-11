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
import { MaterialIcons } from '@expo/vector-icons';
import { fetchHighCriticalTickets, AlertTicket } from '../../services/connectwiseApi';

const REFRESH_INTERVAL_MS = 60000; // 60 seconds

const AlertsContent: React.FC = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<AlertTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      setError(null);
      const tickets = await fetchHighCriticalTickets();
      setAlerts(tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Auto-refresh every 60 seconds
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.colors.error : theme.colors.success;
  };

  if (loading && alerts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading alerts from ConnectWise...
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onManualRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Alerts</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}
          onPress={onManualRefresh}
        >
          <MaterialIcons name="refresh" size={20} color={theme.colors.text} />
          <Text style={[styles.filterText, { color: theme.colors.text }]}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {refreshing && alerts.length > 0 && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.refreshText, { color: theme.colors.textSecondary }]}>
            Syncing...
          </Text>
        </View>
      )}

      <View style={styles.alertsList}>
        {alerts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="check-circle" size={48} color={theme.colors.success} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All clear</Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
              No tickets found right now.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <View
              key={alert.id}
              style={[styles.alertCard, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.alertHeader}>
                <View style={styles.clientInfo}>
                  <Text style={[styles.clientName, { color: theme.colors.text }]}>
                    {alert.client}
                  </Text>
                  <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>
                    {alert.time}
                  </Text>
                </View>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(alert.severity) },
                  ]}
                >
                  <Text style={[styles.severityText, { color: '#ffffff' }]}>
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.alertMessage, { color: theme.colors.text }]}>
                {alert.message}
              </Text>

              <View style={styles.alertFooter}>
                <Text style={[styles.alertType, { color: theme.colors.textSecondary }]}>
                  {alert.type}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(alert.status) },
                  ]}
                >
                  <Text style={[styles.statusText, { color: '#ffffff' }]}>
                    {alert.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  filterButton: {
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
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  refreshText: {
    fontSize: 12,
  },
  alertsList: {
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
  alertCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default AlertsContent;
