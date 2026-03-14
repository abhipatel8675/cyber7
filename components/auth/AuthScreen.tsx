import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const AuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <View style={styles.container}>
      <View style={[styles.tabs, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary || '#4A90E2' }]}
          onPress={() => setMode('login')}
        >
          <Text style={[styles.tabText, { color: mode === 'login' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Sign in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'register' && { borderBottomWidth: 2, borderBottomColor: theme.colors.primary || '#4A90E2' }]}
          onPress={() => setMode('register')}
        >
          <Text style={[styles.tabText, { color: mode === 'register' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
      {mode === 'login' ? (
        <LoginScreen onSwitchToRegister={() => setMode('register')} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setMode('login')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthScreen;
