import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';

interface LoginScreenProps {
  role: 'admin' | 'employee';
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ role, onSwitchToRegister }) => {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      // Validate role matches portal
      const expectedRole = role === 'admin' ? 'admin' : 'user';
      if (user.role !== expectedRole) {
        setError(
          role === 'admin'
            ? 'This account does not have admin access.'
            : 'This account is not an employee account.'
        );
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <View style={styles.form}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {isAdmin ? 'Admin Sign In' : 'Employee Sign In'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {isAdmin
          ? 'Sign in with your admin credentials'
          : 'Sign in to your employee account'}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        editable={!loading}
      />
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        editable={!loading}
      />

      {error ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isAdmin ? '#4A90E2' : '#34C759', opacity: loading ? 0.7 : 1 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {!isAdmin && (
        <TouchableOpacity onPress={onSwitchToRegister} disabled={loading}>
          <Text style={[styles.link, { color: '#34C759' }]}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  error: {
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
