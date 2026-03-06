import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../theme/useTheme';

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenuItem?: string;
  onMenuSelect?: (item: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeMenuItem = 'Dashboard', onMenuSelect }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleMenuSelect = (item: string) => {
    if (onMenuSelect) {
      onMenuSelect(item);
    }
    closeSidebar();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header onToggleSidebar={toggleSidebar} />
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        activeItem={activeMenuItem}
        onMenuSelect={handleMenuSelect}
      />
      <View style={styles.content}>
        {children}
      </View>
      
      <TouchableOpacity style={[styles.chatButton, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.chatButtonText}>Chat to Edit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chatButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MainLayout;
