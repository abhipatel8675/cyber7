import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../theme/useTheme';
import type { MenuItem } from '../contexts/menuItems';

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenuItem?: string;
  onMenuSelect?: (item: string) => void;
  menuItems: MenuItem[];
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeMenuItem = 'Dashboard',
  onMenuSelect,
  menuItems,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleMenuSelect = (item: string) => {
    if (onMenuSelect) onMenuSelect(item);
    closeSidebar();
  };

  return (
    // Full-screen container — no inset padding here
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header sits at the very top, includes the status-bar space */}
      <View
        style={[
          styles.headerWrapper,
          {
            paddingTop: insets.top,
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Header onToggleSidebar={toggleSidebar} />
      </View>

      {/* Content fills the rest, respects left / right / bottom insets */}
      <View
        style={[
          styles.content,
          {
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {children}
      </View>

      {/* Sidebar overlay — position: absolute inside the full-screen container,
          so it covers the status bar area too */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        activeItem={activeMenuItem}
        onMenuSelect={handleMenuSelect}
        menuItems={menuItems}
        topInset={insets.top}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
