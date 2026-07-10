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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export const ALERT_TONE_KEY = '@cyberapp_alert_tone';

export type AlertToneId = 'default' | 'urgent' | 'pulse' | 'silent';

export interface AlertTone {
  id: AlertToneId;
  label: string;
  icon: string;
  vibration: number[];
  sound: string | false;
  channelId: string;
}

export const ALERT_TONES: AlertTone[] = [
  {
    id: 'default',
    label: 'Default',
    icon: 'volume-up',
    vibration: [0, 250, 250, 250],
    sound: 'default',
    channelId: 'alerts',
  },
  {
    id: 'urgent',
    label: 'Urgent',
    icon: 'warning',
    vibration: [0, 100, 100, 100, 100, 100, 100, 100],
    sound: 'default',
    channelId: 'alerts_urgent',
  },
  {
    id: 'pulse',
    label: 'Pulse',
    icon: 'graphic-eq',
    vibration: [0, 600, 300, 600],
    sound: 'default',
    channelId: 'alerts_pulse',
  },
  {
    id: 'silent',
    label: 'Silent',
    icon: 'volume-off',
    vibration: [],
    sound: false,
    channelId: 'alerts_silent',
  },
];

const POLL_INTERVAL_MS = 30000; // check every 30 seconds

// Must be at module level — before any notification can fire
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function getActiveTone(): Promise<AlertTone> {
  try {
    const stored = await AsyncStorage.getItem(ALERT_TONE_KEY);
    const found = ALERT_TONES.find((t) => t.id === stored);
    return found ?? ALERT_TONES[0];
  } catch {
    return ALERT_TONES[0];
  }
}

async function setupNotifications(authToken: string) {
  if (Platform.OS === 'web') return;
  try {
    if (Platform.OS === 'android') {
      // Register all tone channels upfront so they're ready when needed
      await Promise.all(
        ALERT_TONES.map((tone) =>
          Notifications.setNotificationChannelAsync(tone.channelId, {
            name: `CyberApp Alerts — ${tone.label}`,
            importance: tone.id === 'silent'
              ? Notifications.AndroidImportance.LOW
              : Notifications.AndroidImportance.MAX,
            vibrationPattern: tone.vibration.length > 0 ? tone.vibration : undefined,
            sound: tone.sound ? 'default' : null,
            enableLights: tone.id !== 'silent',
            lightColor: '#dc3545',
          })
        )
      );
    }
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    }).catch(() => null);
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

  const tone = await getActiveTone();

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
      sound: tone.sound === false ? false : 'default',
      ...(Platform.OS === 'android' ? { channelId: tone.channelId } : {}),
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
