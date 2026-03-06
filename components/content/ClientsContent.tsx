import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

const ClientsContent: React.FC = () => {
  const { theme } = useTheme();
  const [searchText, setSearchText] = React.useState('');

  const clients = [
    { 
      id: 1, 
      name: 'Acme Corporation', 
      status: 'active',
      alerts: 23,
      lastAlert: '2 min ago',
      plan: 'Enterprise'
    },
    { 
      id: 2, 
      name: 'Tech Solutions', 
      status: 'active',
      alerts: 156,
      lastAlert: '15 min ago',
      plan: 'Professional'
    },
    { 
      id: 3, 
      name: 'Global Inc', 
      status: 'inactive',
      alerts: 0,
      lastAlert: '2 days ago',
      plan: 'Business'
    },
    { 
      id: 4, 
      name: 'StartUp LLC', 
      status: 'active',
      alerts: 45,
      lastAlert: '1 hour ago',
      plan: 'Starter'
    },
    { 
      id: 5, 
      name: 'Enterprise Systems', 
      status: 'active',
      alerts: 89,
      lastAlert: '30 min ago',
      plan: 'Enterprise'
    },
  ];

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.colors.success : theme.colors.textSecondary;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Enterprise': return '#4A90E2';
      case 'Professional': return '#28a745';
      case 'Business': return '#ffc107';
      case 'Starter': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Clients</Text>
      
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search clients..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.clientsList}>
        {filteredClients.map((client) => (
          <View key={client.id} style={[styles.clientCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.clientHeader}>
              <View style={styles.clientInfo}>
                <Text style={[styles.clientName, { color: theme.colors.text }]}>{client.name}</Text>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot, 
                    { backgroundColor: getStatusColor(client.status) }
                  ]} />
                  <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                    {client.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.planBadge, { backgroundColor: getPlanColor(client.plan) }]}>
                <Text style={[styles.planText, { color: '#ffffff' }]}>
                  {client.plan}
                </Text>
              </View>
            </View>
            
            <View style={styles.clientStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{client.alerts}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Alerts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{client.lastAlert}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Last Alert</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  clientsList: {
    flex: 1,
  },
  clientCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
});

export default ClientsContent;
