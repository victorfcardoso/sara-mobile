import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRIORITY_STYLES, COLORS, TYPE_STYLES } from './constants';
import { NotificationDetail } from './types';
import { NotificationGlyph } from './NotificationGlyph';

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

  const priorityStyle = PRIORITY_STYLES[notification.priority];
  const typeStyle = TYPE_STYLES[notification.type];
  const contextEntries = notification.context ? Object.entries(notification.context) : [];
  const actionItems = notification.relatedActions ?? [];

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
          <Text style={styles.backText}>{'‹'} Back</Text>
        </Pressable>

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: typeStyle.badgeBackground, borderColor: typeStyle.badgeText },
              ]}>
              <NotificationGlyph type={notification.type} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.description}>{notification.description}</Text>
              <Text style={styles.timestampLabel}>{notification.time}</Text>
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
              <Text style={styles.metaLabel}>Customer</Text>
              <Text style={styles.metaValue}>{notification.customerName}</Text>
            </View>
            {notification.customerPhone ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Phone</Text>
                <Text style={styles.metaValue}>{notification.customerPhone}</Text>
              </View>
            ) : null}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Timestamp</Text>
              <Text style={styles.metaValue}>{notification.timestamp}</Text>
            </View>
          </View>

          {contextEntries.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Context</Text>
              {contextEntries.map(([key, value]) => (
                <View key={key} style={styles.contextRow}>
                  <Text style={styles.contextLabel}>{formatLabel(key)}</Text>
                  <Text style={styles.contextValue}>
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
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {actionItems.map(action => (
                <View key={action.id} style={styles.actionRow}>
                  <View style={styles.actionDot} />
                  <View style={styles.actionText}>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                    <Text style={styles.actionTimestamp}>{action.timestamp}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onResolve}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Mark as resolved</Text>
          </Pressable>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Dismiss</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.textSecondary,
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  description: {
    fontFamily: 'inter-normal-20',
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  timestampLabel: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
    color: COLORS.muted,
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
    color: COLORS.muted,
  },
  metaValue: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
    color: COLORS.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'inter-semibold-20',
    fontSize: 14,
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  contextRow: {
    backgroundColor: '#F3EEE7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  contextLabel: {
    fontFamily: 'inter-medium-24',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  contextValue: {
    fontFamily: 'inter-semibold-20',
    fontSize: 15,
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.accent,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  actionTimestamp: {
    fontFamily: 'inter-420-20',
    fontSize: 13,
    color: COLORS.muted,
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
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
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    fontFamily: 'inter-medium-24',
    fontSize: 15,
    color: COLORS.textSecondary,
  },
});

export type { NotificationDetail } from './types';
