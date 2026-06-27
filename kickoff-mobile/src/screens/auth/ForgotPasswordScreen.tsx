import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { ForgotPasswordScreenProps } from '../../navigation/types';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>Check Your Email</Text>
          <Text style={styles.doneSubtitle}>We've sent a password reset link to {email}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
        </View>

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

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleReset}
            disabled={loading || !email}
          >
            {loading ? (
              <ActivityIndicator color="#09101E" />
            ) : (
              <Text style={styles.submitButtonText}>Send Reset Email</Text>
            )}
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneContainer: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,230,118,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: {
    fontSize: 40,
    color: '#00E676',
    fontWeight: '700',
  },
  doneTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
  },
  doneSubtitle: {
    fontSize: 14,
    color: '#7A8699',
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  backButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
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
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#1B2540',
  },
  submitButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
});