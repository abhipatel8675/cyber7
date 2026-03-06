import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MaterialIcons, Feather, Ionicons, FontAwesome5, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onMenuSelect?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeItem = 'Dashboard', onMenuSelect }) => {
  const { theme } = useTheme();
  
  const menuItems = [
    { id: 1, title: 'Dashboard', icon: 'dashboard', iconType: 'MaterialIcons' },
    { id: 2, title: 'Alerts', icon: 'notifications', iconType: 'MaterialIcons' },
    { id: 3, title: 'Clients', icon: 'people', iconType: 'MaterialIcons' },
    { id: 4, title: 'Contacts', icon: 'contacts', iconType: 'MaterialIcons' },
    { id: 5, title: 'Notifications', icon: 'bell', iconType: 'MaterialIcons' },
    { id: 6, title: 'Settings', icon: 'settings', iconType: 'MaterialIcons' },
  ];

  const renderIcon = (item: any, isActive: boolean = false) => {
    const iconProps = {
      size: 22,
      color: isActive ? '#4A90E2' : theme.colors.text,
    };

    switch (item.iconType) {
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon} {...iconProps} />;
      case 'Feather':
        return <Feather name={item.icon} {...iconProps} />;
      case 'Ionicons':
        return <Ionicons name={item.icon} {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon} {...iconProps} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={item.icon} {...iconProps} />;
      case 'AntDesign':
        return <AntDesign name={item.icon} {...iconProps} />;
      default:
        return <MaterialIcons name="help" {...iconProps} />;
    }
  };

  if (!isOpen) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
      <View style={[styles.sidebar, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.logoContent}>
            <MaterialIcons name="security" size={24} color="#4A90E2" />
            <View style={styles.logoTextContainer}>
              <Text style={[styles.logoMainText, { color: '#ffffff' }]}>SecureNotify</Text>
              <Text style={[styles.logoSubText, { color: '#4A90E2' }]}>ALERT SYSTEM</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons 
              name="close" 
              size={20} 
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = item.title === activeItem;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.menuItem, 
                  { 
                    borderBottomColor: theme.colors.border,
                    backgroundColor: isActive ? '#4A90E2' : 'transparent',
                  }
                ]}
                onPress={() => onMenuSelect && onMenuSelect(item.title)}
              >
                <View style={styles.menuIcon}>
                  {renderIcon(item, isActive)}
                </View>
                <Text style={[
                  styles.menuText, 
                  { 
                    color: isActive ? '#ffffff' : theme.colors.text,
                    fontWeight: isActive ? '600' : '400'
                  }
                ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  logoContainer: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 144, 226, 0.2)',
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoTextContainer: {
    marginLeft: 12,
  },
  logoMainText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoSubText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 2,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuIcon: {
    width: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 15,
  },
});

export default Sidebar;
