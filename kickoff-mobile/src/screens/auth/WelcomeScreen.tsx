import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useApp } from '../../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: any) {
  const { loginAsRole } = useApp();

  const handleGuest = () => {
    loginAsRole('guest');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  return (
    <View style={styles.container}>
      {/* Hero */}
      <View style={styles.hero}>
        {/* Background pattern */}
        <View style={styles.patternContainer}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.patternCircle,
                { width: (i + 1) * 120, height: (i + 1) * 120, opacity: 0.04 },
              ]}
            />
          ))}
        </View>

        <View style={styles.heroContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>⚽</Text>
            </View>
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              YOUR LEAGUE.{'\n'}
              <Text style={styles.heroTitleAccent}>YOUR WAY.</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Follow fixtures, track standings, and manage your team — all in one place.
            </Text>
          </View>

          {/* Feature pills */}
          <View style={styles.featurePills}>
            {['Live Fixtures', 'League Standings', 'Player Stats', 'Team Management'].map(f => (
              <View key={f} style={styles.pill}>
                <Text style={styles.pillText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('SignIn')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.9}
        >
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuest}
        >
          <Text style={styles.guestButtonText}>Browse as Guest →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09101E',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  patternContainer: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  logoContainer: {
    marginBottom: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
    elevation: 10,
  },
  logoText: {
    fontSize: 40,
  },
  heroTextContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'sans-serif',
    fontSize: 42,
    fontWeight: '800',
    color: '#F0F4FF',
    lineHeight: 44,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: '#00E676',
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#7A8699',
    marginTop: 16,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: 12,
    color: '#7A8699',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 12,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: '#00E676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#09101E',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#F0F4FF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButtonText: {
    color: '#5A6880',
    fontSize: 14,
  },
});