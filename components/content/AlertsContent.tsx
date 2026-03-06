import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

const AlertsContent: React.FC = () => {
  const { theme } = useTheme();

  const alerts = [
    { 
      id: 1, 
      client: 'Acme Corporation', 
      type: 'Critical', 
      message: 'Server down in production environment',
      time: '2 min ago',
      status: 'active',
      severity: 'critical'
    },
    { 
      id: 2, 
      client: 'Tech Solutions', 
      type: 'Warning', 
      message: 'High CPU usage detected',
      time: '15 min ago',
      status: 'active',
      severity: 'warning'
    },
    { 
      id: 3, 
      client: 'Global Inc', 
      type: 'Info', 
      message: 'Scheduled maintenance completed',
      time: '1 hour ago',
      status: 'resolved',
      severity: 'info'
    },
    { 
      id: 4, 
      client: 'StartUp LLC', 
      type: 'Critical', 
      message: 'Database connection failed',
      time: '2 hours ago',
      status: 'active',
      severity: 'critical'
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.colors.error;
      case 'warning': return theme.colors.warning;
      case 'info': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.colors.error : theme.colors.success;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Alerts</Text>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.colors.surface }]}>
          <MaterialIcons name="filter-list" size={20} color={theme.colors.text} />
          <Text style={[styles.filterText, { color: theme.colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertsList}>
        {alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.alertHeader}>
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>{alert.client}</Text>
                <Text style={[styles.alertTime, { color: theme.colors.textSecondary }]}>{alert.time}</Text>
              </View>
              <View style={[
                styles.severityBadge, 
                { backgroundColor: getSeverityColor(alert.severity) }
              ]}>
                <Text style={[styles.severityText, { color: '#ffffff' }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.alertMessage, { color: theme.colors.text }]}>{alert.message}</Text>
            
            <View style={styles.alertFooter}>
              <Text style={[styles.alertType, { color: theme.colors.textSecondary }]}>
                Type: {alert.type}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(alert.status) }
              ]}>
                <Text style={[styles.statusText, { color: '#ffffff' }]}>
                  {alert.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  alertsList: {
    flex: 1,
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
