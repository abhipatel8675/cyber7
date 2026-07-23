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

interface RegisterScreenProps {
  role: 'admin' | 'employee';
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ role, onSwitchToLogin }) => {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyRecId, setCompanyRecId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (!companyId.trim()) {
      setError('Company ID is required');
      return;
    }
    if (!companyRecId.trim() || isNaN(Number(companyRecId))) {
      setError('Company RecID must be a number');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, companyId.trim(), companyRecId.trim(), name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      borderColor: theme.colors.border,
    },
  ];

  return (
    <View style={styles.form}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create account</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Enter your credentials and the company details provided by your administrator.
      </Text>

      <TextInput
        style={inputStyle}
        placeholder="Full Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
        editable={!loading}
      />
      <TextInput
        style={inputStyle}
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
        style={inputStyle}
        placeholder="Password"
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        editable={!loading}
      />
      <TextInput
        style={inputStyle}
        placeholder="Company ID (provided by admin)"
        placeholderTextColor={theme.colors.textSecondary}
        value={companyId}
        onChangeText={setCompanyId}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <TextInput
        style={inputStyle}
        placeholder="Company RecID (provided by admin)"
        placeholderTextColor={theme.colors.textSecondary}
        value={companyRecId}
        onChangeText={setCompanyRecId}
        keyboardType="number-pad"
        editable={!loading}
      />

      {error ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#34C759', opacity: loading ? 0.7 : 1 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
        <Text style={[styles.link, { color: '#34C759' }]}>
          Already have an account? Sign in
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

export default RegisterScreen;
