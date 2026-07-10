import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchCompanies,
  fetchContactsByCompany,
  type Company,
  type Contact,
} from '../../services/api';

const ContactsContent: React.FC = () => {
  const { theme } = useTheme();
  const { token, logout } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState('');

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

  const loadContacts = useCallback(
    async (identifier: string) => {
      if (!token) return;
      setContactsLoading(true);
      setContactsError('');
      try {
        const data = await fetchContactsByCompany(token, identifier);
        setContacts(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load contacts';
        if (msg === 'Unauthorized') logout();
        setContactsError(msg);
        setContacts([]);
      } finally {
        setContactsLoading(false);
      }
    },
    [token, logout]
  );

  useEffect(() => {
    if (selectedCompany) loadContacts(selectedCompany.identifier);
  }, [selectedCompany, loadContacts]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const filteredContacts = contacts.filter((c) => {
    const q = searchText.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Contacts</Text>
        </View>

        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Browse contacts within a company
        </Text>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.surface }]}>
            <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search contacts..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {companiesLoading ? (
            <View style={[styles.dropdownButton, { backgroundColor: theme.colors.surface }]}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.dropdownText, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
                Loading companies...
              </Text>
            </View>
          ) : companiesError ? (
            <Text style={[styles.error, { color: theme.colors.error }]}>{companiesError}</Text>
          ) : (
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: theme.colors.surface }]}
              onPress={() => setCompanyModalVisible(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.colors.text }]} numberOfLines={1}>
                {selectedCompany ? selectedCompany.name : 'Select company'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
          {selectedCompany ? `CONTACTS — ${selectedCompany.name.toUpperCase()}` : 'CONTACT'}
        </Text>

        {!selectedCompany ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="business" size={40} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Select a company to view its contacts
            </Text>
          </View>
        ) : contactsLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : contactsError ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="error-outline" size={40} color={theme.colors.error} />
            <Text style={[styles.emptyText, { color: theme.colors.error }]}>{contactsError}</Text>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => loadContacts(selectedCompany.identifier)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="person-off" size={40} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {contacts.length === 0 ? 'No contacts in this company' : 'No matching contacts'}
            </Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {filteredContacts.map((contact) => (
              <View
                key={contact.id}
                style={[styles.contactCard, { backgroundColor: theme.colors.surface }]}
              >
                <View style={styles.contactMain}>
                  <View style={styles.contactLeft}>
                    <View style={[styles.initialCircle, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.initialText}>{getInitials(contact.name)}</Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={[styles.contactName, { color: theme.colors.text }]}>
                        {contact.name}
                      </Text>
                      {!!contact.title && (
                        <Text style={[styles.contactTitle, { color: theme.colors.textSecondary }]}>
                          {contact.title}
                        </Text>
                      )}
                      {!!contact.email && (
                        <TouchableOpacity onPress={() => Linking.openURL(`mailto:${contact.email}`)}>
                          <Text style={[styles.contactEmail, { color: theme.colors.primary }]}>
                            {contact.email}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {!!contact.phone && (
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${contact.phone}`)}>
                          <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>
                            {contact.phone}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Company picker modal */}
      <Modal
        visible={companyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCompanyModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCompanyModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select company</Text>
              <TouchableOpacity onPress={() => setCompanyModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={companies}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.companyItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => {
                    setSelectedCompany(item);
                    setCompanyModalVisible(false);
                  }}
                >
                  <Text style={[styles.companyItemName, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  {!!item.identifier && item.identifier !== item.name && (
                    <Text style={[styles.companyItemId, { color: theme.colors.textSecondary }]}>
                      {item.identifier}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 32, fontWeight: 'bold' },
  description: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  searchContainer: { marginBottom: 24, gap: 12 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownText: { fontSize: 16, flex: 1 },
  error: { fontSize: 13 },
  sectionHeader: { fontSize: 12, fontWeight: '600', marginBottom: 16, letterSpacing: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  retryBtn: { marginTop: 8, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 6 },
  retryText: { color: '#fff', fontWeight: '600' },
  contactsList: { flex: 1 },
  contactCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  contactMain: { flexDirection: 'row', alignItems: 'center' },
  contactLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  initialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  contactTitle: { fontSize: 13, marginBottom: 2 },
  contactEmail: { fontSize: 14, marginBottom: 2 },
  contactPhone: { fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  companyItem: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  companyItemName: { fontSize: 15, fontWeight: '500' },
  companyItemId: { fontSize: 12, marginTop: 2 },
});

export default ContactsContent;
