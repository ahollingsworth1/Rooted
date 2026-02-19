import { auth } from '@/lib/firebase';
import { router } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e.code === 'auth/invalid-credential' ? 'Incorrect email or password.'
        : e.code === 'auth/email-already-in-use' ? 'An account with this email already exists.'
        : e.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : 'Something went wrong. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FAF6F0' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('@/assets/images/root_image.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>rooted</Text>
          <Text style={styles.tagline}>A devotional for two</Text>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>✦</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#C4A882"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#C4A882"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF8F0" />
              : <Text style={styles.buttonText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchLink}>{isSignUp ? 'Sign in' : 'Sign up'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          "Two are better than one." — Ecclesiastes 4:9
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FAF6F0', paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },

  // Logo
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 90, height: 90, marginBottom: 12 },
  appName: { fontSize: 42, fontWeight: '800', color: '#6B3A2A', letterSpacing: -1.5, lineHeight: 44 },
  tagline: { fontSize: 14, color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 6, opacity: 0.8 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E8D9C5' },
  dividerSymbol: { color: '#C8956C', fontSize: 10, marginHorizontal: 10 },

  // Form
  form: { width: '100%' },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#3D2B1F', marginBottom: 24, textAlign: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#A0522D', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    fontSize: 15, color: '#3D2B1F', marginBottom: 16,
    borderWidth: 1, borderColor: '#EDE0D4',
  },
  button: {
    backgroundColor: '#A0522D', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#FFF8F0', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  switchRow: { alignItems: 'center', marginTop: 20 },
  switchText: { fontSize: 14, color: '#8B6347' },
  switchLink: { color: '#A0522D', fontWeight: '700' },

  // Footer
  footer: { textAlign: 'center', color: '#A0522D', fontSize: 13, fontStyle: 'italic', marginTop: 48, opacity: 0.7 },
});