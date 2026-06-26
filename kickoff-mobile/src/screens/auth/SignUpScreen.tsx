import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { SignUpScreenProps } from '../../navigation/types';
import { signUp } from '../../firebase/auth';

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await signUp(form.email, form.password, form.name);
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
          <Text style={styles.doneTitle}>Account Created!</Text>
          <Text style={styles.doneSubtitle}>Welcome to Lagos Premier League</Text>
        </View>
      </View>
    );
  }

  const inputStyle = {
    width: '100%' as const,
    height: 52,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#F0F4FF',
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.progressBar}>
            {[1, 2].map(s => (
              <View
                key={s}
                style={[styles.progressDot, s <= step ? styles.progressDotActive : styles.progressDotInactive]}
              />
            ))}
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.formTitle}>
          {step === 1 ? 'Create Account' : 'Set Password'}
        </Text>
        <Text style={styles.formSubtitle}>
          {step === 1 ? 'Join the Lagos Premier League platform' : 'Secure your account with a strong password'}
        </Text>

        {step === 1 ? (
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput value={form.name} onChangeText={v => update('name', v)} placeholder="Your full name" placeholderTextColor="#5A6880" style={inputStyle} />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput value={form.email} onChangeText={v => update('email', v)} placeholder="you@example.com" placeholderTextColor="#5A6880" style={inputStyle} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>
            <TouchableOpacity
              style={[styles.continueButton, (!form.name || !form.email) && styles.continueButtonDisabled]}
              onPress={() => form.name && form.email && setStep(2)}
              disabled={!form.name || !form.email}
            >
              <Text style={[styles.continueButtonText, (!form.name || !form.email) && styles.continueButtonTextDisabled]}>Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  value={form.password}
                  onChangeText={v => update('password', v)}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#5A6880"
                  style={[inputStyle, { paddingRight: 44 }]}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPass(!showPass)}>
                  <Text style={styles.eyeIcon}>{showPass ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  value={form.confirm}
                  onChangeText={v => update('confirm', v)}
                  placeholder="Repeat password"
                  placeholderTextColor="#5A6880"
                  style={[inputStyle, form.confirm && form.confirm !== form.password ? { borderColor: 'rgba(255,61,90,0.5)' } : null]}
                  secureTextEntry
                />
              </View>
              {form.confirm && form.confirm !== form.password && (
                <Text style={styles.passwordMismatch}>Passwords don't match</Text>
              )}
            </View>

            {/* Strength indicator */}
            {form.password ? (
              <View>
                <View style={styles.strengthBar}>
                  {[...Array(4)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthDot,
                        { backgroundColor: i < (form.password.length >= 12 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : 1) ? '#00E676' : 'rgba(255,255,255,0.08)' },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.strengthLabel}>
                  {form.password.length >= 12 ? 'Strong' : form.password.length >= 8 ? 'Good' : form.password.length >= 6 ? 'Fair' : 'Weak'}
                </Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.continueButton, (loading || !form.password || form.password !== form.confirm) && styles.continueButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading || !form.password || form.password !== form.confirm}
            >
              {loading ? (
                <ActivityIndicator color="#09101E" />
              ) : (
                <Text style={[styles.continueButtonText, (loading || !form.password || form.password !== form.confirm) && styles.continueButtonTextDisabled]}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerLink}>Sign In</Text>
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
  },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    flexShrink: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  progressBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#00E676',
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  formTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F0F4FF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 15,
    color: '#7A8699',
    marginBottom: 32,
  },
  formFields: {
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
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  eyeIcon: {
    fontSize: 16,
    color: '#5A6880',
  },
  passwordMismatch: {
    fontSize: 12,
    color: '#FF3D5A',
    marginTop: 6,
  },
  strengthBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  strengthDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    color: '#5A6880',
  },
  continueButton: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#1B2540',
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
  continueButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
  continueButtonTextDisabled: {
    color: '#5A6880',
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