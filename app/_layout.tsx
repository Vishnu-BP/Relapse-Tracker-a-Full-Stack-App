import { ThemeProvider } from '@/context/ThemeContext'; // <--- 1. Import the Provider
import { tokenCache } from '@/lib/clerk';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Fetch key from .env
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        {/* 2. Wrap your App with ThemeProvider */}
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* 1. The Auth Group (Welcome, Login, Signup) */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            
            {/* 2. The Main App (Tabs) */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* 3. Modals */}
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}