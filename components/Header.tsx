import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MaterialIcons, Feather } from '@expo/vector-icons';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentView?: 'dashboard' | 'preview';
  onViewChange?: (view: 'dashboard' | 'preview') => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, currentView = 'dashboard', onViewChange }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View>
      {/* Top Header Section */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.textPrimary }]}>
        {/* Logo and Toggle Section */}
        <View style={styles.leftContainer}>
          <View>
            <View style={styles.logoCircle}>
              <View style={styles.logoLines}>
                <View style={styles.logoLine} />
                <View style={styles.logoLine} />
                <View style={styles.logoLine} />
              </View>
            </View>
          </View>
          
          {/* Dashboard/Preview Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: '#f0f0f0' }]}>
            <TouchableOpacity 
              style={[
                styles.toggleOption, 
                currentView === 'dashboard' && [styles.activeToggle, { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }],
                currentView !== 'dashboard' && { backgroundColor: 'transparent' }
              ]}
              onPress={() => onViewChange?.('dashboard')}
            >
              <Text style={[
                styles.toggleText, 
                { color: currentView === 'dashboard' ? '#333333' : '#666666' }
              ]}>
                Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.toggleOption, 
                currentView === 'preview' && [styles.activeToggle, { backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }],
                currentView !== 'preview' && { backgroundColor: 'transparent' }
              ]}
              onPress={() => onViewChange?.('preview')}
            >
              <Text style={[
                styles.toggleText, 
                { color: currentView === 'preview' ? '#333333' : '#666666' }
              ]}>
                Preview
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Right Icons */}
        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons 
              name="more-vert" 
              size={20} 
              color="#666666"
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.warningLight+20, borderColor: theme.colors.warning, borderWidth: 1 }]}>
            <MaterialIcons 
              name="diamond" 
              size={18} 
              color={theme.colors.warning}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.bgPrimary }]}>
            <MaterialIcons 
              name="rocket" 
              size={18} 
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Original Header Section */}
      <View style={[styles.originalHeader, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.bgTertiary }]}>
        <TouchableOpacity onPress={onToggleSidebar} style={styles.toggleButton}>
          <MaterialIcons 
            name="menu" 
            size={24} 
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>CyberApp</Text>
        
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            {theme.isDark ? (
              <Feather 
                name="moon" 
                size={20} 
                color={theme.colors.textPrimary}
              />
            ) : (
              <Feather 
                name="sun" 
                size={20} 
                color={theme.colors.textPrimary}
              />
            )}
          </TouchableOpacity>
          
          <View style={styles.profileContainer}>
            <View style={[styles.profileInitial, { backgroundColor: theme.colors.bgTertiary }]}>
              <Text style={styles.profileInitialText}>JD</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Top Header Styles
  topHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.5,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff8c00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLines: {
    gap: 2,
  },
  logoLine: {
    width: 16,
    height: 2,
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 2,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
    minWidth: 70,
    alignItems: 'center',
  },
  activeToggle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Original Header Styles
  originalHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
  },
  toggleButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  themeButton: {
    padding: 8,
    marginRight: 10,
  },
  profileContainer: {
    padding: 5,
  },
  profileInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Header;
