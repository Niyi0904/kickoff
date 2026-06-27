import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { SignInScreenProps } from '../../navigation/types';
import { signIn } from '../../firebase/auth';

export default function SignInScreen({ navigation }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e: any) {
      setError(e.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Kickoff account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#5A6880"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#5A6880"
                style={[styles.input, { paddingRight: 44 }]}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPass(!showPass)}>
                <Text style={styles.eyeIcon}>{showPass ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#09101E" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo accounts (prefill only) */}
        <View style={styles.demoSection}>
          <TouchableOpacity
            style={styles.demoToggle}
            onPress={() => { setEmail('admin@lagosfa.ng'); setPassword('password123'); }}
            activeOpacity={0.8}
          >
            <Text style={styles.demoToggleText}>Prefill demo account (admin)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09101E',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#F0F4FF',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  titleSection: {
    marginTop: 28,
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#7A8699',
    marginTop: 6,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#7A8699',
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 18,
    fontSize: 14,
    color: '#5A6880',
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#F0F4FF',
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#5A6880',
  },
  errorBox: {
    backgroundColor: 'rgba(255,61,90,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,61,90,0.3)',
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 13,
    color: '#FF3D5A',
  },
  submitButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#1B2540',
  },
  submitButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 28,
  },
  demoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  demoToggleText: {
    fontSize: 14,
    color: '#B8C4D8',
    fontWeight: '500',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#5A6880',
  },
  footerLink: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600',
  },
});