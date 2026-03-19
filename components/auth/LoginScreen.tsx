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
  onSwitchToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
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
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Sign in to your CyberApp account
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
        style={[styles.button, { backgroundColor: '#4A90E2', opacity: loading ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister} disabled={loading}>
        <Text style={[styles.link, { color: '#4A90E2' }]}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
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
