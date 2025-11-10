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

type SettingsNavigation = NativeStackNavigationProp<
  SettingsStackParamList,
  'ServiceCatalogScreen'
>;

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

const COLORS = {
  background: '#F6F1EB',
  card: '#FFFFFF',
  border: '#E7DED3',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  accent: '#4CB6AC',
  destructive: '#B54747',
  warningBackground: '#FEF4E1',
  warningText: '#8A5A2E',
  badgeBackground: '#CCE6DE',
  badgeText: '#16273D',
  mutedBadgeBackground: '#E7E2DD',
  mutedBadgeText: '#4B5D6E',
  pressed: '#E9E2D9',
  inputBackground: '#FDFBF9',
  errorText: '#B54747',
  icon: '#4B5D6E',
};

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
    price:
      service?.price != null && Number.isFinite(service.price) ? String(service.price) : '',
    currency: service?.currency ?? 'BRL',
    requiresDeposit: Boolean(service?.requiresDeposit),
    depositAmount:
      service?.requiresDeposit && service?.depositAmount != null && Number.isFinite(service.depositAmount)
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
    Array<AgentService & { isFirst: boolean; orderIndex: number }>
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
          (formDraft.depositAmount.trim().length ? formDraft.depositAmount : formDraft.price).replace(
            ',',
            '.',
          ),
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
      <SafeAreaView style={[tailwind.style('flex-1'), { backgroundColor: COLORS.background }]}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tailwind.style('flex-1')}>
          <View style={styles.formHeader}>
            <Pressable
              onPress={closeForm}
              style={({ pressed }) => [
                styles.iconButton,
                pressed ? { backgroundColor: COLORS.pressed } : null,
              ]}>
              <Icon icon={<ChevronLeft stroke="#16273D" strokeWidth={1.5} />} size={24} />
            </Pressable>
            <Text style={styles.formHeaderTitle}>{formTitle}</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_LABEL')}
              </Text>
              <TextInput
                value={formDraft.label}
                onChangeText={text => updateDraftField('label', text)}
                placeholder={i18n.t('SERVICE_CATALOG_PAGE.FIELD_LABEL_PLACEHOLDER')}
                style={styles.textInput}
                placeholderTextColor={COLORS.textSecondary}
                autoCapitalize="sentences"
              />
              {formErrors.label ? (
                <Text style={styles.errorText}>{formErrors.label}</Text>
              ) : null}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DESCRIPTION')}
              </Text>
              <TextInput
                value={formDraft.description}
                onChangeText={text => updateDraftField('description', text)}
                placeholder={i18n.t('SERVICE_CATALOG_PAGE.FIELD_DESCRIPTION_PLACEHOLDER')}
                style={[styles.textInput, styles.multilineInput]}
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formField, styles.rowItem]}>
                <Text style={styles.fieldLabel}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DURATION')}
                </Text>
                <TextInput
                  value={formDraft.durationMin}
                  onChangeText={text => updateDraftField('durationMin', text)}
                  placeholder="30"
                  style={styles.textInput}
                  keyboardType="number-pad"
                />
                {formErrors.durationMin ? (
                  <Text style={styles.errorText}>{formErrors.durationMin}</Text>
                ) : null}
              </View>
              <View style={[styles.formField, styles.rowItem]}>
                <Text style={styles.fieldLabel}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_PRICE')}
                </Text>
                <TextInput
                  value={formDraft.price}
                  onChangeText={text => updateDraftField('price', text)}
                  placeholder="120.00"
                  style={styles.textInput}
                  keyboardType="decimal-pad"
                />
                {formErrors.price ? (
                  <Text style={styles.errorText}>{formErrors.price}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>
                {i18n.t('SERVICE_CATALOG_PAGE.FIELD_REQUIRES_DEPOSIT')}
              </Text>
              <Switch
                value={formDraft.requiresDeposit}
                onValueChange={value => updateDraftField('requiresDeposit', value)}
                trackColor={{ false: '#D8D1C9', true: COLORS.accent }}
                ios_backgroundColor="#D8D1C9"
              />
            </View>

            {formDraft.requiresDeposit ? (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  {i18n.t('SERVICE_CATALOG_PAGE.FIELD_DEPOSIT_AMOUNT')}
                </Text>
                <TextInput
                  value={formDraft.depositAmount}
                  onChangeText={text => updateDraftField('depositAmount', text)}
                  placeholder={formDraft.price || '120.00'}
                  style={styles.textInput}
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
                <ActivityIndicator color={COLORS.accent} size="small" />
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tailwind.style('flex-1'), { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [
            styles.iconButton,
            pressed ? styles.iconButtonPressed : null,
          ]}>
          <Icon icon={<ChevronLeft stroke="#16273D" strokeWidth={1.4} />} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n.t('SERVICE_CATALOG_PAGE.TITLE')}</Text>
        <Pressable
          onPress={openCreateForm}
          disabled={!easyAppointmentsConnected}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => [
            styles.headerAction,
            !easyAppointmentsConnected ? styles.headerActionDisabled : null,
            pressed && easyAppointmentsConnected ? styles.headerActionPressed : null,
          ]}>
          <Icon icon={<AddIcon stroke="#16273D" strokeWidth={1.4} />} size={18} />
        </Pressable>
      </View>
      {!easyAppointmentsConnected ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            {i18n.t('SERVICE_CATALOG_PAGE.EA_DISCONNECTED_NOTICE')}
          </Text>
        </View>
      ) : null}
      {planTier === 'basic' ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            {i18n.t('SERVICE_CATALOG_PAGE.PLAN_NOTICE')}
          </Text>
        </View>
      ) : null}
      {agentSettingsError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{agentSettingsError}</Text>
        </View>
      ) : null}
      <ScrollView
        style={tailwind.style('flex-1')}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.accent} />
        }>
        {loadingAgentSettings && services.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={COLORS.accent} size="small" />
          </View>
        ) : null}
        {!loadingAgentSettings && services.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon icon={<CreditCardIcon stroke={COLORS.textSecondary} strokeWidth={1.4} />} size={48} />
            <Text style={styles.emptyTitle}>{i18n.t('SERVICE_CATALOG_PAGE.EMPTY_TITLE')}</Text>
            <Text style={styles.emptySubtitle}>
              {i18n.t('SERVICE_CATALOG_PAGE.EMPTY_SUBTITLE')}
            </Text>
          </View>
        ) : null}
        {visibleServices.map(service => {
          const cardKey =
            service.serviceId ??
            `${service.orderIndex}-${service.label ?? 'service'}`;
          const isDeleting = pendingDeleteId === service.serviceId;

          return (
            <View key={cardKey} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {service.label || i18n.t('SERVICE_CATALOG_PAGE.UNTITLED_SERVICE')}
                    </Text>
                    {planTier === 'basic' && service.isFirst ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {i18n.t('SERVICE_CATALOG_PAGE.VISIBLE_BADGE')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  {service.description ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>
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
                      pressed ? styles.actionButtonPressed : null,
                    ]}>
                    <Icon icon={<PencilIcon stroke="#4B5D6E" strokeWidth={1.4} />} size={18} />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(service)}
                    disabled={isDeleting}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonDanger,
                      isDeleting ? styles.actionButtonDisabled : null,
                      pressed && !isDeleting ? styles.actionButtonDangerPressed : null,
                    ]}>
                    {isDeleting ? (
                      <ActivityIndicator color={COLORS.destructive} size="small" />
                    ) : (
                      <Icon icon={<TrashIcon stroke={COLORS.destructive} strokeWidth={1.5} />} size={18} />
                    )}
                  </Pressable>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardDetailsRow}>
                <View style={styles.detailGroup}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIcon}>
                      <Icon icon={<ClockIcon stroke={COLORS.icon} strokeWidth={1.25} />} size={16} />
                    </View>
                    <Text style={styles.detailText}>
                      {service.durationMin
                        ? `${service.durationMin} ${i18n.t('SERVICE_CATALOG_PAGE.MINUTES_SUFFIX')}`
                        : '—'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.detailItemIcon}>
                      <Icon icon={<CreditCardIcon stroke={COLORS.icon} strokeWidth={1.25} />} size={16} />
                    </View>
                    <Text style={styles.detailText}>
                      {service.price != null && Number.isFinite(service.price)
                        ? `${Number(service.price).toFixed(2)} ${service.currency ?? 'BRL'}`
                        : `— ${service.currency ?? 'BRL'}`}
                    </Text>
                  </View>
                </View>
                {service.requiresDeposit ? (
                  <Text style={styles.paymentText}>
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
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: COLORS.textPrimary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE8E0',
  },
  iconButtonPressed: {
    backgroundColor: '#E3DCD2',
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
    backgroundColor: '#E3F2EF',
  },
  headerActionPressed: {
    backgroundColor: '#D3E8E2',
  },
  headerActionDisabled: {
    opacity: 0.35,
  },
  noticeCard: {
    backgroundColor: COLORS.warningBackground,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4DEBE',
  },
  noticeText: {
    color: COLORS.warningText,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FDEDEE',
  },
  errorBannerText: {
    color: COLORS.destructive,
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
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#16273D',
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
    color: COLORS.textPrimary,
  },
  cardDescription: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: COLORS.textSecondary,
  },
  badge: {
    backgroundColor: COLORS.badgeBackground,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: COLORS.badgeText,
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
    backgroundColor: '#F7F3EB',
  },
  actionButtonPressed: {
    backgroundColor: '#EDE5DA',
  },
  actionButtonDanger: {
    backgroundColor: '#FBEFF0',
  },
  actionButtonDangerPressed: {
    backgroundColor: '#F4E0E2',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EFE6DB',
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
    color: COLORS.textPrimary,
  },
  paymentText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2F7A6D',
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
    color: COLORS.textPrimary,
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
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: COLORS.textPrimary,
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
    color: COLORS.errorText,
  },
});

export default ServiceCatalogScreen;
