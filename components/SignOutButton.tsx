import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to the Welcome screen (Auth group)
      router.replace('/(auth)/welcome');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleSignOut}>
      <Text style={styles.text}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff4444', // Red for "danger/exit" action
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});