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
import {
  FaqEntry,
  parseFaqsFromInstructions,
  upsertFaqInstructionsBlock,
} from '@/utils/faq';
import { showToast } from '@/utils/toastUtils';

type Navigation = NativeStackNavigationProp<SettingsStackParamList, 'FaqEditorScreen'>;
type EditorRoute = RouteProp<SettingsStackParamList, 'FaqEditorScreen'>;

type FormErrors = {
  question?: string;
  answer?: string;
};

const COLORS = {
  background: '#F8F5F3',
  headerBorder: '#E6E0D7',
  backButton: '#E7E2DD',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  inputBackground: '#FFFFFF',
  inputBorder: '#DDD5CA',
  error: '#B54747',
  chipBg: '#E7F4F2',
  chipText: '#1E7068',
  chipRemove: '#4B5D6E',
  escalationBorder: '#E6E0D7',
  escalationBackground: '#FFF8F0',
  accent: '#0F9C9C',
  accentPressed: '#0C7D7D',
  saveButtonBg: '#12A594',
  saveButtonPressed: '#0F8B8D',
  disabled: '#C9C3BA',
  deleteBackground: '#FDEBEB',
  deleteBackgroundPressed: '#F8D7D7',
  deleteBorder: '#F3B0B0',
};

const buildFormState = (faq?: FaqEntry | null) => ({
  id: faq?.id ?? '',
  question: faq?.question ?? '',
  answer: faq?.answer ?? '',
});

export const FaqEditorScreen = (): JSX.Element => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<EditorRoute>();
  const dispatch = useAppDispatch();

  const agentSettings = useAppSelector(selectAgentSettingsData);
  const isUpdating = useAppSelector(selectAgentSettingsIsUpdating);

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
    () => (editingFaqId ? faqs.find(faq => faq.id === editingFaqId) ?? null : null),
    [editingFaqId, faqs],
  );

  const [formData, setFormData] = useState(() => buildFormState(editingFaq));
  const [escalationEnabled, setEscalationEnabled] = useState(Boolean(editingFaq?.escalation?.enabled));
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
      Alert.alert(i18n.t('FAQ_EDITOR.MISSING_ENTRY_TITLE'), i18n.t('FAQ_EDITOR.MISSING_ENTRY_BODY'), [
        {
          text: i18n.t('FAQ_EDITOR.DIALOG_OK'),
          onPress: () => navigation.goBack(),
        },
      ]);
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
  }, [
    agentSettings?.instructions,
    dispatch,
    editingFaqId,
    faqs,
    navigation,
    pendingDeletion,
  ]);

  const handleDelete = useCallback(() => {
    if (!editingFaqId || pendingDeletion) {
      navigation.goBack();
      return;
    }
    Alert.alert(i18n.t('FAQ_EDITOR.DELETE_CONFIRM_TITLE'), i18n.t('FAQ_EDITOR.DELETE_CONFIRM_BODY'), [
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
    ]);
  }, [deleteFaq, editingFaqId, navigation, pendingDeletion]);

  const headerTitle = editingFaqId
    ? i18n.t('FAQ_EDITOR.TITLE_EDIT')
    : i18n.t('FAQ_EDITOR.TITLE_NEW');

  const disableActions = isUpdating || pendingDeletion;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={i18n.t('FAQ_EDITOR.BACK_BUTTON')}
          hitSlop={8}>
          <Icon icon={<ChevronLeft />} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <Pressable
          onPress={handleSave}
          disabled={disableActions}
          style={({ pressed }) => [
            styles.saveButton,
            disableActions ? styles.saveButtonDisabled : pressed && styles.saveButtonPressed,
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
            <Text style={styles.label}>{i18n.t('FAQ_EDITOR.QUESTION_LABEL')}</Text>
            <TextInput
              value={formData.question}
              onChangeText={value => {
                setFormData(current => ({ ...current, question: value }));
                if (errors.question) {
                  setErrors(current => ({ ...current, question: undefined }));
                }
              }}
              placeholder={i18n.t('FAQ_EDITOR.QUESTION_PLACEHOLDER')}
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.input, errors.question && styles.inputError]}
              multiline
            />
            {errors.question ? <Text style={styles.errorText}>{errors.question}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{i18n.t('FAQ_EDITOR.ANSWER_LABEL')}</Text>
            <TextInput
              value={formData.answer}
              onChangeText={value => {
                setFormData(current => ({ ...current, answer: value }));
                if (errors.answer) {
                  setErrors(current => ({ ...current, answer: undefined }));
                }
              }}
              placeholder={i18n.t('FAQ_EDITOR.ANSWER_PLACEHOLDER')}
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.input, styles.textarea, errors.answer && styles.inputError]}
              multiline
            />
            <Text style={styles.helperText}>{i18n.t('FAQ_EDITOR.ANSWER_HINT')}</Text>
            {errors.answer ? <Text style={styles.errorText}>{errors.answer}</Text> : null}
          </View>

          <View style={styles.previewBlock}>
            <Text style={styles.previewLabel}>{i18n.t('FAQ_EDITOR.PREVIEW_LABEL')}</Text>
            <View style={styles.previewBubble}>
              <Text style={styles.previewText}>
                {formData.answer.trim().length
                  ? formData.answer
                  : i18n.t('FAQ_EDITOR.PREVIEW_EMPTY')}
              </Text>
            </View>
          </View>

          <View style={styles.escalationContainer}>
            <View style={styles.escalationHeader}>
              <View style={styles.escalationCopy}>
                <View style={styles.warningIconWrapper}>
                  <Icon icon={<WarningIcon stroke={COLORS.accent} />} size={20} />
                </View>
                <View>
                  <Text style={styles.escalationTitle}>{i18n.t('FAQ_EDITOR.ESCALATION_TITLE')}</Text>
                  <Text style={styles.escalationSubtitle}>
                    {i18n.t('FAQ_EDITOR.ESCALATION_SUBTITLE')}
                  </Text>
                </View>
              </View>
              <Switch
                value={escalationEnabled}
                onValueChange={value => {
                  setEscalationEnabled(value);
                }}
                trackColor={{ true: COLORS.accent, false: COLORS.disabled }}
                thumbColor="#FFFFFF"
              />
            </View>

            {escalationEnabled ? (
              <View style={styles.escalationBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{i18n.t('FAQ_EDITOR.TRIGGERS_LABEL')}</Text>
                  <View style={styles.triggerRow}>
                    <TextInput
                      value={newTrigger}
                      onChangeText={setNewTrigger}
                      placeholder={i18n.t('FAQ_EDITOR.TRIGGER_PLACEHOLDER')}
                      placeholderTextColor={COLORS.textSecondary}
                      style={[styles.input, styles.flex]}
                      onSubmitEditing={handleAddTrigger}
                      returnKeyType="done"
                    />
                    <Pressable
                      onPress={handleAddTrigger}
                      style={({ pressed }) => [
                        styles.addTriggerButton,
                        pressed && styles.addTriggerButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={i18n.t('FAQ_EDITOR.ADD_TRIGGER_BUTTON')}>
                      <Icon icon={<AddIcon stroke="#FFFFFF" />} size={16} />
                    </Pressable>
                  </View>
                  {triggerPhrases.length ? (
                    <View style={styles.triggerChips}>
                      {triggerPhrases.map(phrase => (
                        <View key={phrase} style={styles.triggerChip}>
                          <Text style={styles.triggerChipText}>{phrase}</Text>
                          <Pressable
                            onPress={() => handleRemoveTrigger(phrase)}
                            accessibilityRole="button"
                            accessibilityLabel={i18n.t('FAQ_EDITOR.REMOVE_TRIGGER_BUTTON', {
                              phrase,
                            })}>
                            <View style={styles.triggerRemoveIcon}>
                              <Icon icon={<CloseIcon stroke={COLORS.chipRemove} />} size={14} />
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
                disableActions && styles.deleteButtonDisabled,
                pressed && !disableActions && styles.deleteButtonPressed,
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
    backgroundColor: COLORS.background,
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
  backButtonPressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    minWidth: 72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.saveButtonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    backgroundColor: COLORS.saveButtonPressed,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  saveButtonText: {
    color: '#FFFFFF',
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
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textarea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  previewBlock: {
    gap: 8,
  },
  previewLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  previewBubble: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  previewText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  escalationContainer: {
    borderWidth: 1,
    borderColor: COLORS.escalationBorder,
    borderRadius: 16,
    backgroundColor: COLORS.escalationBackground,
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
    color: COLORS.textPrimary,
  },
  escalationSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  escalationBody: {
    gap: 14,
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.deleteBorder,
    backgroundColor: COLORS.deleteBackground,
    alignItems: 'center',
  },
  deleteButtonPressed: {
    backgroundColor: COLORS.deleteBackgroundPressed,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: COLORS.error,
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
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTriggerButtonPressed: {
    backgroundColor: COLORS.accentPressed,
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
    backgroundColor: COLORS.chipBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  triggerChipText: {
    color: COLORS.chipText,
    fontSize: 13,
  },
  triggerRemoveIcon: {
    width: 16,
    height: 16,
  },
});

export default FaqEditorScreen;
