import { useTheme } from '@/context/ThemeContext';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router'; // <--- 1. Import this
import {
  Bell,
  ChevronRight,
  Heart,
  LogOut,
  Mail,
  Moon,
  Shield
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter(); // <--- 2. Initialize router
  
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    try {
      await signOut();
      // 3. Force navigation back to the Auth group
      router.replace('/(auth)/welcome'); 
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  // ... The rest of your component stays exactly the same ...
  
  const SectionItem = ({ icon: Icon, label, value, onPress, isToggle = false, color = '#000' }: any) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]} 
      onPress={onPress} 
      disabled={isToggle} 
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <Icon size={20} color={color} />
        </View>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      
      {isToggle ? (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: '#767577', true: '#000' }}
          thumbColor={'#fff'}
        />
      ) : (
        <ChevronRight size={20} color={colors.subtext} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>

        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <Image 
            source={{ uri: user?.imageUrl }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.fullName || user?.firstName || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.subtext }]}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionItem 
            icon={Moon} 
            label="Dark Mode" 
            isToggle 
            value={isDark}
            onPress={toggleTheme}
            color="#6366F1"
          />
           <SectionItem 
            icon={Bell} 
            label="Daily Reminders" 
            isToggle 
            value={true} 
            onPress={() => {}}
            color="#F59E0B"
          />
        </View>

        {/* SUPPORT */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <SectionItem 
            icon={Heart} 
            label="Rate App" 
            onPress={() => Alert.alert('Thanks!', 'Rating feature coming soon.')}
            color="#EF4444"
          />
          <SectionItem 
            icon={Mail} 
            label="Contact Support" 
            onPress={() => Alert.alert('Contact', 'vishnubp71@gmail.com')}
            color="#10B981"
          />
          <SectionItem 
            icon={Shield} 
            label="Privacy Policy" 
            onPress={() => {}}
            color="#3B82F6"
          />
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.item} onPress={handleSignOut}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <LogOut size={20} color="#DC2626" />
              </View>
              <Text style={[styles.itemLabel, { color: '#DC2626' }]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Tech Stack Used</Text>
        <Text style={styles.versionText}>React Native | Expo | Clerk | Supabase </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  headerTitle: { fontSize: 32, fontWeight: '800', marginBottom: 20 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 16, backgroundColor: '#eee' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  sectionHeader: { fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  section: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemLabel: { fontSize: 16, fontWeight: '500' },
  versionText: { textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 20 },
});