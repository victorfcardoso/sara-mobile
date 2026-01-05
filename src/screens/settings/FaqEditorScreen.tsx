import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import i18n from 'i18n';
import { Icon } from '@/components-next/common/icon';
import { AddIcon, ChevronLeft, CloseIcon, WarningIcon } from '@/svg-icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  agentSettingsActions,
  selectAgentSettingsData,
  selectAgentSettingsIsUpdating,
} from '@/store/agent-settings';
import type { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { FaqEntry, parseFaqsFromInstructions, upsertFaqInstructionsBlock } from '@/utils/faq';
import { showToast } from '@/utils/toastUtils';
import { useSaraColors, useIsDarkMode, type SaraColors } from '@/hooks/useSaraColors';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'FaqEditorScreen'>;
type EditorRoute = RouteProp<SettingsStackParamList, 'FaqEditorScreen'>;

type FormErrors = {
  question?: string;
  answer?: string;
};

// Static colors that don't change between themes (semantic colors for warnings, errors, etc.)
const ERROR_COLOR = '#B54747';
const WHITE = '#FFFFFF';

// Theme-aware UI colors helper
const getUiColors = (isDark: boolean, colors: SaraColors) => ({
  escalationBg: isDark ? '#3D2E1A' : '#FFF8F0',
  disabledColor: isDark ? '#555555' : '#C9C3BA',
  deleteBg: isDark ? '#3D1A1A' : '#FDEBEB',
  deleteBgPressed: isDark ? '#4D2020' : '#F8D7D7',
  deleteBorder: isDark ? '#5A2020' : '#F3B0B0',
});

const buildFormState = (faq?: FaqEntry | null) => ({
  id: faq?.id ?? '',
  question: faq?.question ?? '',
  answer: faq?.answer ?? '',
});

export const FaqEditorScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<EditorRoute>();
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();
  const uiColors = getUiColors(isDark, colors);

  const agentSettings = useAppSelector(selectAgentSettingsData);
  const isUpdating = useAppSelector(selectAgentSettingsIsUpdating);

  // Memoize switch track colors based on theme
  const switchTrackColors = useMemo(
    () => ({
      true: colors.accent,
      false: uiColors.disabledColor,
    }),
    [colors.accent, uiColors.disabledColor],
  );

  useFocusEffect(
    useCallback(() => {
      if (!agentSettings) {
        dispatch(agentSettingsActions.fetchAgentSettings());
      }
    }, [agentSettings, dispatch]),
  );

  const faqs = useMemo(
    () => parseFaqsFromInstructions(agentSettings?.instructions),
    [agentSettings?.instructions],
  );

  const editingFaqId = route.params?.faqId ?? null;
  const editingFaq = useMemo(
    () => (editingFaqId ? (faqs.find(faq => faq.id === editingFaqId) ?? null) : null),
    [editingFaqId, faqs],
  );

  const [formData, setFormData] = useState(() => buildFormState(editingFaq));
  const [escalationEnabled, setEscalationEnabled] = useState(
    Boolean(editingFaq?.escalation?.enabled),
  );
  const [triggerPhrases, setTriggerPhrases] = useState<string[]>(
    editingFaq?.escalation?.trigger_phrases ?? [],
  );
  const [newTrigger, setNewTrigger] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [pendingDeletion, setPendingDeletion] = useState(false);

  useEffect(() => {
    if (editingFaq) {
      setFormData(buildFormState(editingFaq));
      setEscalationEnabled(Boolean(editingFaq.escalation?.enabled));
      setTriggerPhrases(editingFaq.escalation?.trigger_phrases ?? []);
    }
  }, [editingFaq?.id]);

  useEffect(() => {
    if (pendingDeletion) {
      return;
    }
    if (editingFaqId && !editingFaq && faqs.length) {
      Alert.alert(
        i18n.t('FAQ_EDITOR.MISSING_ENTRY_TITLE'),
        i18n.t('FAQ_EDITOR.MISSING_ENTRY_BODY'),
        [
          {
            text: i18n.t('FAQ_EDITOR.DIALOG_OK'),
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  }, [editingFaq, editingFaqId, faqs.length, navigation, pendingDeletion]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleAddTrigger = useCallback(() => {
    const candidate = newTrigger.trim();
    if (!candidate.length) {
      return;
    }
    setTriggerPhrases(prev => {
      if (prev.includes(candidate)) {
        return prev;
      }
      return [...prev, candidate];
    });
    setNewTrigger('');
  }, [newTrigger]);

  const handleRemoveTrigger = useCallback((phrase: string) => {
    setTriggerPhrases(prev => prev.filter(item => item !== phrase));
  }, []);

  const ensureFaqId = (): string => {
    const trimmed = formData.id.trim();
    if (trimmed && (!editingFaqId || editingFaqId === trimmed)) {
      return trimmed;
    }

    const base = trimmed || `faq_${Date.now()}`;
    if (!faqs.find(faq => faq.id === base)) {
      return base;
    }

    let suffix = 1;
    let candidate = `${base}_${suffix}`;
    while (faqs.some(faq => faq.id === candidate)) {
      suffix += 1;
      candidate = `${base}_${suffix}`;
    }
    return candidate;
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!formData.question.trim()) {
      nextErrors.question = i18n.t('FAQ_EDITOR.VALIDATION_QUESTION');
    }
    if (!formData.answer.trim()) {
      nextErrors.answer = i18n.t('FAQ_EDITOR.VALIDATION_ANSWER');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validate() || pendingDeletion) {
      return;
    }

    const question = formData.question.trim();
    const answer = formData.answer.trim();
    const id = ensureFaqId();
    const nextFaq: FaqEntry = { id, question, answer };

    if (escalationEnabled) {
      const existingEscalation = editingFaq?.escalation;
      nextFaq.escalation = {
        enabled: true,
        trigger_phrases: triggerPhrases.length
          ? triggerPhrases
          : existingEscalation?.trigger_phrases,
        customer_message: existingEscalation?.customer_message,
        default_summary_template: existingEscalation?.default_summary_template,
        pause_ttl_seconds: existingEscalation?.pause_ttl_seconds,
        labels: existingEscalation?.labels ?? [id],
      };
    }

    const nextFaqs = editingFaqId
      ? faqs.map(faq => (faq.id === editingFaqId ? nextFaq : faq))
      : [...faqs, nextFaq];

    try {
      await dispatch(
        agentSettingsActions.updateAgentSettings({
          instructions: upsertFaqInstructionsBlock(agentSettings?.instructions, nextFaqs),
        }),
      ).unwrap();
      showToast({ message: i18n.t('FAQ_EDITOR.SAVE_SUCCESS') });
      navigation.goBack();
    } catch (error) {
      Alert.alert(i18n.t('FAQ_EDITOR.SAVE_ERROR_TITLE'), i18n.t('FAQ_EDITOR.SAVE_ERROR'));
    }
  }, [
    agentSettings?.instructions,
    dispatch,
    editingFaq?.escalation,
    editingFaqId,
    escalationEnabled,
    faqs,
    formData.answer,
    formData.question,
    navigation,
    pendingDeletion,
    triggerPhrases,
  ]);

  const deleteFaq = useCallback(async () => {
    if (!editingFaqId || pendingDeletion) {
      navigation.goBack();
      return;
    }
    const nextFaqs = faqs.filter(faq => faq.id !== editingFaqId);
    if (nextFaqs.length === faqs.length) {
      navigation.goBack();
      return;
    }
    setPendingDeletion(true);
    try {
      await dispatch(
        agentSettingsActions.updateAgentSettings({
          instructions: upsertFaqInstructionsBlock(agentSettings?.instructions, nextFaqs),
        }),
      ).unwrap();
      showToast({ message: i18n.t('FAQ_EDITOR.DELETE_SUCCESS') });
      dispatch(agentSettingsActions.fetchAgentSettings());
      navigation.goBack();
    } catch (error) {
      setPendingDeletion(false);
      Alert.alert(i18n.t('FAQ_EDITOR.DELETE_ERROR_TITLE'), i18n.t('FAQ_EDITOR.DELETE_ERROR'));
    }
  }, [agentSettings?.instructions, dispatch, editingFaqId, faqs, navigation, pendingDeletion]);

  const handleDelete = useCallback(() => {
    if (!editingFaqId || pendingDeletion) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      i18n.t('FAQ_EDITOR.DELETE_CONFIRM_TITLE'),
      i18n.t('FAQ_EDITOR.DELETE_CONFIRM_BODY'),
      [
        {
          text: i18n.t('FAQ_EDITOR.DELETE_CONFIRM_CANCEL'),
          style: 'cancel',
        },
        {
          text: i18n.t('FAQ_EDITOR.DELETE_CONFIRM_OK'),
          style: 'destructive',
          onPress: () => {
            void deleteFaq();
          },
        },
      ],
    );
  }, [deleteFaq, editingFaqId, navigation, pendingDeletion]);

  const headerTitle = editingFaqId
    ? i18n.t('FAQ_EDITOR.TITLE_EDIT')
    : i18n.t('FAQ_EDITOR.TITLE_NEW');

  const disableActions = isUpdating || pendingDeletion;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.chip },
            pressed && styles.backButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('FAQ_EDITOR.BACK_BUTTON')}
          hitSlop={8}>
          <Icon icon={<ChevronLeft stroke={colors.textPrimary} />} size={20} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{headerTitle}</Text>
        <Pressable
          onPress={handleSave}
          disabled={disableActions}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: disableActions ? uiColors.disabledColor : colors.accent },
            pressed && !disableActions && styles.saveButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: disableActions }}
          accessibilityLabel={i18n.t('FAQ_EDITOR.SAVE_BUTTON')}>
          <Text style={styles.saveButtonText}>
            {isUpdating ? i18n.t('FAQ_EDITOR.SAVING_LABEL') : i18n.t('FAQ_EDITOR.SAVE_BUTTON')}
          </Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.select({ ios: 16, android: 0 }) ?? 0}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {i18n.t('FAQ_EDITOR.QUESTION_LABEL')}
            </Text>
            <TextInput
              value={formData.question}
              onChangeText={value => {
                setFormData(current => ({ ...current, question: value }));
                if (errors.question) {
                  setErrors(current => ({ ...current, question: undefined }));
                }
              }}
              placeholder={i18n.t('FAQ_EDITOR.QUESTION_PLACEHOLDER')}
              placeholderTextColor={colors.textMeta}
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundLight,
                  borderColor: errors.question ? ERROR_COLOR : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              multiline
            />
            {errors.question ? <Text style={styles.errorText}>{errors.question}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {i18n.t('FAQ_EDITOR.ANSWER_LABEL')}
            </Text>
            <TextInput
              value={formData.answer}
              onChangeText={value => {
                setFormData(current => ({ ...current, answer: value }));
                if (errors.answer) {
                  setErrors(current => ({ ...current, answer: undefined }));
                }
              }}
              placeholder={i18n.t('FAQ_EDITOR.ANSWER_PLACEHOLDER')}
              placeholderTextColor={colors.textMeta}
              style={[
                styles.input,
                styles.textarea,
                {
                  backgroundColor: colors.backgroundLight,
                  borderColor: errors.answer ? ERROR_COLOR : colors.border,
                  color: colors.textPrimary,
                },
              ]}
              multiline
            />
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              {i18n.t('FAQ_EDITOR.ANSWER_HINT')}
            </Text>
            {errors.answer ? <Text style={styles.errorText}>{errors.answer}</Text> : null}
          </View>

          <View style={styles.previewBlock}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
              {i18n.t('FAQ_EDITOR.PREVIEW_LABEL')}
            </Text>
            <View
              style={[
                styles.previewBubble,
                {
                  backgroundColor: colors.backgroundLight,
                  borderColor: colors.border,
                },
              ]}>
              <Text style={[styles.previewText, { color: colors.textPrimary }]}>
                {formData.answer.trim().length
                  ? formData.answer
                  : i18n.t('FAQ_EDITOR.PREVIEW_EMPTY')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.escalationContainer,
              {
                borderColor: colors.border,
                backgroundColor: uiColors.escalationBg,
              },
            ]}>
            <View style={styles.escalationHeader}>
              <View style={styles.escalationCopy}>
                <View style={styles.warningIconWrapper}>
                  <Icon icon={<WarningIcon stroke={colors.accent} />} size={20} />
                </View>
                <View>
                  <Text style={[styles.escalationTitle, { color: colors.textPrimary }]}>
                    {i18n.t('FAQ_EDITOR.ESCALATION_TITLE')}
                  </Text>
                  <Text style={[styles.escalationSubtitle, { color: colors.textSecondary }]}>
                    {i18n.t('FAQ_EDITOR.ESCALATION_SUBTITLE')}
                  </Text>
                </View>
              </View>
              <Switch
                value={escalationEnabled}
                onValueChange={value => {
                  setEscalationEnabled(value);
                }}
                trackColor={switchTrackColors}
                thumbColor={WHITE}
              />
            </View>

            {escalationEnabled ? (
              <View style={styles.escalationBody}>
                <View style={styles.fieldGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {i18n.t('FAQ_EDITOR.TRIGGERS_LABEL')}
                  </Text>
                  <View style={styles.triggerRow}>
                    <TextInput
                      value={newTrigger}
                      onChangeText={setNewTrigger}
                      placeholder={i18n.t('FAQ_EDITOR.TRIGGER_PLACEHOLDER')}
                      placeholderTextColor={colors.textMeta}
                      style={[
                        styles.input,
                        styles.flex,
                        {
                          backgroundColor: colors.backgroundLight,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      onSubmitEditing={handleAddTrigger}
                      returnKeyType="done"
                    />
                    <Pressable
                      onPress={handleAddTrigger}
                      style={({ pressed }) => [
                        styles.addTriggerButton,
                        { backgroundColor: colors.accent },
                        pressed && styles.addTriggerButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={i18n.t('FAQ_EDITOR.ADD_TRIGGER_BUTTON')}>
                      <Icon icon={<AddIcon stroke={WHITE} />} size={16} />
                    </Pressable>
                  </View>
                  {triggerPhrases.length ? (
                    <View style={styles.triggerChips}>
                      {triggerPhrases.map(phrase => (
                        <View
                          key={phrase}
                          style={[styles.triggerChip, { backgroundColor: colors.accentLight }]}>
                          <Text style={[styles.triggerChipText, { color: colors.accent }]}>
                            {phrase}
                          </Text>
                          <Pressable
                            onPress={() => handleRemoveTrigger(phrase)}
                            accessibilityRole="button"
                            accessibilityLabel={i18n.t('FAQ_EDITOR.REMOVE_TRIGGER_BUTTON', {
                              phrase,
                            })}>
                            <View style={styles.triggerRemoveIcon}>
                              <Icon icon={<CloseIcon stroke={colors.textSecondary} />} size={14} />
                            </View>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>

          {editingFaqId ? (
            <Pressable
              onPress={handleDelete}
              disabled={disableActions}
              style={({ pressed }) => [
                styles.deleteButton,
                {
                  backgroundColor: uiColors.deleteBg,
                  borderColor: uiColors.deleteBorder,
                },
                disableActions && styles.deleteButtonDisabled,
                pressed && !disableActions && { backgroundColor: uiColors.deleteBgPressed },
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: disableActions }}
              accessibilityLabel={i18n.t('FAQ_EDITOR.DELETE_BUTTON')}>
              <Text style={styles.deleteButtonText}>{i18n.t('FAQ_EDITOR.DELETE_BUTTON')}</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    color: ERROR_COLOR,
  },
  previewBlock: {
    gap: 8,
  },
  previewLabel: {
    fontSize: 13,
  },
  previewBubble: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  escalationContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  escalationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  escalationCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  warningIconWrapper: {
    width: 28,
    height: 28,
  },
  escalationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  escalationSubtitle: {
    fontSize: 12,
  },
  escalationBody: {
    gap: 14,
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: ERROR_COLOR,
    fontSize: 15,
    fontWeight: '600',
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addTriggerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTriggerButtonPressed: {
    opacity: 0.85,
  },
  triggerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  triggerChipText: {
    fontSize: 13,
  },
  triggerRemoveIcon: {
    width: 16,
    height: 16,
  },
});

export default FaqEditorScreen;
