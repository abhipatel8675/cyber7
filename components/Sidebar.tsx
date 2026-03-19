import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MaterialIcons, Feather, Ionicons, FontAwesome5, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import type { MenuItem } from '../contexts/menuItems';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onMenuSelect?: (item: string) => void;
  menuItems: MenuItem[];
  topInset?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem = 'Dashboard',
  onMenuSelect,
  menuItems,
  topInset = 0,
}) => {
  const { theme } = useTheme();

  const renderIcon = (item: any, isActive: boolean = false) => {
    const iconProps = { size: 22, color: isActive ? '#ffffff' : theme.colors.text };
    switch (item.iconType) {
      case 'MaterialIcons':       return <MaterialIcons name={item.icon} {...iconProps} />;
      case 'Feather':             return <Feather name={item.icon} {...iconProps} />;
      case 'Ionicons':            return <Ionicons name={item.icon} {...iconProps} />;
      case 'FontAwesome5':        return <FontAwesome5 name={item.icon} {...iconProps} />;
      case 'MaterialCommunityIcons': return <MaterialCommunityIcons name={item.icon} {...iconProps} />;
      case 'AntDesign':           return <AntDesign name={item.icon} {...iconProps} />;
      default:                    return <MaterialIcons name="help" {...iconProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dim overlay — tapping it closes the sidebar */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sidebar panel */}
      <View style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}>

        {/* Header — grows to clear the notch */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: '#1a1f36',
              paddingTop: topInset + 14,
            },
          ]}
        >
          <View style={styles.logoContent}>
            <View style={styles.logoIconCircle}>
              <MaterialIcons name="security" size={22} color="#ffffff" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoMainText}>CyberApp</Text>
              <Text style={styles.logoSubText}>ALERT SYSTEM</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={22} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Menu items */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => {
            const isActive = item.title === activeItem;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  { backgroundColor: isActive ? '#4A90E2' : 'transparent' },
                ]}
                onPress={() => onMenuSelect && onMenuSelect(item.title)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  {renderIcon(item, isActive)}
                </View>
                <Text
                  style={[
                    styles.menuText,
                    {
                      color: isActive ? '#ffffff' : theme.colors.text,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 270,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextContainer: {
    marginLeft: 12,
  },
  logoMainText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  logoSubText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#4A90E2',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginVertical: 2,
    borderRadius: 10,
  },
  menuIcon: {
    width: 28,
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    fontSize: 15,
  },
});

export default Sidebar;
