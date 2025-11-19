import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  // 1. Handle User Sign Up (Create the account)
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Error', err.errors[0].message);
    }
  };

  // 2. Handle Verification (Enter the code from email)
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/(tabs)'); // Redirect to Home
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors[0].message);
    }
  };

  // VIEW: Verification Mode
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✉️</Text>
              </View>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a verification code to{'\n'}
                <Text style={styles.email}>{emailAddress}</Text>
              </Text>
            </View>
            
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={(code) => setCode(code)}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.button, !code && styles.buttonDisabled]} 
                onPress={onVerifyPress}
                disabled={!code}
              >
                <Text style={styles.buttonText}>Verify & Continue</Text>
              </TouchableOpacity>

              <Text style={styles.helperText}>
                Didn't receive the code? Check your spam folder
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // VIEW: Sign Up Mode
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🌱</Text>
            </View>
            <Text style={styles.title}>Begin Your Journey</Text>
            <Text style={styles.subtitle}>
              Take the first step towards a healthier you
            </Text>
          </View>
          
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                autoCapitalize="none"
                style={styles.input}
                value={emailAddress}
                placeholder="your@email.com"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                onChangeText={(email) => setEmailAddress(email)}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                placeholder="Create a secure password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={true}
                onChangeText={(password) => setPassword(password)}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, (!emailAddress || !password) && styles.buttonDisabled]} 
              onPress={onSignUpPress}
              disabled={!emailAddress || !password}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: '#4B5563',
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: '#6B7280',
  },
  link: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});