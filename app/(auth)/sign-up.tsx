import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
        <View style={styles.form}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>We sent a code to {emailAddress}</Text>
          
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor="#999"
            onChangeText={(code) => setCode(code)}
          />
          
          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify & Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // VIEW: Sign Up Mode
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputGroup}>
          <TextInput
            autoCapitalize="none"
            style={styles.input}
            value={emailAddress}
            placeholder="Enter email"
            placeholderTextColor="#999"
            onChangeText={(email) => setEmailAddress(email)}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry={true}
            onChangeText={(password) => setPassword(password)}
          />
        </View>
        
        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  form: {
    marginTop: 40,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputGroup: {
    gap: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
});