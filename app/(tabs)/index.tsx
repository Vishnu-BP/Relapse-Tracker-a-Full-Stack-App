import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Activity, ChevronRight, Flame, Heart, LifeBuoy, Plus, Quote, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogEntryModal } from '@/components/LogEntryModal';
import { useTheme } from '@/context/ThemeContext';
import { useUserSync } from '@/hooks/useUserSync';
import { createSupabaseClient } from '@/lib/supabase';

const DAILY_QUOTES = [
  "Recovery is not a race. You don't have to be perfect, you just have to be honest.",
  "Rock bottom became the solid foundation on which I rebuilt my life.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Your best days are ahead of you. The movie isn't over yet.",
];

export default function HomeScreen() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  
  useUserSync();

  // STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [entryType, setEntryType] = useState<'urge' | 'relapse'>('urge'); 
  const [refreshing, setRefreshing] = useState(false);
  
  // Streak States
  const [lastRelapseDate, setLastRelapseDate] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loadingStreak, setLoadingStreak] = useState(true);
  
  const [quote, setQuote] = useState(DAILY_QUOTES[0]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setQuote(DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)]);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for flame
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle rotation
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 1. FETCH THE DATE FROM DB
  const fetchStreakDate = async () => {
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

      const date = data ? new Date(data.created_at) : new Date(user?.createdAt || Date.now());
      setLastRelapseDate(date);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStreak(false);
      setRefreshing(false);
    }
  };

  // 2. LIVE TIMER
  useEffect(() => {
    if (!lastRelapseDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - lastRelapseDate.getTime();

      if (diff >= 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeElapsed({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRelapseDate]);

  useFocusEffect(useCallback(() => { fetchStreakDate(); }, []));
  const onRefresh = useCallback(() => { setRefreshing(true); fetchStreakDate(); }, []);

  const openModal = (type: 'urge' | 'relapse') => {
    setEntryType(type);
    setModalVisible(true);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <View style={styles.dateRow}>
              <Animated.View style={{ transform: [{ rotate: sparkleRotation }] }}>
                <Sparkles size={14} color="#10B981" />
              </Animated.View>
              <Text style={[styles.dateText, { color: colors.subtext }]}>{today.toUpperCase()}</Text>
            </View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hi, {user?.firstName || 'Friend'} 👋
            </Text>
          </View>
          
          {/* AVATAR - CLICK TO GO TO PROFILE */}
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            {user?.imageUrl ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
                <View style={styles.avatarBadge}>
                  <Heart size={12} color="#fff" fill="#fff" />
                </View>
              </View>
            ) : (
              <View style={[styles.avatarContainer]}>
                <View style={[styles.avatar, { backgroundColor: '#10B981' }]} />
                <View style={styles.avatarBadge}>
                  <Heart size={12} color="#fff" fill="#fff" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* LIVE STREAK CARD */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#ffd380', '#ffa600']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroTopRow}>
              <View style={styles.badge}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Flame color="#FCD34D" fill="#FCD34D" size={16} />
                </Animated.View>
                <Text style={styles.badgeText}>STREAK ACTIVE</Text>
              </View>
              <View style={styles.trendBadge}>
                <TrendingUp size={14} color="#fff" />
              </View>
            </View>

            {/* TIMER DISPLAY */}
            <View style={styles.timerContainer}>
               {loadingStreak ? (
                 <ActivityIndicator size="large" color="#fff" />
               ) : (
                 <View style={styles.timerRow}>
                   <View style={styles.timeBlock}>
                     <View style={styles.timeValueContainer}>
                       <Text style={styles.timeValue}>{timeElapsed.days}</Text>
                     </View>
                     <Text style={styles.timeLabel}>DAYS</Text>
                   </View>
                   <Text style={styles.timeSeparator}>:</Text>
                   <View style={styles.timeBlock}>
                     <View style={styles.timeValueContainer}>
                       <Text style={styles.timeValue}>{timeElapsed.hours.toString().padStart(2, '0')}</Text>
                     </View>
                     <Text style={styles.timeLabel}>HRS</Text>
                   </View>
                   <Text style={styles.timeSeparator}>:</Text>
                   <View style={styles.timeBlock}>
                     <View style={styles.timeValueContainer}>
                       <Text style={styles.timeValue}>{timeElapsed.minutes.toString().padStart(2, '0')}</Text>
                     </View>
                     <Text style={styles.timeLabel}>MIN</Text>
                   </View>
                   <Text style={styles.timeSeparator}>:</Text>
                   <View style={styles.timeBlock}>
                     <View style={styles.timeValueContainer}>
                       <Text style={styles.timeValue}>{timeElapsed.seconds.toString().padStart(2, '0')}</Text>
                     </View>
                     <Text style={styles.timeLabel}>SEC</Text>
                   </View>
                 </View>
               )}
            </View>

            <View style={styles.progressTextContainer}>
              <View style={styles.heartIcon}>
                <Heart size={16} color="#fff" fill="rgba(255,255,255,0.3)" />
              </View>
              <Text style={styles.progressText}>Every second counts. Stay strong.</Text>
            </View>

            {/* Milestone indicator */}
            {timeElapsed.days > 0 && (
              <View style={styles.milestoneContainer}>
                <View style={styles.milestoneDot} />
                <Text style={styles.milestoneText}>
                  {timeElapsed.days === 1 ? '1 Day Strong!' : 
                   timeElapsed.days === 7 ? 'One Week Champion!' : 
                   timeElapsed.days === 30 ? 'One Month Victory!' : 
                   timeElapsed.days >= 100 ? '100+ Days Legend!' : 
                   `${timeElapsed.days} Days Strong!`}
                </Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* DAILY WISDOM */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.quoteCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={['#A78BFA', '#8B5CF6']}
              style={styles.quoteIconBg}
            >
              <Quote size={20} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
               <Text style={[styles.quoteTitle, { color: colors.subtext }]}>DAILY WISDOM</Text>
               <Text style={[styles.quoteText, { color: colors.text }]}>"{quote}"</Text>
            </View>
          </View>
        </Animated.View>

        {/* ACTIONS */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Track & Log</Text>
            <View style={styles.sectionBadge}>
              <Activity size={14} color="#10B981" />
            </View>
          </View>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.card }]} 
              onPress={() => openModal('urge')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#DBEAFE', '#BFDBFE']}
                style={styles.iconCircle}
              >
                <Activity size={24} color="#0284C7" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Check In</Text>
              <Text style={styles.actionSub}>Track your progress</Text>
              <View style={styles.actionArrow}>
                <ChevronRight size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.card }]} 
              onPress={() => openModal('relapse')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#FEE2E2', '#FECACA']}
                style={styles.iconCircle}
              >
                <Plus size={24} color="#DC2626" />
              </LinearGradient>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Relapse</Text>
              <Text style={styles.actionSub}>Reset & restart</Text>
              <View style={styles.actionArrow}>
                <ChevronRight size={16} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* SOS */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => router.push('/crisis')}
            style={styles.sosContainer}
          >
            <LinearGradient 
              colors={['#1F2937', '#111827']} 
              style={styles.sosBanner}
            >
              <View style={styles.sosContent}>
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  style={styles.sosIconBox}
                >
                  <LifeBuoy size={24} color="#fff" />
                </LinearGradient>
                <View>
                  <View style={styles.sosHeaderRow}>
                    <Text style={styles.sosTitle}>SOS Mode</Text>
                    <View style={styles.liveDot} />
                  </View>
                  <Text style={styles.sosSubtitle}>Feeling an urge? Get help now.</Text>
                </View>
              </View>
              <View style={styles.sosChevron}>
                <ChevronRight color="#9CA3AF" size={20} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      <LogEntryModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => fetchStreakDate()}
        initialType={entryType} 
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  dateText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  greeting: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, borderColor: '#E5E7EB' },
  avatarBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },

  heroCard: { borderRadius: 28, padding: 28, marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 11, letterSpacing: 0.8 },
  trendBadge: { backgroundColor: 'rgba(255,255,255,0.2)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  timerContainer: { alignItems: 'center', marginBottom: 20 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeBlock: { alignItems: 'center', gap: 4 },
  timeValueContainer: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, minWidth: 60, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  timeValue: { fontSize: 32, fontWeight: '900', color: '#fff', fontVariant: ['tabular-nums'] },
  timeLabel: { fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 0.5 },
  timeSeparator: { fontSize: 28, fontWeight: '700', color: 'rgba(255,255,255,0.3)', marginHorizontal: 2 },
  
  progressTextContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginBottom: 12 },
  heartIcon: { opacity: 0.8 },
  progressText: { color: '#fff', fontSize: 13, fontWeight: '600', letterSpacing: 0.3 },
  
  milestoneContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  milestoneDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FCD34D' },
  milestoneText: { color: '#FCD34D', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  quoteCard: { flexDirection: 'row', padding: 20, borderRadius: 24, marginBottom: 32, gap: 16, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  quoteIconBg: { padding: 12, borderRadius: 16, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  quoteTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8 },
  quoteText: { fontSize: 15, lineHeight: 23, fontWeight: '500', fontStyle: 'italic' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionBadge: { backgroundColor: '#D1FAE5', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  actionsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  actionCard: { flex: 1, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, position: 'relative' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4, letterSpacing: -0.2 },
  actionSub: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  actionArrow: { position: 'absolute', top: 20, right: 20, backgroundColor: '#F1F5F9', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  sosContainer: { borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  sosBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sosContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  sosIconBox: { padding: 12, borderRadius: 16, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sosHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sosTitle: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  sosSubtitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '500' },
  sosChevron: { backgroundColor: 'rgba(255,255,255,0.1)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});