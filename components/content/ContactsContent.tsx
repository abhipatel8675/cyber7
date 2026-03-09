import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

const ContactsContent: React.FC = () => {
  const { theme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All Companies');

  const contacts = [
    { 
      id: 1, 
      name: 'Steve Theoden', 
      email: 'steve.theoden@cyber7.com.au',
      phone: '+493078311',
      company: 'Cyber7',
      starred: true
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      role: 'Security Manager',
      email: 'sarah.j@techsolutions.com',
      phone: '+1-555-0456',
      company: 'Tech Solutions',
      starred: false
    },
    { 
      id: 3, 
      name: 'Mike Wilson', 
      role: 'IT Director',
      email: 'm.wilson@globalinc.com',
      phone: '+1-555-0789',
      company: 'Global Inc',
      starred: false
    },
    { 
      id: 4, 
      name: 'Emily Davis', 
      role: 'Support Lead',
      email: 'emily.d@startupllc.com',
      phone: '+1-555-0234',
      company: 'StartUp LLC',
      starred: false
    },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Contacts</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.warning }]}>
            <MaterialIcons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          Manage client IT contacts who receive security notifications
        </Text>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.bgSecondary }]}>
            <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.textPrimary }]}
              placeholder="Search contacts..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          
          <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: theme.colors.bgSecondary }]}>
            <Text style={[styles.dropdownText, { color: theme.colors.textPrimary }]}>{selectedCompany}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>CONTACT</Text>

        <View style={styles.contactsList}>
          {contacts.map((contact) => (
            <View key={contact.id} style={[styles.contactCard, { backgroundColor: theme.colors.bgSecondary }]}>
              <View style={styles.contactMain}>
                <View style={styles.contactLeft}>
                  <View style={[styles.initialCircle, { backgroundColor: theme.colors.bgPrimary }]}>
                    <Text style={[styles.initialText, { color: theme.colors.warning }]}>{getInitials(contact.name)}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.contactName, { color: theme.colors.textPrimary }]}>{contact.name}</Text>
                      {contact.starred && (
                        <MaterialIcons name="star" size={16} color={theme.colors.warning} />
                      )}
                    </View>
                    <View style={styles.contactDetails}>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="email" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.contactEmail, { color: theme.colors.textSecondary }]}>{contact.email}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="phone" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.contactPhone, { color: theme.colors.textSecondary }]}>{contact.phone}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
        
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  searchContainer: {
    marginBottom: 24,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 1,
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  initialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  contactDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactEmail: {
    fontSize: 14,
  },
  contactPhone: {
    fontSize: 14,
  },
  chatButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  chatButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ContactsContent;
