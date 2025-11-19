import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  // 1. LOGIC: If the user is logged in, redirect them to the Home Tabs immediately.
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // 2. UI: If not logged in, show the Auth Screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen 
        name="sign-in" 
        options={{ headerShown: true, title: 'Sign In', headerBackTitle: 'Back' }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ headerShown: true, title: 'Create Account', headerBackTitle: 'Back' }} 
      />
    </Stack>
  );
}