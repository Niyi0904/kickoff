import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../lib/data';

const DEMO_ROLES: { role: UserRole; label: string; email: string; desc: string; color: string }[] = [
  { role: 'player', label: 'Player', email: 'emeka@lfc.ng', desc: 'View your profile & stats', color: '#4D7EFF' },
  { role: 'manager', label: 'Team Manager', email: 'manager@lfc.ng', desc: 'Manage your team', color: '#FFB800' },
  { role: 'admin', label: 'League Admin', email: 'admin@lagosfa.ng', desc: 'Full admin access', color: '#00E676' },
];

export default function SignInScreen({ navigation }: any) {
  const { login, loginAsRole } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemos, setShowDemos] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch {
      setError('Invalid credentials. Try a demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (role: UserRole) => {
    loginAsRole(role);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.container}>
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

        {/* Demo accounts */}
        <View style={styles.demoSection}>
          <TouchableOpacity
            style={styles.demoToggle}
            onPress={() => setShowDemos(!showDemos)}
            activeOpacity={0.8}
          >
            <Text style={styles.demoToggleText}>Try a demo account</Text>
            <Text style={[styles.demoToggleArrow, showDemos && styles.demoToggleArrowOpen]}>▼</Text>
          </TouchableOpacity>

          {showDemos && (
            <View style={styles.demoList}>
              {DEMO_ROLES.map(({ role, label, email: dEmail, desc, color }) => (
                <TouchableOpacity
                  key={role}
                  style={styles.demoItem}
                  onPress={() => handleDemo(role)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.demoIcon, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
                    <Text style={styles.demoIconText}>
                      {role === 'player' ? '👤' : role === 'manager' ? '🎯' : '⚙️'}
                    </Text>
                  </View>
                  <View style={styles.demoInfo}>
                    <Text style={styles.demoLabel}>{label}</Text>
                    <Text style={styles.demoDesc}>{desc}</Text>
                  </View>
                  <Text style={[styles.demoEnter, { color }]}>Enter →</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  demoToggleArrow: {
    fontSize: 12,
    color: '#5A6880',
    transform: [{ rotate: '0deg' }],
  },
  demoToggleArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  demoList: {
    marginTop: 8,
    gap: 8,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 12,
  },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoIconText: {
    fontSize: 16,
  },
  demoInfo: {
    flex: 1,
  },
  demoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0F4FF',
  },
  demoDesc: {
    fontSize: 12,
    color: '#5A6880',
  },
  demoEnter: {
    fontSize: 12,
    fontWeight: '600',
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