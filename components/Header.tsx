import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  const { role, user } = useAuth();

  const initial = user?.email ? user.email[0].toUpperCase() : '?';
  const bgColor = user?.email ? avatarColor(user.email) : '#4A90E2';

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

        {/* User avatar — initials with a consistent color based on email */}
        <View style={[styles.avatar, { backgroundColor: bgColor }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
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
