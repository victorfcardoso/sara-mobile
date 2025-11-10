import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import i18n from 'i18n';
import { Icon } from '@/components-next/common/icon';
import { AddIcon, ChevronLeft } from '@/svg-icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  agentSettingsActions,
  selectAgentSettingsData,
  selectAgentSettingsError,
  selectAgentSettingsIsFetching,
} from '@/store/agent-settings';
import type { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { parseFaqsFromInstructions } from '@/utils/faq';

const COLORS = {
  background: '#F8F5F3',
  headerBorder: '#E6E0D7',
  backButton: '#E7E2DD',
  addButton: '#12A594',
  addButtonPressed: '#0E857F',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  card: '#FFFFFF',
  border: '#E6E0D7',
  badgeEscalationBg: '#FFEBD6',
  badgeEscalationText: '#8A5A2E',
  triggerChipBg: '#F1EAE1',
  triggerChipText: '#4B5D6E',
  errorBg: '#FDF3F3',
  errorText: '#B54747',
  answerBubble: '#FFFFFF',
  answerShadow: '#D6CEC4',
};

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'FaqScreen'>;

export const FaqScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsNavigation>();
  const dispatch = useAppDispatch();
  const agentSettings = useAppSelector(selectAgentSettingsData);
  const isFetching = useAppSelector(selectAgentSettingsIsFetching);
  const agentSettingsError = useAppSelector(selectAgentSettingsError);

  useFocusEffect(
    useCallback(() => {
      dispatch(agentSettingsActions.fetchAgentSettings());
    }, [dispatch]),
  );

  const faqs = useMemo(
    () => parseFaqsFromInstructions(agentSettings?.instructions),
    [agentSettings?.instructions],
  );

  const handleRefresh = useCallback(() => {
    dispatch(agentSettingsActions.fetchAgentSettings());
  }, [dispatch]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAddFaq = useCallback(() => {
    navigation.navigate('FaqEditorScreen');
  }, [navigation]);

  const handleEditFaq = useCallback(
    (faqId: string) => {
      navigation.navigate('FaqEditorScreen', { faqId });
    },
    [navigation],
  );

  const renderTriggerChips = (triggers?: string[]) => {
    if (!triggers || triggers.length === 0) {
      return null;
    }
    return (
      <View style={styles.triggersContainer}>
        <Text style={styles.detailLabel}>{i18n.t('FAQ_PAGE.TRIGGERS_LABEL')}</Text>
        <View style={styles.triggerRow}>
          {triggers.map(phrase => (
            <View key={phrase} style={styles.triggerChip}>
              <Text style={styles.triggerChipText}>{phrase}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEscalationDetails = (faq: (typeof faqs)[number]) => {
    if (!faq.escalation?.enabled) {
      return null;
    }

    const items: { label: string; value?: string }[] = [];
    if (faq.escalation.customer_message) {
      items.push({
        label: i18n.t('FAQ_PAGE.CUSTOMER_MESSAGE_LABEL'),
        value: faq.escalation.customer_message,
      });
    }
    if (faq.escalation.default_summary_template) {
      items.push({
        label: i18n.t('FAQ_PAGE.SUMMARY_TEMPLATE_LABEL'),
        value: faq.escalation.default_summary_template,
      });
    }
    if (faq.escalation.pause_ttl_seconds) {
      items.push({
        label: i18n.t('FAQ_PAGE.PAUSE_TTL_LABEL'),
        value: i18n.t('FAQ_PAGE.PAUSE_TTL_SECONDS', {
          seconds: faq.escalation.pause_ttl_seconds,
        }),
      });
    }

    if (!items.length && !faq.escalation.trigger_phrases?.length) {
      return null;
    }

    return (
      <View style={styles.escalationBlock}>
        {renderTriggerChips(faq.escalation.trigger_phrases)}
        {items.map(item => (
          <View key={`${faq.id}-${item.label}`} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{item.label}</Text>
            {item.value ? <Text style={styles.detailValue}>{item.value}</Text> : null}
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (!faqs.length && !isFetching) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{i18n.t('FAQ_PAGE.EMPTY_TITLE')}</Text>
          <Text style={styles.emptySubtitle}>{i18n.t('FAQ_PAGE.EMPTY_SUBTITLE')}</Text>
        </View>
      );
    }

    return faqs.map(faq => {
      const escalationActive = Boolean(faq.escalation?.enabled);
      return (
        <Pressable
          key={faq.id}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => handleEditFaq(faq.id)}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('FAQ_PAGE.EDIT_BUTTON', { question: faq.question })}
          hitSlop={4}>
          <View style={styles.cardHeader}>
            <Text style={styles.question}>{faq.question}</Text>
            {escalationActive ? (
              <View style={[styles.badge, styles.escalationBadge]}>
                <Text style={[styles.badgeText, styles.escalationBadgeText]}>
                  {i18n.t('FAQ_PAGE.ESCALATION_BADGE')}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={styles.answerBubble}>
            <Text style={styles.answer}>{faq.answer}</Text>
          </View>
          {escalationActive ? renderEscalationDetails(faq) : null}
        </Pressable>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button">
          <Icon icon={<ChevronLeft />} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n.t('FAQ_PAGE.TITLE')}</Text>
        <Pressable
          onPress={handleAddFaq}
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('FAQ_PAGE.ADD_BUTTON')}
          hitSlop={8}>
          <Icon icon={<AddIcon stroke="#FFFFFF" />} size={20} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={COLORS.textPrimary}
            />
          }>
          <Text style={styles.headerSubtitle}>{i18n.t('FAQ_PAGE.DESCRIPTION')}</Text>
          {agentSettingsError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{i18n.t('FAQ_PAGE.ERROR_LOADING')}</Text>
            </View>
          ) : null}
          {isFetching && !faqs.length ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            </View>
          ) : null}
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.addButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonPressed: {
    backgroundColor: COLORS.addButtonPressed,
  },
  headerSubtitle: {
    marginTop: 16,
    marginBottom: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  errorBanner: {
    backgroundColor: COLORS.errorBg,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 13,
  },
  loadingState: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardPressed: {
    opacity: 0.95,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  answerBubble: {
    backgroundColor: COLORS.answerBubble,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.answerShadow,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  escalationBadge: {
    backgroundColor: COLORS.badgeEscalationBg,
  },
  escalationBadgeText: {
    color: COLORS.badgeEscalationText,
  },
  escalationBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    gap: 12,
  },
  triggerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggersContainer: {
    gap: 6,
  },
  triggerChip: {
    backgroundColor: COLORS.triggerChipBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  triggerChipText: {
    fontSize: 12,
    color: COLORS.triggerChipText,
    fontWeight: '500',
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
