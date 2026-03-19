import { StyleSheet, Text, View, ActivityIndicator, Platform } from 'react-native';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './theme/useTheme';
import { useTheme } from './theme/useTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getMenuItemsForRole, canAccessMenu } from './contexts/menuItems';
import AuthScreen from './components/auth/AuthScreen';
import DashboardContent from './components/content/DashboardContent';
import AlertsContent from './components/content/AlertsContent';
import ClientsContent from './components/content/ClientsContent';
import ContactsContent from './components/content/ContactsContent';
import NotificationsContent from './components/content/NotificationsContent';
import SettingsContent from './components/content/SettingsContent';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { registerPushToken, fetchAlerts, type AlertTicket } from './services/api';
import * as Notifications from 'expo-notifications';

const POLL_INTERVAL_MS = 30000; // check every 30 seconds

// Must be at module level — before any notification can fire
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function setupNotifications(authToken: string) {
  if (Platform.OS === 'web') return;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'CyberApp Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        enableLights: true,
        lightColor: '#dc3545',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    if (tokenData?.data) {
      await registerPushToken(authToken, tokenData.data, Platform.OS);
    }
  } catch {
    // EAS not configured or permission denied — local notifications still work
  }
}

async function fireOsNotification(alerts: AlertTicket[]) {
  if (Platform.OS === 'web') return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const critCount = alerts.filter((a) => a.severity === 'critical').length;
  const title = critCount > 0
    ? `⚠️ ${critCount} Critical Alert${critCount > 1 ? 's' : ''}`
    : `🔔 ${alerts.length} New Alert${alerts.length > 1 ? 's' : ''}`;
  const body = alerts.length === 1
    ? alerts[0].message
    : `${alerts.length} new alerts require your attention`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: 'alerts' } : {}),
    },
    trigger: null,
  }).catch(() => {});
}

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const { role, isAuthenticated, isLoading, token } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const menuItems = getMenuItemsForRole(role);
  const knownIdsRef = useRef<Set<number>>(new Set());
  const isFirstPollRef = useRef(true);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!canAccessMenu(activeMenu, role)) setActiveMenu('Dashboard');
  }, [role, activeMenu]);

  // ── Global alert polling ──────────────────────────────────────────────────
  const pollForNewAlerts = useCallback(async () => {
    if (!token) return;
    try {
      const alerts = await fetchAlerts(token);
      const currentIds = new Set(alerts.map((a) => a.id));

      if (!isFirstPollRef.current) {
        const newAlerts = alerts.filter((a) => !knownIdsRef.current.has(a.id));
        if (newAlerts.length > 0) {
          fireOsNotification(newAlerts);
        }
      }

      knownIdsRef.current = currentIds;
      isFirstPollRef.current = false;
    } catch {
      // Network error — try again next interval
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Clean up on logout
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      knownIdsRef.current = new Set();
      isFirstPollRef.current = true;
      return;
    }

    setupNotifications(token);

    // Seed known IDs immediately, then poll every 30s
    pollForNewAlerts();
    pollTimerRef.current = setInterval(pollForNewAlerts, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isAuthenticated, token, pollForNewAlerts]);
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) return <AuthScreen />;

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':     return <DashboardContent />;
      case 'Alerts':        return <AlertsContent />;
      case 'Clients':       return <ClientsContent />;
      case 'Contacts':      return <ContactsContent />;
      case 'Notifications': return <NotificationsContent />;
      case 'Settings':      return <SettingsContent />;
      default:              return <DashboardContent />;
    }
  };

  return (
    <MainLayout
      activeMenuItem={activeMenu}
      onMenuSelect={setActiveMenu}
      menuItems={menuItems}
    >
      {renderContent()}
    </MainLayout>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
