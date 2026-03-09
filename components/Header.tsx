import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { MaterialIcons, Feather } from '@expo/vector-icons';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.bgSecondary, borderBottomColor: theme.colors.bgTertiary }]}>
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
          <Image 
            source={{ uri: 'https://picsum.photos/seed/profile/40/40.jpg' }} 
            style={[styles.profileImage, { borderColor: theme.colors.bgTertiary }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
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
  },
  themeButton: {
    padding: 8,
    marginRight: 10,
  },
  profileContainer: {
    padding: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
});

export default Header;
