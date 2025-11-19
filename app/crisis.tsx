import { useRouter } from 'expo-router';
import { Anchor, Heart, ShieldCheck, Wind, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Motivation & Reasons Data (Unchanged)
const MOTIVATION = [
  "This urge will pass. You are stronger than it.",
  "Think about why you started.",
  "One minute at a time. You can do anything for one minute.",
  "Recovery is not a straight line. Stay the course.",
  "You deserve a life free from this.",
  "Focus on your breath, not the noise in your head."
];

const REASONS = [
  "For my family",
  "To save money",
  "To feel healthy again",
  "To be proud of myself",
];

export default function CrisisScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [textIndex, setTextIndex] = useState(0);
  const [mode, setMode] = useState<'breathe' | 'reasons'>('breathe');

  // Logic: Breathing Animation Loop (Unchanged)
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.8, // Expand
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Hold
        Animated.timing(scaleAnim, {
          toValue: 1, // Contract
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();

    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % MOTIVATION.length);
    }, 8000);

    return () => {
      breathe.stop();
      clearInterval(interval);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header - Clean & Minimal */}
      <View style={styles.header}>
        <View>
            <Text style={styles.headerSubtitle}>Stay Strong</Text>
            <Text style={styles.headerTitle}>SOS Support</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color="#64748B" size={24} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher - Pill Style */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsBackground}>
            <TouchableOpacity 
            onPress={() => setMode('breathe')} 
            style={[styles.tab, mode === 'breathe' && styles.activeTab]}
            >
            <Wind color={mode === 'breathe' ? '#0EA5E9' : '#94A3B8'} size={18} strokeWidth={2.5} />
            <Text style={[styles.tabText, mode === 'breathe' && styles.activeTabText]}>Breathe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={() => setMode('reasons')} 
            style={[styles.tab, mode === 'reasons' && styles.activeTab]}
            >
            <ShieldCheck color={mode === 'reasons' ? '#0EA5E9' : '#94A3B8'} size={18} strokeWidth={2.5} />
            <Text style={[styles.tabText, mode === 'reasons' && styles.activeTabText]}>My Reasons</Text>
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {mode === 'breathe' ? (
          // BREATHING VIEW
          <View style={styles.centerContainer}>
             
             {/* Text Guide */}
             <View style={styles.instructionContainer}>
                 <Text style={styles.instructionLabel}>Focus on the circle</Text>
                 <Text style={styles.instructionSub}>Inhale as it grows, exhale as it shrinks</Text>
             </View>

             {/* Visual Animation */}
             <View style={styles.circleWrapper}>
                {/* Outer Ripple */}
                <Animated.View 
                  style={[
                    styles.breathingCircle, 
                    { 
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim.interpolate({
                            inputRange: [1, 1.8],
                            outputRange: [0.6, 0] // Fade out as it expands
                        })
                    }
                  ]} 
                />
                {/* Main Breathing Body */}
                <Animated.View 
                  style={[
                    styles.breathingCircleCore, 
                    { transform: [{ scale: scaleAnim }] }
                  ]} 
                />
                {/* Center Anchor */}
                <View style={styles.centerAnchor}>
                    <Anchor color="#fff" size={24} />
                </View>
             </View>

             {/* Dynamic Quote */}
             <View style={styles.quoteContainer}>
                <Text style={styles.quote}>"{MOTIVATION[textIndex]}"</Text>
             </View>
          </View>
        ) : (
          // REASONS VIEW
          <View style={styles.reasonsContainer}>
            <Text style={styles.reasonsTitle}>Why I am doing this</Text>
            {REASONS.map((reason, index) => (
              <View key={index} style={styles.reasonCard}>
                <View style={styles.iconContainer}>
                    <Heart color="#EF4444" fill="#EF4444" size={20} />
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
            <Text style={styles.subtext}>Tap into your "Why". It is stronger than the urge.</Text>
          </View>
        )}
      </View>

      {/* Bottom Button - Soft & Encouraging */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitText}>I'm Feeling Better</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout & Background
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' // Light cool gray background
  },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  headerTitle: { 
    color: '#0F172A', 
    fontSize: 28, 
    fontWeight: '800', 
  },
  closeBtn: { 
    padding: 10, 
    backgroundColor: '#E2E8F0', 
    borderRadius: 50 
  },
  
  // Tabs
  tabsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tabsBackground: {
    flexDirection: 'row', 
    padding: 4, 
    borderRadius: 30, 
    backgroundColor: '#E2E8F0', // Darker gray for tab track
    width: '90%'
  },
  tab: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8, 
    paddingVertical: 12, 
    borderRadius: 25, 
  },
  activeTab: { 
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: { 
    color: '#64748B', 
    fontWeight: '600',
    fontSize: 15
  },
  activeTabText: { 
    color: '#0F172A',
    fontWeight: '700'
  },

  content: { flex: 1, justifyContent: 'center' },
  
  // Breathe Styles
  centerContainer: { alignItems: 'center', justifyContent: 'space-around', flex: 1 },
  instructionContainer: { alignItems: 'center', marginTop: 20 },
  instructionLabel: { color: '#334155', fontSize: 22, fontWeight: '700' },
  instructionSub: { color: '#64748B', fontSize: 16, marginTop: 5 },
  
  circleWrapper: { 
    height: 300, 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative'
  },
  // The fading outer ripple
  breathingCircle: { 
    width: 220, 
    height: 220, 
    borderRadius: 110, 
    backgroundColor: '#BAE6FD', // Very light blue
    position: 'absolute',
  },
  // The main moving circle
  breathingCircleCore: { 
    width: 220, 
    height: 220, 
    borderRadius: 110, 
    backgroundColor: '#7DD3FC', // Sky blue
    opacity: 0.4,
    position: 'absolute',
  },
  // The static center
  centerAnchor: {
    width: 60,
    height: 60,
    backgroundColor: '#0EA5E9', // Strong blue
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  quoteContainer: {
    paddingHorizontal: 40,
    height: 100, // Fixed height to prevent jumping
    justifyContent: 'center'
  },
  quote: { 
    color: '#475569', 
    fontSize: 18, 
    textAlign: 'center', 
    fontStyle: 'italic',
    lineHeight: 26,
    fontWeight: '500'
  },

  // Reasons Styles
  reasonsContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  reasonsTitle: { fontSize: 20, fontWeight: '700', color: '#334155', marginBottom: 20 },
  
  reasonCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    backgroundColor: '#fff', 
    paddingVertical: 16,
    paddingHorizontal: 20, 
    borderRadius: 16, 
    marginBottom: 12,
    // Soft Shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  iconContainer: {
    backgroundColor: '#FEF2F2', // Very light red
    padding: 10,
    borderRadius: 12,
  },
  reasonText: { color: '#334155', fontSize: 17, fontWeight: '600' },
  subtext: { color: '#94A3B8', textAlign: 'center', marginTop: 30, fontSize: 14 },

  // Footer
  footer: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 0 : 24 },
  exitButton: { 
    backgroundColor: '#10B981', // Success Green
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  exitText: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
});