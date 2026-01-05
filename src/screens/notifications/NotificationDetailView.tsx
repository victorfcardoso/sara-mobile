import React from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIORITY_STYLES, getNotificationColors, TYPE_STYLES } from './constants';
import { NotificationDetail } from './types';
import { NotificationGlyph } from './NotificationGlyph';
import { useIsDarkMode } from '@/hooks/useSaraColors';

type NotificationDetailViewProps = {
  notification: NotificationDetail;
  onBack: () => void;
  onResolve: () => void;
  onDismiss: () => void;
};

const formatLabel = (rawKey: string): string => {
  if (!rawKey) {
    return '';
  }
  return rawKey
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase());
};

export const NotificationDetailView = ({
  notification,
  onBack,
  onResolve,
  onDismiss,
}: NotificationDetailViewProps) => {
  const insets = useSafeAreaInsets();
  const isDark = useIsDarkMode();
  const colors = getNotificationColors(isDark);

  const priorityStyle = PRIORITY_STYLES[notification.priority];
  const typeStyle = TYPE_STYLES[notification.type];
  const contextEntries = notification.context ? Object.entries(notification.context) : [];
  const actionItems = notification.relatedActions ?? [];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
          <Text style={[styles.backText, { color: colors.textSecondary }]}>{'‹'} Back</Text>
        </Pressable>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: typeStyle.badgeBackground, borderColor: typeStyle.badgeText },
              ]}>
              <NotificationGlyph type={notification.type} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{notification.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{notification.description}</Text>
              <Text style={[styles.timestampLabel, { color: colors.muted }]}>{notification.time}</Text>
            </View>
          </View>

          <View style={styles.metaSection}>
            <View
              style={[
                styles.priorityPill,
                {
                  backgroundColor: priorityStyle.backgroundColor,
                },
              ]}>
              <Text
                style={[
                  styles.priorityText,
                  {
                    color: priorityStyle.textColor,
                  },
                ]}>
                {priorityStyle.label}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.muted }]}>Customer</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{notification.customerName}</Text>
            </View>
            {notification.customerPhone ? (
              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: colors.muted }]}>Phone</Text>
                <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{notification.customerPhone}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, { color: colors.muted }]}>Timestamp</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{notification.timestamp}</Text>
            </View>
          </View>

          {contextEntries.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Context</Text>
              {contextEntries.map(([key, value]) => (
                <View key={key} style={[styles.contextRow, { backgroundColor: colors.contextRowBackground }]}>
                  <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>{formatLabel(key)}</Text>
                  <Text style={[styles.contextValue, { color: colors.textPrimary }]}>
                    {typeof value === 'string' || typeof value === 'number'
                      ? String(value)
                      : JSON.stringify(value)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {actionItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
              {actionItems.map(action => (
                <View key={action.id} style={styles.actionRow}>
                  <View style={[styles.actionDot, { backgroundColor: colors.accent }]} />
                  <View style={styles.actionText}>
                    <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                    <Text style={[styles.actionTimestamp, { color: colors.muted }]}>{action.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onResolve}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.accent }, pressed && styles.primaryButtonPressed]}
            accessibilityRole="button">
            <Text style={[styles.primaryButtonText, { color: isDark ? colors.textPrimary : '#FFFFFF' }]}>Mark as resolved</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.secondaryButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && styles.secondaryButtonPressed,
            ]}
            accessibilityRole="button">
            <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>Dismiss</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backText: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: 'inter-semibold-20',
    fontSize: 18,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: 'inter-normal-20',
    fontSize: 15,
    lineHeight: 20,
  },
  timestampLabel: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
  },
  metaSection: {
    gap: 12,
  },
  priorityPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priorityText: {
    fontFamily: 'inter-medium-24',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
  },
  metaValue: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'inter-semibold-20',
    fontSize: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  contextRow: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  contextLabel: {
    fontFamily: 'inter-medium-24',
    fontSize: 13,
  },
  contextValue: {
    fontFamily: 'inter-semibold-20',
    fontSize: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
  },
  actionTimestamp: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    fontFamily: 'inter-semibold-20',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
  },
});

export type { NotificationDetail } from './types';
