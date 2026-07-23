import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAuth } from '../contexts/AuthContext';
import { MaterialIcons, Feather } from '@expo/vector-icons';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const AVATAR_COLORS = ['#4A90E2', '#E24A7A', '#4AE290', '#E2A84A', '#9B4AE2'];

function avatarColor(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { role, user, logout } = useAuth();

  const initial = user?.email ? user.email[0].toUpperCase() : '?';
  const bgColor = user?.email ? avatarColor(user.email) : '#4A90E2';

  const handleAvatarPress = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Sign out ${user?.email || ''}?`)) {
        logout();
      }
      return;
    }
    Alert.alert(
      'Sign out',
      user?.email ? `Sign out ${user.email}?` : 'Sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <TouchableOpacity onPress={onToggleSidebar} style={styles.toggleButton}>
        <MaterialIcons name="menu" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, { color: theme.colors.text }]}>CyberApp</Text>

      <View style={styles.rightContainer}>
        <View style={[styles.roleBadge, { backgroundColor: theme.isDark ? '#333' : '#f0f0f0' }]}>
          <Text style={[styles.roleBadgeText, { color: theme.colors.textSecondary }]}>{role}</Text>
        </View>

        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Feather
            name={theme.isDark ? 'moon' : 'sun'}
            size={20}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        {/* User avatar — tap to sign out */}
        <TouchableOpacity
          onPress={handleAvatarPress}
          style={[styles.avatar, { backgroundColor: bgColor }]}
          accessibilityLabel="Sign out"
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  themeButton: {
    padding: 6,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Header;
