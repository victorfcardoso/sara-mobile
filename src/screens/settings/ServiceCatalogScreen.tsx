import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import i18n from 'i18n';
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common/icon';
import { Button } from '@/components-next/button';
import {
  AddIcon,
  ChevronLeft,
  ClockIcon,
  CreditCardIcon,
  PencilIcon,
  Trash as TrashIcon,
} from '@/svg-icons';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  agentSettingsActions,
  selectAgentSettingsData,
  selectAgentSettingsError,
  selectAgentSettingsIsFetching,
} from '@/store/agent-settings';
import type { AgentService } from '@/store/agent-settings';
import { showToast } from '@/utils/toastUtils';
import type { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { ServiceCatalogService } from '@/services/ServiceCatalogService';
import { useSaraColors, useIsDarkMode, type SaraColors } from '@/hooks/useSaraColors';

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'ServiceCatalogScreen'>;

type FormMode = 'create' | 'edit';

type ServiceFormDraft = {
  mode: FormMode;
  serviceId: string | null;
  label: string;
  description: string;
  durationMin: string;
  price: string;
  currency: string;
  requiresDeposit: boolean;
  depositAmount: string;
  eaServiceId: string;
  eaProviderId: number | null;
};

type FormErrors = Partial<
  Record<'label' | 'durationMin' | 'price' | 'currency' | 'depositAmount', string>
>;

// Static colors that don't change between themes (semantic colors for warnings, errors, etc.)
const DESTRUCTIVE_COLOR = '#B54747';
const WARNING_BG_LIGHT = '#FEF4E1';
const WARNING_BG_DARK = '#3D2E1A';
const WARNING_TEXT_LIGHT = '#8A5A2E';
const WARNING_TEXT_DARK = '#F5D89A';
const WARNING_BORDER_LIGHT = '#F4DEBE';
const WARNING_BORDER_DARK = '#5A4520';
const ERROR_BG_LIGHT = '#FDEDEE';
const ERROR_BG_DARK = '#3D1A1A';
const BADGE_BG_LIGHT = '#CCE6DE';
const BADGE_BG_DARK = '#1E3A2E';
const ACTION_BUTTON_DANGER_BG_LIGHT = '#FBEFF0';
const ACTION_BUTTON_DANGER_BG_DARK = '#3D2020';
const ACTION_BUTTON_DANGER_PRESSED_LIGHT = '#F4E0E2';
const ACTION_BUTTON_DANGER_PRESSED_DARK = '#4D2828';
const PAYMENT_TEXT_LIGHT = '#2F7A6D';
const PAYMENT_TEXT_DARK = '#6BC4B8';

// Helper to get theme-aware UI colors
const getUiColors = (isDark: boolean, colors: SaraColors) => ({
  warningBg: isDark ? WARNING_BG_DARK : WARNING_BG_LIGHT,
  warningText: isDark ? WARNING_TEXT_DARK : WARNING_TEXT_LIGHT,
  warningBorder: isDark ? WARNING_BORDER_DARK : WARNING_BORDER_LIGHT,
  errorBg: isDark ? ERROR_BG_DARK : ERROR_BG_LIGHT,
  badgeBg: isDark ? BADGE_BG_DARK : BADGE_BG_LIGHT,
  actionButtonBg: colors.chip,
  actionButtonPressed: colors.border,
  actionButtonDangerBg: isDark ? ACTION_BUTTON_DANGER_BG_DARK : ACTION_BUTTON_DANGER_BG_LIGHT,
  actionButtonDangerPressed: isDark
    ? ACTION_BUTTON_DANGER_PRESSED_DARK
    : ACTION_BUTTON_DANGER_PRESSED_LIGHT,
  paymentText: isDark ? PAYMENT_TEXT_DARK : PAYMENT_TEXT_LIGHT,
  iconButtonBg: colors.chip,
  iconButtonPressed: colors.border,
  headerActionBg: colors.accentLight,
  headerActionPressed: colors.accent,
  switchIosBg: colors.border,
  cardDivider: colors.border,
  inputBg: colors.background,
});

const buildDraft = (service?: AgentService | null): ServiceFormDraft => {
  return {
    mode: service ? 'edit' : 'create',
    serviceId: service?.serviceId ?? null,
    label: service?.label ?? '',
    description: service?.description ?? '',
    durationMin:
      service?.durationMin != null && Number.isFinite(service.durationMin)
        ? String(service.durationMin)
        : '',
    price: service?.price != null && Number.isFinite(service.price) ? String(service.price) : '',
    currency: service?.currency ?? 'BRL',
    requiresDeposit: Boolean(service?.requiresDeposit),
    depositAmount:
      service?.requiresDeposit &&
      service?.depositAmount != null &&
      Number.isFinite(service.depositAmount)
        ? String(service.depositAmount)
        : '',
    eaServiceId:
      service?.eaServiceId != null && Number.isFinite(service.eaServiceId)
        ? String(service.eaServiceId)
        : '',
    eaProviderId:
      service?.eaProviderId != null && Number.isFinite(service.eaProviderId)
        ? service.eaProviderId
        : null,
  };
};

const validateDraft = (draft: ServiceFormDraft): FormErrors => {
  const errors: FormErrors = {};
  if (!draft.label.trim()) {
    errors.label = i18n.t('SERVICE_CATALOG_PAGE.FORM_VALIDATION_LABEL_REQUIRED');
  }

  const durationValue = Number.parseInt(draft.durationMin, 10);
  if (!Number.isFinite(durationValue) || durationValue <= 0) {
    errors.durationMin = i18n.t('SERVICE_CATALOG_PAGE.FORM_VALIDATION_DURATION_REQUIRED');
  }

  const priceValue = Number.parseFloat(draft.price.replace(',', '.'));
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    errors.price = i18n.t('SERVICE_CATALOG_PAGE.FORM_VALIDATION_PRICE_REQUIRED');
  }

  const currencyValue = draft.currency.trim().toUpperCase();
  if (currencyValue.length !== 3) {
    errors.currency = i18n.t('SERVICE_CATALOG_PAGE.FORM_VALIDATION_CURRENCY_REQUIRED');
  }

  if (draft.requiresDeposit) {
    const depositValue =
      draft.depositAmount.trim().length > 0
        ? Number.parseFloat(draft.depositAmount.replace(',', '.'))
        : Number.parseFloat(draft.price.replace(',', '.'));
    if (!Number.isFinite(depositValue) || depositValue <= 0) {
      errors.depositAmount = i18n.t('SERVICE_CATALOG_PAGE.FORM_VALIDATION_DEPOSIT_REQUIRED');
    }
  }

  return errors;
};

const coerceNumberOrNull = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const ServiceCatalogScreen = (): JSX.Element => {
  const navigation = useNavigation<SettingsNavigation>();
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();
  const uiColors = getUiColors(isDark, colors);

  const agentSettings = useAppSelector(selectAgentSettingsData);
  const loadingAgentSettings = useAppSelector(selectAgentSettingsIsFetching);
  const agentSettingsError = useAppSelector(selectAgentSettingsError);

  const [refreshing, setRefreshing] = useState(false);
  const [formDraft, setFormDraft] = useState<ServiceFormDraft | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(agentSettingsActions.fetchAgentSettings());
    }, [dispatch]),
  );

  const agentId = agentSettings?.id ?? null;
  const planTier = agentSettings?.planTier ?? null;
  const services = agentSettings?.services ?? [];
  const easyAppointments = agentSettings?.integrations.easyAppointments;
  const easyAppointmentsConnected = Boolean(easyAppointments?.connected);
  const defaultProviderId =
    easyAppointments?.providerId != null && Number.isFinite(easyAppointments.providerId)
      ? easyAppointments.providerId
      : null;

  const visibleServices = useMemo<
    (AgentService & { isFirst: boolean; orderIndex: number })[]
  >(() => {
    return services.map((service, index) => ({
      ...service,
      isFirst: index === 0,
      orderIndex: index,
    }));
  }, [services]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(agentSettingsActions.fetchAgentSettings()).unwrap();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('SERVICE_CATALOG_PAGE.ERROR_LOAD');
      showToast({ message });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const openCreateForm = useCallback(() => {
    setFormDraft(buildDraft());
    setFormErrors({});
  }, []);

  const openEditForm = useCallback((service: AgentService) => {
    setFormDraft(buildDraft(service));
    setFormErrors({});
  }, []);

  const closeForm = useCallback(() => {
    setFormDraft(null);
    setFormErrors({});
  }, []);

  const updateDraftField = useCallback(
    (field: keyof ServiceFormDraft, value: string | boolean | number | null) => {
      setFormDraft(current => {
        if (!current) {
          return current;
        }
        const next: ServiceFormDraft = { ...current };
        if (field === 'requiresDeposit') {
          next.requiresDeposit = Boolean(value);
          if (next.requiresDeposit && !next.depositAmount.trim().length) {
            next.depositAmount = next.price || '';
          }
          if (!next.requiresDeposit) {
            next.depositAmount = '';
          }
          return next;
        }
        if (field === 'eaProviderId') {
          next.eaProviderId = typeof value === 'number' ? value : null;
          return next;
        }
        if (typeof value === 'string') {
          // Ensure currency stays uppercase
          if (field === 'currency') {
            next[field] = value.toUpperCase();
          } else {
            next[field] = value;
          }
        } else if (typeof value === 'boolean') {
          (next as any)[field] = value;
        } else if (typeof value === 'number') {
          (next as any)[field] = String(value);
        } else {
          (next as any)[field] = value;
        }
        return next;
      });
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmitForm = useCallback(async () => {
    if (!formDraft) {
      return;
    }
    if (!agentId) {
      showToast({ message: i18n.t('SERVICE_CATALOG_PAGE.ERROR_AGENT_MISSING') });
      return;
    }

    const errors = validateDraft(formDraft);
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      setFormErrors(errors);
      return;
    }

    const durationMin = Number.parseInt(formDraft.durationMin, 10);
    const priceValue = Number.parseFloat(formDraft.price.replace(',', '.'));
    const depositValue = formDraft.requiresDeposit
      ? Number.parseFloat(
          (formDraft.depositAmount.trim().length
            ? formDraft.depositAmount
            : formDraft.price
          ).replace(',', '.'),
        )
      : null;
    const payload = {
      label: formDraft.label,
      description: formDraft.description,
      durationMin,
      price: priceValue,
      currency: formDraft.currency.trim().toUpperCase(),
      requiresDeposit: formDraft.requiresDeposit,
      depositAmount: depositValue,
      eaServiceId: coerceNumberOrNull(formDraft.eaServiceId),
      eaProviderId: formDraft.eaProviderId ?? defaultProviderId,
    };

    setSubmitting(true);
    try {
      if (formDraft.mode === 'edit' && formDraft.serviceId) {
        await ServiceCatalogService.update({
          agentId,
          serviceId: formDraft.serviceId,
          payload,
        });
        showToast({ message: i18n.t('SERVICE_CATALOG_PAGE.SUCCESS_UPDATE') });
      } else {
        await ServiceCatalogService.create({
          agentId,
          payload,
        });
        showToast({ message: i18n.t('SERVICE_CATALOG_PAGE.SUCCESS_CREATE') });
      }
      closeForm();
      await dispatch(agentSettingsActions.fetchAgentSettings()).unwrap();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : i18n.t('SERVICE_CATALOG_PAGE.ERROR_SAVE');
      showToast({ message });
    } finally {
      setSubmitting(false);
    }
  }, [agentId, closeForm, defaultProviderId, dispatch, formDraft]);

  const handleDeleteService = useCallback(
    async (service: AgentService) => {
      if (!agentId || !service.serviceId) {
        showToast({ message: i18n.t('SERVICE_CATALOG_PAGE.ERROR_AGENT_MISSING') });
        return;
      }
      setPendingDeleteId(service.serviceId);
      try {
        await ServiceCatalogService.remove({
          agentId,
          serviceId: service.serviceId,
        });
        showToast({ message: i18n.t('SERVICE_CATALOG_PAGE.SUCCESS_DELETE') });
        await dispatch(agentSettingsActions.fetchAgentSettings()).unwrap();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : i18n.t('SERVICE_CATALOG_PAGE.ERROR_DELETE');
        showToast({ message });
      } finally {
        setPendingDeleteId(null);
      }
    },
    [agentId, dispatch],
  );

  const confirmDelete = useCallback(
    (service: AgentService) => {
      const label = service.label || service.serviceId || '';
      Alert.alert(
        i18n.t('SERVICE_CATALOG_PAGE.DELETE_CONFIRM_TITLE'),
        i18n.t('SERVICE_CATALOG_PAGE.DELETE_CONFIRM_MESSAGE', { label }),
        [
          {
            text: i18n.t('SERVICE_CATALOG_PAGE.DELETE_CONFIRM_CANCEL'),
            style: 'cancel',
          },
          {
            text: i18n.t('SERVICE_CATALOG_PAGE.DELETE_CONFIRM_ACTION'),
            style: 'destructive',
            onPress: () => handleDeleteService(service),
          },
        ],
      );
    },
    [handleDeleteService],
  );

  if (formDraft) {
    const formTitle =
      formDraft.mode === 'edit'
        ? i18n.t('SERVICE_CATALOG_PAGE.EDIT_TITLE')
        : i18n.t('SERVICE_CATALOG_PAGE.CREATE_TITLE');

    return (
      <SafeAreaView style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tailwind.style('flex-1')}>
          <View style={[styles.formHeader, { backgroundColor: colors.background }]}>
            <Pressable
              onPress={closeForm}
              style={({ pressed }) => [
                styles.iconButton,
                { backgroundColor: uiColors.iconButtonBg },
                pressed ? { backgroundColor: uiColors.iconButtonPressed } : null,
              ]}>
              <Icon
                icon={<ChevronLeft stroke={colors.textPrimary} strokeWidth={1.5} />}
                size={24}
              />
            </Pressable>
            <Text style={[styles.formHeaderTitle, { color: colors.textPrimary }]}>{formTitle}</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_LABEL')}
              </Text>
              <TextInput
                value={formDraft.label}
                onChangeText={text => updateDraftField('label', text)}
                placeholder={i18n.t('SERVICE_CATALOG_PAGE.FIELD_LABEL_PLACEHOLDER')}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: uiColors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="sentences"
              />
              {formErrors.label ? <Text style={styles.errorText}>{formErrors.label}</Text> : null}
            </View>

            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DESCRIPTION')}
              </Text>
              <TextInput
                value={formDraft.description}
                onChangeText={text => updateDraftField('description', text)}
                placeholder={i18n.t('SERVICE_CATALOG_PAGE.FIELD_DESCRIPTION_PLACEHOLDER')}
                style={[
                  styles.textInput,
                  styles.multilineInput,
                  {
                    backgroundColor: uiColors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formField, styles.rowItem]}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DURATION')}
                </Text>
                <TextInput
                  value={formDraft.durationMin}
                  onChangeText={text => updateDraftField('durationMin', text)}
                  placeholder="30"
                  placeholderTextColor={colors.textMeta}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: uiColors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  keyboardType="number-pad"
                />
                {formErrors.durationMin ? (
                  <Text style={styles.errorText}>{formErrors.durationMin}</Text>
                ) : null}
              </View>
              <View style={[styles.formField, styles.rowItem]}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_PRICE')}
                </Text>
                <TextInput
                  value={formDraft.price}
                  onChangeText={text => updateDraftField('price', text)}
                  placeholder="120.00"
                  placeholderTextColor={colors.textMeta}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: uiColors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  keyboardType="decimal-pad"
                />
                {formErrors.price ? <Text style={styles.errorText}>{formErrors.price}</Text> : null}
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_REQUIRES_DEPOSIT')}
              </Text>
              <Switch
                value={formDraft.requiresDeposit}
                onValueChange={value => updateDraftField('requiresDeposit', value)}
                trackColor={{ false: colors.border, true: colors.accent }}
                ios_backgroundColor={uiColors.switchIosBg}
              />
            </View>

            {formDraft.requiresDeposit ? (
              <View style={styles.formField}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DEPOSIT_AMOUNT')}
                </Text>
                <TextInput
                  value={formDraft.depositAmount}
                  onChangeText={text => updateDraftField('depositAmount', text)}
                  placeholder={formDraft.price || '120.00'}
                  placeholderTextColor={colors.textMeta}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: uiColors.inputBg,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    },
                  ]}
                  keyboardType="decimal-pad"
                />
                {formErrors.depositAmount ? (
                  <Text style={styles.errorText}>{formErrors.depositAmount}</Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.formFooter}>
              <View style={tailwind.style('flex-1')}>
                <Button
                  variant="secondary"
                  text={i18n.t('SERVICE_CATALOG_PAGE.CANCEL_BUTTON')}
                  handlePress={closeForm}
                />
              </View>
              <View style={tailwind.style('w-3')} />
              <View style={tailwind.style('flex-1')}>
                <Button
                  text={i18n.t('SERVICE_CATALOG_PAGE.SAVE_BUTTON')}
                  tone="brand"
                  handlePress={handleSubmitForm}
                  disabled={submitting}
                />
              </View>
            </View>
            {submitting ? (
              <View style={styles.submittingOverlay}>
                <ActivityIndicator color={colors.accent} size="small" />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: uiColors.iconButtonBg },
            pressed ? { backgroundColor: uiColors.iconButtonPressed } : null,
          ]}>
          <Icon icon={<ChevronLeft stroke={colors.textPrimary} strokeWidth={1.4} />} size={22} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {i18n.t('SERVICE_CATALOG_PAGE.TITLE')}
        </Text>
        <Pressable
          onPress={openCreateForm}
          disabled={!easyAppointmentsConnected}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.headerAction,
            { backgroundColor: uiColors.headerActionBg },
            !easyAppointmentsConnected ? styles.headerActionDisabled : null,
            pressed && easyAppointmentsConnected
              ? { backgroundColor: uiColors.headerActionPressed }
              : null,
          ]}>
          <Icon icon={<AddIcon stroke={colors.textPrimary} strokeWidth={1.4} />} size={18} />
        </Pressable>
      </View>
      {!easyAppointmentsConnected ? (
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: uiColors.warningBg, borderColor: uiColors.warningBorder },
          ]}>
          <Text style={[styles.noticeText, { color: uiColors.warningText }]}>
            {i18n.t('SERVICE_CATALOG_PAGE.EA_DISCONNECTED_NOTICE')}
          </Text>
        </View>
      ) : null}
      {planTier === 'basic' ? (
        <View
          style={[
            styles.noticeCard,
            { backgroundColor: uiColors.warningBg, borderColor: uiColors.warningBorder },
          ]}>
          <Text style={[styles.noticeText, { color: uiColors.warningText }]}>
            {i18n.t('SERVICE_CATALOG_PAGE.PLAN_NOTICE')}
          </Text>
        </View>
      ) : null}
      {agentSettingsError ? (
        <View style={[styles.errorBanner, { backgroundColor: uiColors.errorBg }]}>
          <Text style={styles.errorBannerText}>{agentSettingsError}</Text>
        </View>
      ) : null}
      <ScrollView
        style={tailwind.style('flex-1')}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }>
        {loadingAgentSettings && services.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} size="small" />
          </View>
        ) : null}
        {!loadingAgentSettings && services.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              icon={<CreditCardIcon stroke={colors.textSecondary} strokeWidth={1.4} />}
              size={48}
            />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {i18n.t('SERVICE_CATALOG_PAGE.EMPTY_TITLE')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {i18n.t('SERVICE_CATALOG_PAGE.EMPTY_SUBTITLE')}
            </Text>
          </View>
        ) : null}
        {visibleServices.map(service => {
          const cardKey =
            service.serviceId ?? `${service.orderIndex}-${service.label ?? 'service'}`;
          const isDeleting = pendingDeleteId === service.serviceId;

          return (
            <View
              key={cardKey}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundLight,
                  borderColor: colors.border,
                  shadowColor: colors.textPrimary,
                },
              ]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <View style={styles.cardTitleRow}>
                    <Text
                      style={[styles.cardTitle, { color: colors.textPrimary }]}
                      numberOfLines={1}>
                      {service.label || i18n.t('SERVICE_CATALOG_PAGE.UNTITLED_SERVICE')}
                    </Text>
                    {planTier === 'basic' && service.isFirst ? (
                      <View style={[styles.badge, { backgroundColor: uiColors.badgeBg }]}>
                        <Text style={[styles.badgeText, { color: colors.textPrimary }]}>
                          {i18n.t('SERVICE_CATALOG_PAGE.VISIBLE_BADGE')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {service.description ? (
                    <Text
                      style={[styles.cardDescription, { color: colors.textSecondary }]}
                      numberOfLines={2}>
                      {service.description}
                    </Text>
                  ) : null}
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => openEditForm(service)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: uiColors.actionButtonBg },
                      pressed ? { backgroundColor: uiColors.actionButtonPressed } : null,
                    ]}>
                    <Icon
                      icon={<PencilIcon stroke={colors.textSecondary} strokeWidth={1.4} />}
                      size={18}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(service)}
                    disabled={isDeleting}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: uiColors.actionButtonDangerBg },
                      isDeleting ? styles.actionButtonDisabled : null,
                      pressed && !isDeleting
                        ? { backgroundColor: uiColors.actionButtonDangerPressed }
                        : null,
                    ]}>
                    {isDeleting ? (
                      <ActivityIndicator color={DESTRUCTIVE_COLOR} size="small" />
                    ) : (
                      <Icon
                        icon={<TrashIcon stroke={DESTRUCTIVE_COLOR} strokeWidth={1.5} />}
                        size={18}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
              <View style={[styles.cardDivider, { backgroundColor: uiColors.cardDivider }]} />
              <View style={styles.cardDetailsRow}>
                <View style={styles.detailGroup}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIcon}>
                      <Icon
                        icon={<ClockIcon stroke={colors.textSecondary} strokeWidth={1.25} />}
                        size={16}
                      />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                      {service.durationMin
                        ? `${service.durationMin} ${i18n.t('SERVICE_CATALOG_PAGE.MINUTES_SUFFIX')}`
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIcon}>
                      <Icon
                        icon={<CreditCardIcon stroke={colors.textSecondary} strokeWidth={1.25} />}
                        size={16}
                      />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textPrimary }]}>
                      {service.price != null && Number.isFinite(service.price)
                        ? `${Number(service.price).toFixed(2)} ${service.currency ?? 'BRL'}`
                        : `— ${service.currency ?? 'BRL'}`}
                    </Text>
                  </View>
                </View>
                {service.requiresDeposit ? (
                  <Text style={[styles.paymentText, { color: uiColors.paymentText }]}>
                    {i18n.t('SERVICE_CATALOG_PAGE.PAYMENT_REQUIRED_BADGE')}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionDisabled: {
    opacity: 0.35,
  },
  noticeCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  noticeText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },
  errorBannerText: {
    color: DESTRUCTIVE_COLOR,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  cardDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 12,
  },
  cardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailItemIcon: {
    marginTop: -4,
  },
  detailText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  paymentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  formHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  formContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  formField: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  formFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  submittingOverlay: {
    marginTop: 16,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: DESTRUCTIVE_COLOR,
  },
});

export default ServiceCatalogScreen;
