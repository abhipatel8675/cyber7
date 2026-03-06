import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MainLayout from './components/MainLayout';
import { ThemeProvider } from './theme/useTheme';
import { useTheme } from './theme/useTheme';
import DashboardContent from './components/content/DashboardContent';
import AlertsContent from './components/content/AlertsContent';
import ClientsContent from './components/content/ClientsContent';
import ContactsContent from './components/content/ContactsContent';
import NotificationsContent from './components/content/NotificationsContent';
import SettingsContent from './components/content/SettingsContent';
import React, { useState } from 'react';

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  const [activeMenu, setActiveMenu] = useState('Dashboard');

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
    <MainLayout activeMenuItem={activeMenu} onMenuSelect={handleMenuSelect}>
      {renderContent()}
      <StatusBar style={theme.isDark ? 'light' : 'auto'} />
    </MainLayout>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
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
