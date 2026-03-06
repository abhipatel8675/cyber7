import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationsContent: React.FC = () => {
  const { theme } = useTheme();

  const notifications = [
    { 
      id: 1, 
      title: 'Critical Alert Resolved', 
      message: 'Server downtime issue has been resolved',
      time: '5 min ago',
      type: 'success',
      read: false
    },
    { 
      id: 2, 
      title: 'New Client Added', 
      message: 'StartUp LLC has been added to your client list',
      time: '1 hour ago',
      type: 'info',
      read: false
    },
    { 
      id: 3, 
      title: 'System Update', 
      message: 'Security monitoring system updated to v2.1.0',
      time: '2 hours ago',
      type: 'info',
      read: true
    },
    { 
      id: 4, 
      title: 'Weekly Report Available', 
      message: 'Your weekly security report is ready for download',
      time: '3 hours ago',
      type: 'info',
      read: true
    },
    { 
      id: 5, 
      title: 'Maintenance Scheduled', 
      message: 'System maintenance scheduled for tonight at 2 AM',
      time: '5 hours ago',
      type: 'warning',
      read: true
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return '#4A90E2';
      default: return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'notifications';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
        <TouchableOpacity style={[styles.markAllButton, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.markAllText, { color: theme.colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.notificationsList}>
        {notifications.map((notification) => (
          <TouchableOpacity key={notification.id} style={[
            styles.notificationCard, 
            { 
              backgroundColor: notification.read ? theme.colors.surface : theme.colors.background,
              borderLeftColor: getTypeColor(notification.type)
            }
          ]}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIcon}>
                <MaterialIcons 
                  name={getTypeIcon(notification.type)} 
                  size={24} 
                  color={getTypeColor(notification.type)} 
                />
              </View>
              <View style={styles.notificationMeta}>
                <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
                  {notification.title}
                </Text>
                <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
                  {notification.time}
                </Text>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
            
            <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]}>
              {notification.message}
            </Text>
          </TouchableOpacity>
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
  markAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notificationsList: {
    flex: 1,
  },
  notificationCard: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationMeta: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationsContent;
