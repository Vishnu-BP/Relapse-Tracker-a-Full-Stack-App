import { useAuth, useUser } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import { Activity, Flame, LifeBuoy, Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogEntryModal } from '@/components/LogEntryModal';
import { useUserSync } from '@/hooks/useUserSync';
import { createSupabaseClient } from '@/lib/supabase';

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  useUserSync();

  // STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(true);

  // 1. CALCULATE STREAK LOGIC
  const fetchStreak = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;
      
      const supabase = createSupabaseClient(token);

      const { data, error } = await supabase
        .from('logs')
        .select('created_at')
        .eq('type', 'relapse')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching streak:', error);
      }

      const lastRelapseDate = data ? new Date(data.created_at) : new Date(user?.createdAt || Date.now());
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastRelapseDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      setStreak(diffDays);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStreak(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStreak();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStreak();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.firstName || 'Friend'}</Text>
            <Text style={styles.subtitle}>Ready to stay strong?</Text>
          </View>
          {user?.imageUrl && (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          )}
        </View>

        {/* STATS CARD */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Flame color="#FF9500" size={24} fill="#FF9500" />
            <Text style={styles.streakLabel}>Current Streak</Text>
          </View>
          
          {loadingStreak ? (
             <ActivityIndicator size="small" color="#000" style={{alignSelf: 'flex-start', marginVertical: 10}} />
          ) : (
             <Text style={styles.streakCount}>{streak} Days</Text>
          )}
          
          <Text style={styles.streakSubtext}>
            {streak === 0 
              ? "Today is a new beginning." 
              : "Keep it going one day at a time."}
          </Text>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        {/* Top Row: Check-in & Relapse */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
              <Activity size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>Check-in</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
              <Plus size={24} color="#DC2626" />
            </View>
            <Text style={styles.actionText}>Relapse</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row: SOS Mode (Full Width) */}
        <TouchableOpacity 
          style={styles.sosButton} 
          onPress={() => router.push('/crisis')}
        >
          <View style={styles.sosIconBox}>
            <LifeBuoy size={28} color="#F87171" />
          </View>
          <View>
            <Text style={styles.sosTitle}>SOS Mode</Text>
            <Text style={styles.sosSubtitle}>Immediate help for strong urges</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      <LogEntryModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          fetchStreak();
        }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  
  streakCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  streakHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  streakLabel: { fontSize: 14, fontWeight: '600', color: '#FF9500', textTransform: 'uppercase', letterSpacing: 1 },
  streakCount: { fontSize: 48, fontWeight: '800', color: '#111', marginBottom: 8 },
  streakSubtext: { fontSize: 14, color: '#888' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 16 },
  
  // GRID: Top two buttons
  actionsGrid: { flexDirection: 'row', gap: 16, marginBottom: 16 }, // Added bottom margin
  
  actionButton: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 8, 
    elevation: 2 
  },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  actionText: { fontSize: 16, fontWeight: '600', color: '#111' },

  // SOS BUTTON: New Full-Width Style
  sosButton: {
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center',
    backgroundColor: '#111827', // Dark background
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sosIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#374151', // Lighter dark gray
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sosTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  sosSubtitle: { fontSize: 14, color: '#9CA3AF' },
});