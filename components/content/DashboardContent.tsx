import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchAlerts, type AlertTicket } from '../../services/api';

const RECENT_ALERTS_LIMIT = 5;

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<AlertTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchAlerts(token);
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadAlerts();
    else setLoading(false);
  }, [loadAlerts, token]);

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const highCount = alerts.filter((a) => a.severity === 'high' && a.status === 'active').length;
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const acknowledgedCount = alerts.filter((a) => a.status === 'acknowledged').length;
  const recentAlerts = alerts.slice(0, RECENT_ALERTS_LIMIT);

  interface StatItem {
    title: string;
    value: string;
    description: string;
    icon: any;
    color: string;
  }

  const stats: StatItem[] = [
    { title: 'CRITICAL ALERTS', value: String(criticalCount), description: 'Unresolved', icon: 'shield-alert' as any, color: '#dc3545' },
    { title: 'HIGH ALERTS', value: String(highCount), description: 'Unresolved', icon: 'show-chart' as any, color: '#ffc107' },
    { title: 'IN PROGRESS', value: String(activeCount), description: 'Being worked', icon: 'show-chart' as any, color: '#ffc107' },
    { title: 'ACKNOWLEDGED', value: String(acknowledgedCount), description: 'Pending review', icon: 'groups' as any, color: '#9370DB' },
  ];

  const getSeverityColor = (severity: string) => {
    if (severity === 'critical') return '#dc3545';
    if (severity === 'high') return '#ff8c00';
    return '#6c757d';
  };

  const getSeverityBg = (severity: string) => {
    if (severity === 'critical') return 'rgba(220, 53, 69, 0.2)';
    if (severity === 'high') return 'rgba(255, 140, 0, 0.2)';
    return 'rgba(108, 117, 125, 0.2)';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadAlerts();
          }}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      ) : (
        <>
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statMain}>
              <View style={styles.statTop}>
                <Text style={[styles.statTitle, { color: theme.colors.text }]} numberOfLines={2}>{stat.title}</Text>
                <MaterialIcons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>{stat.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.alertsContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.alertsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Alerts</Text>
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View all {'->'}</Text>
        </View>
        <View style={styles.alertsList}>
          {recentAlerts.length === 0 ? (
            <Text style={[styles.emptyAlerts, { color: theme.colors.textSecondary }]}>No recent alerts</Text>
          ) : (
            recentAlerts.map((alert, index) => {
              const severityColor = getSeverityColor(alert.severity);
              const isLast = index === recentAlerts.length - 1;
              return (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.timelineContainer}>
                    <View style={[styles.timelineDot, { backgroundColor: severityColor }]} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertMain}>
                      <Text style={[styles.alertTitle, { color: theme.colors.text }]} numberOfLines={2}>{alert.message}</Text>
                      <Text style={[styles.alertClient, { color: theme.colors.textSecondary }]}>{alert.client}</Text>
                      <View style={styles.alertBadges}>
                        <View style={[styles.severityBadge, { backgroundColor: getSeverityBg(alert.severity) }]}>
                          <MaterialIcons name="lock" size={10} color={severityColor} />
                          <Text style={[styles.severityBadgeText, { color: severityColor }]}>
                            {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                          </Text>
                        </View>
                        {alert.status === 'active' && (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>Active</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.alertRight}>
                      <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>{alert.time}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
        </>
      )}
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyAlerts: {
    fontSize: 14,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  statCard: {
    width: '48%',
    minHeight: 100,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statMain: {
    flex: 1,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 11,
    lineHeight: 13,
  },
  alertsContainer: {
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertsList: {
    paddingLeft: 10,
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    width: 2,
    height: 40,
    backgroundColor: '#d0d0d0',
    zIndex: 1,
  },
  alertContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  alertMain: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertClient: {
    fontSize: 14,
  },
  alertRight: {
    alignItems: 'flex-end',
  },
  alertTime: {
    fontSize: 12,
    marginBottom: 6,
  },
  alertBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  newBadge: {
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#007bff',
  },
});

export default DashboardContent;
