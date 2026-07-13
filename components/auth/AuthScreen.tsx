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

type Role = 'admin' | 'employee';
type Mode = 'login' | 'register';

const AuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const [role, setRole] = useState<Role | null>(null);
  const [mode, setMode] = useState<Mode>('login');

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setMode('login');
  };

  const handleBack = () => {
    setRole(null);
  };

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

        {/* Role Selection */}
        {!role ? (
          <View style={styles.roleContainer}>
            <Text style={[styles.roleHeading, { color: theme.colors.text }]}>
              Select your portal
            </Text>
            <Text style={[styles.roleSubheading, { color: theme.colors.textSecondary }]}>
              Choose how you would like to continue
            </Text>

            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: theme.colors.surface, borderColor: '#4A90E2' }]}
              onPress={() => handleRoleSelect('admin')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: '#4A90E2' + '22' }]}>
                <MaterialIcons name="admin-panel-settings" size={32} color="#4A90E2" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={[styles.roleTitle, { color: theme.colors.text }]}>Admin</Text>
                <Text style={[styles.roleDesc, { color: theme.colors.textSecondary }]}>
                  Manage all clients, alerts and users
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: theme.colors.surface, borderColor: '#34C759' }]}
              onPress={() => handleRoleSelect('employee')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: '#34C759' + '22' }]}>
                <MaterialIcons name="badge" size={32} color="#34C759" />
              </View>
              <View style={styles.roleTextWrap}>
                <Text style={[styles.roleTitle, { color: theme.colors.text }]}>Employee</Text>
                <Text style={[styles.roleDesc, { color: theme.colors.textSecondary }]}>
                  View alerts for your company
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          /* Auth Card */
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            {/* Card header: back + role label */}
            <View style={[styles.cardTopBar, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="arrow-back" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={[
                styles.rolePill,
                { backgroundColor: role === 'admin' ? 'rgba(74,144,226,0.1)' : 'rgba(52,199,89,0.1)' },
              ]}>
                <MaterialIcons
                  name={role === 'admin' ? 'admin-panel-settings' : 'badge'}
                  size={14}
                  color={role === 'admin' ? '#4A90E2' : '#34C759'}
                />
                <Text style={[styles.rolePillText, { color: role === 'admin' ? '#4A90E2' : '#34C759' }]}>
                  {role === 'admin' ? 'Admin Portal' : 'Employee Portal'}
                </Text>
              </View>
              <View style={{ width: 28 }} />
            </View>

            {/* Tab Toggle — Register only available for employees */}
            <View style={[styles.toggleContainer, { backgroundColor: theme.colors.background }]}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  mode === 'login' && { backgroundColor: role === 'admin' ? '#4A90E2' : '#34C759' },
                  role === 'admin' && { flex: 1 },
                ]}
                onPress={() => setMode('login')}
              >
                <MaterialIcons
                  name="login"
                  size={16}
                  color={mode === 'login' ? '#ffffff' : theme.colors.textSecondary}
                  style={styles.toggleIcon}
                />
                <Text style={[styles.toggleText, { color: mode === 'login' ? '#ffffff' : theme.colors.textSecondary }]}>
                  Sign in
                </Text>
              </TouchableOpacity>

              {role === 'employee' && (
                <TouchableOpacity
                  style={[styles.toggleBtn, mode === 'register' && { backgroundColor: '#34C759' }]}
                  onPress={() => setMode('register')}
                >
                  <MaterialIcons
                    name="person-add"
                    size={16}
                    color={mode === 'register' ? '#ffffff' : theme.colors.textSecondary}
                    style={styles.toggleIcon}
                  />
                  <Text style={[styles.toggleText, { color: mode === 'register' ? '#ffffff' : theme.colors.textSecondary }]}>
                    Register
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Form */}
            {mode === 'login' ? (
              <LoginScreen role={role} onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterScreen role={role} onSwitchToLogin={() => setMode('login')} />
            )}
          </View>
        )}
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
  // Role selection
  roleContainer: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  roleHeading: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  roleSubheading: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 14,
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    lineHeight: 16,
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
  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: '600',
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
