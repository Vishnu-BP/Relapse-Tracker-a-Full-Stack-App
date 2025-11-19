import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Helper: Finish auth session if app was closed during login
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  // 2. Helper: Warm up browser on Android for faster load
  useWarmUpBrowser();

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  
  // 3. Hook: Use the new Standard SSO hook (replaces useOAuth)
  const { startSSOFlow } = useSSO();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  // --- ACTION: Handle Email/Password Login ---
  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err.errors ? err.errors[0].message : 'Something went wrong');
    }
  };

  // --- ACTION: Handle Google Login ---
  const onGooglePress = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err) {
      // Ignore "User cancelled" errors
      if (JSON.stringify(err).includes('cancelled')) return;
      console.error('SSO error', err);
      Alert.alert('Google Error', 'Could not sign in with Google.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        {/* Google Button */}
        <TouchableOpacity style={styles.googleButton} onPress={onGooglePress}>
          {/* Text-based icon for simplicity */}
          <Text style={styles.googleButtonText}>G   Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            autoCapitalize="none"
            style={styles.input}
            value={emailAddress}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            onChangeText={setEmailAddress}
          />
          
          <Text style={[styles.label, {marginTop: 15}]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={onSignInPress}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Light Background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    color: '#333',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});