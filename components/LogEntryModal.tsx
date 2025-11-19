import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, CheckCircle2, Heart, Plus, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type LogType = 'urge' | 'relapse';

// 1. THE 8 GLOBAL DEFAULTS
const DEFAULT_MOODS = [
  'Anxious', 'Stressed', 'Bored', 'Craving', 
  'Hopeful', 'Tired', 'Lonely', 'Angry'
];

const MOOD_STORAGE_KEY = 'user_personalized_moods';

interface LogEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: LogType;
}

export const LogEntryModal = ({ visible, onClose, onSuccess, initialType = 'urge' }: LogEntryModalProps) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [type, setType] = useState<LogType>(initialType);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  
  // State for the dynamic list of 8 moods
  const [currentMoodList, setCurrentMoodList] = useState<string[]>(DEFAULT_MOODS);

  // Animation refs
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  // Load personalization on open
  useEffect(() => {
    if (visible) {
      setType(initialType);
      setMood('');
      setNotes('');
      loadMoodList();
      
      // Entrance animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle rotation
      Animated.loop(
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      // Reset animation values
      slideAnim.setValue(600);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, initialType]);

  const sparkleRotation = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const loadMoodList = async () => {
    try {
      const stored = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
      if (stored) {
        setCurrentMoodList(JSON.parse(stored));
      } else {
        // First time? Use defaults
        setCurrentMoodList(DEFAULT_MOODS);
      }
    } catch (error) {
      console.log('Failed to load moods', error);
    }
  };

  const handleSubmit = async () => {
    if (!mood.trim()) {
      Alert.alert('Required', 'Please select or type how you are feeling.');
      return;
    }

    const standardizedMood = mood.trim();

    setLoading(true);
    try {
      // 1. Save to Database
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Not authenticated');

      const supabase = createSupabaseClient(token);
      const { error } = await supabase.from('logs').insert({
        type,
        mood: standardizedMood,
        notes,
      });

      if (error) throw error;

      // 2. Update Personal List (LRU Logic)
      await updatePersonalMoods(standardizedMood);

      onSuccess();
      onClose();
      Alert.alert('Saved', 'Your entry has been recorded.');

    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Add new mood to top, keep list at 8
  const updatePersonalMoods = async (newMood: string) => {
    // Check if it's already in the list
    const exists = currentMoodList.some(m => m.toLowerCase() === newMood.toLowerCase());
    
    // If it's already there, we don't need to change the order (keeps muscle memory)
    // If it's NEW, we prepend it and drop the last one.
    if (!exists) {
      const newList = [newMood, ...currentMoodList].slice(0, 8); // Keep exactly 8
      setCurrentMoodList(newList);
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(newList));
    }
  };

  const getMoodEmoji = (moodText: string) => {
    const emojiMap: { [key: string]: string } = {
      'Anxious': '😰',
      'Stressed': '😓',
      'Bored': '😑',
      'Craving': '😣',
      'Hopeful': '🌟',
      'Tired': '😴',
      'Lonely': '😔',
      'Angry': '😠',
    };
    return emojiMap[moodText] || '💭';
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      {/* 1. Outer Overlay (Fade Animation) */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        
        {/* 2. Inner Modal Container (Slide & Scale Animation) */}
        <Animated.View 
          style={[
            styles.modalContainer, 
            { 
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ] 
            }
          ]}
        >
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Animated.View style={{ transform: [{ rotate: sparkleRotation }] }}>
                <Sparkles size={24} color="#10B981" />
              </Animated.View>
              <Text style={styles.title}>Log Your Journey</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X color="#6B7280" size={22} />
            </TouchableOpacity>
          </View>

          {/* Type Selector with Icons */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, type === 'urge' && styles.activeSegmentUrge]} 
              onPress={() => setType('urge')}
              activeOpacity={0.8}
            >
              <View style={styles.segmentContent}>
                <Heart 
                  size={18} 
                  color={type === 'urge' ? '#0284C7' : '#9CA3AF'} 
                  fill={type === 'urge' ? '#0284C7' : 'transparent'}
                />
                <Text style={[styles.segmentText, type === 'urge' && styles.activeTextUrge]}>
                  Check-In
                </Text>
              </View>
              {type === 'urge' && (
                <View style={styles.activeIndicator}>
                  <CheckCircle2 size={16} color="#0284C7" />
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.segmentBtn, type === 'relapse' && styles.activeSegmentRelapse]} 
              onPress={() => setType('relapse')}
              activeOpacity={0.8}
            >
              <View style={styles.segmentContent}>
                <AlertCircle 
                  size={18} 
                  color={type === 'relapse' ? '#DC2626' : '#9CA3AF'}
                  fill={type === 'relapse' ? '#DC2626' : 'transparent'}
                />
                <Text style={[styles.segmentText, type === 'relapse' && styles.activeTextRelapse]}>
                  Relapse
                </Text>
              </View>
              {type === 'relapse' && (
                <View style={[styles.activeIndicator, { backgroundColor: '#FEE2E2' }]}>
                  <CheckCircle2 size={16} color="#DC2626" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* MOOD SECTION */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>How are you feeling?</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              
              <View style={styles.chipContainer}>
                {currentMoodList.map((m, index) => (
                  <TouchableOpacity 
                    key={m} 
                    style={[
                      styles.chip, 
                      mood === m && (type === 'urge' ? styles.activeChipUrge : styles.activeChipRelapse)
                    ]}
                    onPress={() => setMood(m)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipEmoji}>{getMoodEmoji(m)}</Text>
                    <Text style={[
                      styles.chipText, 
                      mood === m && styles.activeChipText
                    ]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Mood Input */}
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Or type your own feeling..." 
                  placeholderTextColor="#9CA3AF"
                  value={mood}
                  onChangeText={setMood}
                />
                {/* Visual indicator that typing adds a new tag */}
                {mood.length > 0 && !currentMoodList.includes(mood) && (
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.addIndicator}
                  >
                    <Plus size={12} color="#fff" />
                    <Text style={styles.addText}>Add New</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {/* NOTES SECTION */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>What's on your mind?</Text>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
              
              <View style={styles.textAreaWrapper}>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Share what triggered this feeling, or any thoughts you'd like to remember..." 
                  placeholderTextColor="#9CA3AF"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
                <View style={styles.characterCount}>
                  <Text style={styles.characterCountText}>{notes.length} characters</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.saveBtn,
                  (!mood.trim() || loading) && styles.saveBtnDisabled
                ]} 
                onPress={handleSubmit}
                disabled={!mood.trim() || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <LinearGradient
                    colors={type === 'urge' ? ['#0EA5E9', '#0284C7'] : ['#EF4444', '#DC2626']}
                    style={styles.saveGradient}
                  >
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.saveText}>Save Entry</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <View style={styles.helperContainer}>
              <Heart size={14} color="#10B981" fill="#10B981" />
              <Text style={styles.helperText}>
                Every entry is a step forward in your recovery journey
              </Text>
            </View>
          </ScrollView>

        </Animated.View> 
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'flex-end' 
  }, 
  modalContainer: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    paddingTop: 28,
    height: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#111827',
    letterSpacing: -0.5,
  },
  closeBtn: { 
    padding: 10, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  segmentContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 20, 
    padding: 6, 
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  segmentBtn: { 
    flex: 1, 
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center', 
    borderRadius: 16,
    position: 'relative',
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeSegmentUrge: { 
    backgroundColor: '#DBEAFE', 
    shadowColor: '#0284C7', 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 3,
  },
  activeSegmentRelapse: { 
    backgroundColor: '#FEE2E2', 
    shadowColor: '#DC2626', 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 3,
  },
  segmentText: { 
    fontWeight: '700', 
    color: '#6B7280',
    fontSize: 15,
  },
  activeTextUrge: { 
    color: '#0284C7',
  },
  activeTextRelapse: { 
    color: '#DC2626',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 2,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  section: {
    marginBottom: 28,
  },

  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  label: { 
    fontSize: 15, 
    fontWeight: '800', 
    color: '#111827',
    letterSpacing: -0.2,
  },
  requiredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  
  // Chip Styles
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10, 
    marginBottom: 16,
  },
  chip: { 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 24, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 2, 
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeChipUrge: { 
    backgroundColor: '#DBEAFE', 
    borderColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  activeChipRelapse: { 
    backgroundColor: '#FEE2E2', 
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  chipEmoji: {
    fontSize: 16,
  },
  chipText: { 
    color: '#374151', 
    fontWeight: '700', 
    fontSize: 14,
    letterSpacing: -0.2,
  },
  activeChipText: { 
    color: '#111827',
  },

  inputWrapper: { 
    position: 'relative',
  },
  input: { 
    borderWidth: 2, 
    borderColor: '#E5E7EB', 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 15, 
    backgroundColor: '#FAFAFA', 
    color: '#111827',
    fontWeight: '500',
  },
  textAreaWrapper: {
    position: 'relative',
  },
  textArea: { 
    height: 140, 
    textAlignVertical: 'top',
    paddingBottom: 36,
  },
  characterCount: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },

  addIndicator: { 
    position: 'absolute', 
    right: 12, 
    top: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addText: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#fff',
    letterSpacing: 0.3,
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 16,
  },
  saveBtn: { 
    flex: 2,
    borderRadius: 16, 
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 12, 
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveGradient: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: 16,
    letterSpacing: 0.3,
  },

  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  helperText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    textAlign: 'center',
  },
});