import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth, type Role } from '../../contexts/AuthContext';
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
  const [role, setRole] = useState<Role>('user');
  const [companyId, setCompanyId] = useState('');
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState('');
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== 'user') return;
    setCompaniesLoading(true);
    setCompaniesError('');
    fetchCompanies()
      .then(setCompanies)
      .catch((err) => setCompaniesError(err instanceof Error ? err.message : 'Failed to load companies'))
      .finally(() => setCompaniesLoading(false));
  }, [role]);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }
    if (role === 'user' && !companyId.trim()) {
      setError('Please select a company');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, role, role === 'user' ? companyId.trim() : undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Register for CyberApp
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
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
            style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!loading}
          />
          <View style={styles.roleRow}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  { backgroundColor: role === 'user' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={() => setRole('user')}
                disabled={loading}
              >
                <Text style={[styles.roleBtnText, { color: role === 'user' ? theme.colors.text : theme.colors.textSecondary }]}>
                  User
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleBtn,
                  { backgroundColor: role === 'admin' ? theme.colors.primary : theme.colors.surface, borderColor: theme.colors.border },
                ]}
                onPress={() => {
                  setRole('admin');
                  setCompanyId('');
                  setSelectedCompanyName('');
                }}
                disabled={loading}
              >
                <Text style={[styles.roleBtnText, { color: role === 'admin' ? theme.colors.text : theme.colors.textSecondary }]}>
                  Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {role === 'user' && (
            <View style={styles.companyRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Company</Text>
              {companiesLoading ? (
                <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.dropdownPlaceholder, { color: theme.colors.textSecondary }]}>Loading companies...</Text>
                </View>
              ) : companiesError ? (
                <Text style={[styles.error, { color: theme.colors.error }]}>{companiesError}</Text>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                    onPress={() => setCompanyModalVisible(true)}
                    disabled={loading}
                  >
                    <Text style={[selectedCompanyName ? styles.dropdownText : styles.dropdownPlaceholder, { color: selectedCompanyName ? theme.colors.text : theme.colors.textSecondary }]}>
                      {selectedCompanyName || 'Select company'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.textSecondary} />
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
                      <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]} onStartShouldSetResponder={() => true}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select company</Text>
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
                              <Text style={[styles.companyItemName, { color: theme.colors.text }]}>{item.name}</Text>
                              {item.identifier ? (
                                <Text style={[styles.companyItemId, { color: theme.colors.textSecondary }]}>{item.identifier}</Text>
                              ) : null}
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    </TouchableOpacity>
                  </Modal>
                </>
              )}
            </View>
          )}
          {error ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                Register
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
            <Text style={[styles.link, { color: theme.colors.primary }]}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  roleRow: {
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  companyRow: {
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 16,
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
    fontSize: 14,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RegisterScreen;
