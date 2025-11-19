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
        
        {/* Header with motivational touch */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>
          <Text style={styles.title}>Welcome..!</Text>
          <Text style={styles.subtitle}>Your journey to recovery continues here</Text>
        </View>

        {/* Google Button with refined styling */}
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={onGooglePress}
          activeOpacity={0.7}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Elegant Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign in with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email Form with improved styling */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={emailAddress}
              placeholder="your.email@example.com"
              placeholderTextColor="#A0A0A0"
              onChangeText={setEmailAddress}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter your password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry={true}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onSignInPress}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Link with better spacing */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Motivational footer note */}
        <View style={styles.motivationalFooter}>
          <Text style={styles.motivationalText}>Every step forward is progress</Text>
        </View>
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC', // Soft blue-gray background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9', // Light green background
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 10,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    color: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  primaryButton: {
    backgroundColor: '#10B981', // Calming green for recovery theme
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 15,
  },
  link: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 15,
  },
  motivationalFooter: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  motivationalText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});