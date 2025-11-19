import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type LogType = 'urge' | 'relapse';

interface LogEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LogEntryModal = ({ visible, onClose, onSuccess }: LogEntryModalProps) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [type, setType] = useState<LogType>('urge');
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!mood.trim()) {
      Alert.alert('Required', 'Please enter your current mood.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Not authenticated');

      const supabase = createSupabaseClient(token);

      const { error } = await supabase.from('logs').insert({
        type,   // 'urge' or 'relapse'
        mood,
        notes,
      });

      if (error) throw error;

      // Reset and close
      setMood('');
      setNotes('');
      setType('urge');
      onSuccess(); // Refresh parent data if needed
      onClose();
      Alert.alert('Saved', 'Your log has been recorded.');

    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>New Entry</Text>

          {/* Type Selector (Urge vs Relapse) */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity 
              style={[styles.segmentBtn, type === 'urge' && styles.activeSegment]} 
              onPress={() => setType('urge')}
            >
              <Text style={[styles.segmentText, type === 'urge' && styles.activeText]}>Urge</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.segmentBtn, type === 'relapse' && styles.activeSegment]} 
              onPress={() => setType('relapse')}
            >
              <Text style={[styles.segmentText, type === 'relapse' && styles.activeText]}>Relapse</Text>
            </TouchableOpacity>
          </View>

          {/* Mood Input */}
          <Text style={styles.label}>How are you feeling?</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g., Anxious, Bored, Stressed" 
            value={mood}
            onChangeText={setMood}
          />

          {/* Notes Input */}
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="What triggered this?" 
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Action Buttons */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.saveBtn} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4, marginBottom: 20 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 6 },
  activeSegment: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  segmentText: { fontWeight: '600', color: '#666' },
  activeText: { color: '#000' },

  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  textArea: { height: 80, textAlignVertical: 'top' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 15, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { backgroundColor: '#000', padding: 15, borderRadius: 8, flex: 1, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },
});