import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';

const SARA_COLORS = {
  background: '#F8F5F3',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  badgeBackground: '#CCE6DE',
};

const AppointmentsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Appointments</Text>
          <Text style={styles.subtitle}>We&apos;ll surface upcoming visits here soon.</Text>
        </View>
        <View style={styles.placeholderCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Coming soon</Text>
          </View>
          <Text style={styles.placeholderTitle}>Your calendar, powered by Sara</Text>
          <Text style={styles.placeholderCopy}>
            You&apos;ll be able to review appointments, confirm visits, and manage reschedules
            without leaving the app.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 24,
  },
  hero: {
    gap: 8,
  },
  title: {
    color: SARA_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 12,
    shadowColor: '#16273D',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SARA_COLORS.badgeBackground,
  },
  badgeText: {
    color: SARA_COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  placeholderTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderCopy: {
    color: SARA_COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
});

export default AppointmentsScreen;
