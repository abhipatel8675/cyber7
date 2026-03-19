import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCompanies, type Company } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState('');
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompaniesLoading(true);
    setCompaniesError('');
    fetchCompanies()
      .then(setCompanies)
      .catch((err) =>
        setCompaniesError(err instanceof Error ? err.message : 'Failed to load companies')
      )
      .finally(() => setCompaniesLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (!companyId.trim()) {
      setError('Please select a company');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, companyId.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Create account</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Select your company to get started
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

      {/* Company Selector */}
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Company</Text>
      {companiesLoading ? (
        <View
          style={[
            styles.dropdown,
            { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
          ]}
        >
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={[styles.dropdownPlaceholder, { color: theme.colors.textSecondary }]}>
            Loading companies...
          </Text>
        </View>
      ) : companiesError ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>{companiesError}</Text>
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
            ]}
            onPress={() => setCompanyModalVisible(true)}
            disabled={loading}
          >
            <Text
              style={[
                selectedCompanyName ? styles.dropdownText : styles.dropdownPlaceholder,
                {
                  color: selectedCompanyName
                    ? theme.colors.text
                    : theme.colors.textSecondary,
                },
              ]}
            >
              {selectedCompanyName || 'Select company'}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <Modal
            visible={companyModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setCompanyModalVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setCompanyModalVisible(false)}
            >
              <View
                style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
                onStartShouldSetResponder={() => true}
              >
                <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    Select company
                  </Text>
                  <TouchableOpacity onPress={() => setCompanyModalVisible(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={companies}
                  keyExtractor={(item) => `${item.id}-${item.identifier}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.companyItem, { borderBottomColor: theme.colors.border }]}
                      onPress={() => {
                        setCompanyId(item.identifier);
                        setSelectedCompanyName(item.name);
                        setCompanyModalVisible(false);
                      }}
                    >
                      <Text style={[styles.companyItemName, { color: theme.colors.text }]}>
                        {item.name}
                      </Text>
                      {item.identifier ? (
                        <Text
                          style={[
                            styles.companyItemId,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {item.identifier}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>
        </>
      )}

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
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
        <Text style={[styles.link, { color: '#4A90E2' }]}>
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
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 15,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 15,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    maxHeight: '70%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  companyItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  companyItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  companyItemId: {
    fontSize: 12,
    marginTop: 2,
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
