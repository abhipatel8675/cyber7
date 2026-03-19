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
import { fetchNotifications, type AppNotification } from '../../services/api';

const NotificationsContent: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    const data = await fetchNotifications(token);
    setNotifications(data);
    setLoading(false);
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    if (token) loadNotifications();
    else setLoading(false);
  }, [loadNotifications, token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      default: return '#4A90E2';
    }
  };

  const getTypeIcon = (type: string): any => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading notifications...
        </Text>
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
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.colors.surface }]}
          onPress={onRefresh}
        >
          <MaterialIcons name="refresh" size={18} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {notifications.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="notifications-none" size={48} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No activity yet
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.colors.textSecondary }]}>
              Alert state changes (acknowledged / resolved) will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((n) => (
            <View
              key={n.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderLeftColor: getTypeColor(n.type),
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialIcons
                  name={getTypeIcon(n.type)}
                  size={22}
                  color={getTypeColor(n.type)}
                  style={styles.cardIcon}
                />
                <View style={styles.cardMeta}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {n.title}
                  </Text>
                  <Text style={[styles.cardTime, { color: theme.colors.textSecondary }]}>
                    {n.time}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardMessage, { color: theme.colors.textSecondary }]}>
                {n.message}
              </Text>
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
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    flex: 1,
  },
  emptyCard: {
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
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
    lineHeight: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  cardMeta: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 12,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationsContent;
