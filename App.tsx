import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
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
import React, { useState, useEffect } from 'react';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const { role, isAuthenticated, isLoading } = useAuth();
  const [activeMenu, setActiveMenu] = useState('Dashboard');

  const menuItems = getMenuItemsForRole(role);

  // If current role can't access active menu (e.g. switched from admin to user), go to Dashboard
  useEffect(() => {
    if (!canAccessMenu(activeMenu, role)) {
      setActiveMenu('Dashboard');
    }
  }, [role, activeMenu]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Alerts':
        return <AlertsContent />;
      case 'Clients':
        return <ClientsContent />;
      case 'Contacts':
        return <ContactsContent />;
      case 'Notifications':
        return <NotificationsContent />;
      case 'Settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  const handleMenuSelect = (item: string) => {
    setActiveMenu(item);
  };

  return (
    <MainLayout
      activeMenuItem={activeMenu}
      onMenuSelect={handleMenuSelect}
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
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  contentCard: {
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  themeInfo: {
    marginTop: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
