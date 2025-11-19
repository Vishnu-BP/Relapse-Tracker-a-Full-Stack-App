import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the shape of our Log data
interface Log {
  id: string;
  created_at: string;
  type: 'urge' | 'relapse';
  mood: string;
  notes: string | null;
}

export default function HistoryScreen() {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch data from Supabase
  const fetchLogs = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;

      const supabase = createSupabaseClient(token);

      // Select all logs, ordered by newest first
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data whenever the user navigates to this tab
  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // Render each individual log item
  const renderLogItem = ({ item }: { item: Log }) => {
    const isRelapse = item.type === 'relapse';
    const date = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={[styles.card, isRelapse ? styles.cardRelapse : styles.cardUrge]}>
        {/* Header: Type & Date */}
        <View style={styles.cardHeader}>
          <Text style={[styles.typeBadge, isRelapse ? styles.textRelapse : styles.textUrge]}>
            {item.type.toUpperCase()}
          </Text>
          <Text style={styles.dateText}>{date}</Text>
        </View>

        {/* Body: Mood & Notes */}
        <Text style={styles.moodText}>Mood: {item.mood}</Text>
        {item.notes && (
          <Text style={styles.notesText}>{item.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No logs yet. Keep it up!</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111', marginVertical: 20 },
  listContent: { paddingBottom: 50 },
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5, // Colored strip on the left
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Color variants
  cardRelapse: { borderLeftColor: '#EF4444' }, // Red
  cardUrge: { borderLeftColor: '#3B82F6' },    // Blue
  
  textRelapse: { color: '#EF4444' },
  textUrge: { color: '#3B82F6' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { fontWeight: '800', letterSpacing: 0.5 },
  dateText: { color: '#999', fontSize: 12 },
  
  moodText: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  notesText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  
  emptyText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
});