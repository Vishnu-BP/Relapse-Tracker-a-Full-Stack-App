import { useRouter } from 'expo-router';
import { Heart, ShieldCheck, Wind, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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

  // 1. Breathing Animation Loop (Inhale 4s, Hold 2s, Exhale 4s)
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

    // Rotate quotes every 8 seconds
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOS MODE</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          onPress={() => setMode('breathe')} 
          style={[styles.tab, mode === 'breathe' && styles.activeTab]}
        >
          <Wind color={mode === 'breathe' ? '#000' : '#666'} size={20} />
          <Text style={[styles.tabText, mode === 'breathe' && styles.activeTabText]}>Breathe</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setMode('reasons')} 
          style={[styles.tab, mode === 'reasons' && styles.activeTab]}
        >
          <ShieldCheck color={mode === 'reasons' ? '#000' : '#666'} size={20} />
          <Text style={[styles.tabText, mode === 'reasons' && styles.activeTabText]}>My Reasons</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {mode === 'breathe' ? (
          // BREATHING VIEW
          <View style={styles.centerContainer}>
             <Text style={styles.instruction}>Inhale... Hold... Exhale</Text>
             <View style={styles.circleWrapper}>
                {/* The Pulsing Circles */}
                <Animated.View 
                  style={[
                    styles.breathingCircle, 
                    { transform: [{ scale: scaleAnim }] }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.breathingCircle, 
                    { transform: [{ scale: scaleAnim }], opacity: 0.3, width: 250, height: 250 }
                  ]} 
                />
             </View>
             <Text style={styles.quote}>"{MOTIVATION[textIndex]}"</Text>
          </View>
        ) : (
          // REASONS VIEW
          <View style={styles.reasonsContainer}>
            {REASONS.map((reason, index) => (
              <View key={index} style={styles.reasonCard}>
                <Heart color="#EF4444" fill="#EF4444" size={20} />
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
            <Text style={styles.subtext}>Remember why you started.</Text>
          </View>
        )}
      </View>

      {/* Bottom Button */}
      <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
        <Text style={styles.exitText}>I'm Feeling Better</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' }, // Very dark blue/black
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  closeBtn: { padding: 8, backgroundColor: '#374151', borderRadius: 20 },
  
  // Tabs
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 40 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#1F2937' },
  activeTab: { backgroundColor: '#fff' },
  tabText: { color: '#9CA3AF', fontWeight: '600' },
  activeTabText: { color: '#000' },

  content: { flex: 1, justifyContent: 'center' },
  
  // Breathe Styles
  centerContainer: { alignItems: 'center' },
  instruction: { color: '#9CA3AF', fontSize: 18, marginBottom: 40 },
  circleWrapper: { height: 300, justifyContent: 'center', alignItems: 'center' },
  breathingCircle: { 
    width: 180, 
    height: 180, 
    borderRadius: 100, 
    backgroundColor: '#60A5FA', // Calming Blue
    opacity: 0.5,
    position: 'absolute'
  },
  quote: { color: '#fff', fontSize: 18, textAlign: 'center', paddingHorizontal: 40, marginTop: 40, fontStyle: 'italic' },

  // Reasons Styles
  reasonsContainer: { paddingHorizontal: 30 },
  reasonCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1F2937', padding: 20, borderRadius: 12, marginBottom: 12 },
  reasonText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  subtext: { color: '#6B7280', textAlign: 'center', marginTop: 20 },

  // Footer
  exitButton: { margin: 20, backgroundColor: '#10B981', padding: 18, borderRadius: 16, alignItems: 'center' },
  exitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});