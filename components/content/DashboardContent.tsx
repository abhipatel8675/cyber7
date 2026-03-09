import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DashboardContent: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  interface StatItem {
    title: string;
    value: string;
    description: string;
    icon: any;
    color: string;
  }

  const stats: StatItem[] = [
    { title: 'CRITICAL ALERTS', value: '3', description: 'Unresolved', icon: 'shield-alert' as any, color: '#dc3545' },
    { title: 'HIGH ALERTS', value: '1', description: 'Unresolved', icon: 'show-chart' as any, color: '#ffc107' },
    { title: 'IN PROGRESS', value: '0', description: 'Being worked', icon: 'show-chart' as any, color: '#ffc107' },
    { title: 'ACKNOWLEDGED', value: '0', description: 'Total', icon: 'groups' as any, color: '#9370DB' },
  ];

  const recentAlerts = [
    { id: 1, title: 'Test Alert 4', client: 'Test Client', severity: 'critical', time: '7:52 AM', isNew: true },
    { id: 2, title: 'Test Alert 3', client: 'Test Client', severity: 'high', time: '7:45 AM', isNew: true },
    { id: 3, title: 'Test Alert 2', client: 'Test Client', severity: 'critical', time: 'Yesterday', isNew: false },
    { id: 4, title: 'Test Alert 1', client: 'Test Client', severity: 'high', time: 'Yesterday', isNew: false },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: 20 + insets.bottom }
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
      
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
          {recentAlerts.map((alert, index) => (
            <View key={alert.id} style={styles.alertItem}>
              <View style={styles.timelineContainer}>
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: alert.severity === 'critical' ? '#dc3545' : '#ff8c00' }
                ]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.alertContent}>
                <View style={styles.alertMain}>
                  <Text style={[styles.alertTitle, { color: theme.colors.text }]}>{alert.title}</Text>
                  <Text style={[styles.alertClient, { color: theme.colors.textSecondary }]}>{alert.client}</Text>
                  <View style={styles.alertBadges}>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: alert.severity === 'critical' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(255, 140, 0, 0.2)' }
                    ]}>
                      <MaterialIcons name="lock" size={10} color={alert.severity === 'critical' ? '#dc3545' : '#ff8c00'} />
                      <Text style={[
                        styles.severityBadgeText,
                        { color: alert.severity === 'critical' ? '#dc3545' : '#ff8c00' }
                      ]}>
                        {alert.severity === 'critical' ? 'Critical' : 'High'}
                      </Text>
                    </View>
                    {alert.isNew && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.alertRight}>
                  <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>{alert.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
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
