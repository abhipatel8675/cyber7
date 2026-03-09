import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

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
    <View style={[styles.container, { 
      backgroundColor: theme.colors.bgPrimary,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <StatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
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
      
      <TouchableOpacity style={[styles.chatButton, { 
        backgroundColor: theme.colors.bgPrimary,
        borderColor: theme.colors.textPrimary,
        bottom: 20 + insets.bottom,
      }]}>
        <Text style={[styles.chatButtonText, { color: theme.colors.textPrimary }]}>Chat to Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MainLayout;
