import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';

const AuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.branding}>
          <View style={[styles.logoCircle, { backgroundColor: '#4A90E2' }]}>
            <MaterialIcons name="security" size={36} color="#ffffff" />
          </View>
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>CyberApp</Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
            Security Alert Management
          </Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          {/* Tab Toggle inside the card */}
          <View style={[styles.toggleContainer, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'login' && { backgroundColor: '#4A90E2' },
              ]}
              onPress={() => setMode('login')}
            >
              <MaterialIcons
                name="login"
                size={16}
                color={mode === 'login' ? '#ffffff' : theme.colors.textSecondary}
                style={styles.toggleIcon}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'login' ? '#ffffff' : theme.colors.textSecondary },
                ]}
              >
                Sign in
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                mode === 'register' && { backgroundColor: '#4A90E2' },
              ]}
              onPress={() => setMode('register')}
            >
              <MaterialIcons
                name="person-add"
                size={16}
                color={mode === 'register' ? '#ffffff' : theme.colors.textSecondary}
                style={styles.toggleIcon}
              />
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === 'register' ? '#ffffff' : theme.colors.textSecondary },
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          {mode === 'login' ? (
            <LoginScreen onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterScreen onSwitchToLogin={() => setMode('login')} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  // Branding
  branding: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
  },
  // Card
  card: {
    borderRadius: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 10,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  toggleIcon: {
    marginRight: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthScreen;
