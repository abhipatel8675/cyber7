import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { fetchClients, type Client } from '../../services/api';

const ClientsContent: React.FC = () => {
  const { theme } = useTheme();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await fetchClients(token);
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) load();
    else setLoading(false);
  }, [load, token]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading clients...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: '#4A90E2' }]}
          onPress={() => { setLoading(true); load(); }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A90E2" />
      }
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Clients</Text>

      {/* Search */}
      <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <MaterialIcons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Search clients..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
          {searchText ? ` matching "${searchText}"` : ''}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
          {filtered.filter((c) => c.alertCount > 0).length} with alerts
        </Text>
      </View>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
          <MaterialIcons name="business" size={44} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {searchText ? 'No clients match your search' : 'No clients found'}
          </Text>
        </View>
      ) : (
        filtered.map((client) => (
          <ClientCard key={client.id} client={client} theme={theme} />
        ))
      )}
    </ScrollView>
  );
};

const ClientCard: React.FC<{ client: Client; theme: any }> = ({ client, theme }) => {
  const hasAlerts = client.alertCount > 0;
  const statusColor = client.criticalCount > 0
    ? '#dc3545'
    : client.highCount > 0
    ? '#ff8c00'
    : '#28a745';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderLeftColor: hasAlerts ? statusColor : theme.colors.border }]}>
      {/* Top row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardNameRow}>
          <View style={[styles.statusDot, { backgroundColor: hasAlerts ? statusColor : '#28a745' }]} />
          <Text style={[styles.clientName, { color: theme.colors.text }]} numberOfLines={1}>
            {client.name}
          </Text>
        </View>
        {hasAlerts && (
          <View style={[styles.alertBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.alertBadgeText}>
              {client.alertCount} alert{client.alertCount !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Identifier */}
      <Text style={[styles.identifier, { color: theme.colors.textSecondary }]}>
        {client.identifier}
      </Text>

      {/* Stats row */}
      <View style={[styles.statsRow, { borderTopColor: theme.colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#dc3545' }]}>{client.criticalCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Critical</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#ff8c00' }]}>{client.highCount}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>High</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {client.lastAlert}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Last Alert</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { marginTop: 12, fontSize: 15, textAlign: 'center' },
  retryBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryText: { fontSize: 12 },
  emptyCard: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  // Card
  card: {
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  clientName: { fontSize: 16, fontWeight: '600', flex: 1 },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  alertBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  identifier: { fontSize: 12, paddingHorizontal: 14, paddingBottom: 12 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  statLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1 },
});

export default ClientsContent;
