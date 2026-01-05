import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import i18n from 'i18n';
import { Icon } from '@/components-next/common/icon';
import { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { agentSettingsActions } from '@/store/agent-settings/agentSettingsActions';
import { selectAgentSettingsData, selectAgentSettingsIsFetching } from '@/store/agent-settings';
import { showToast } from '@/utils/toastUtils';
import { AddIcon, ChevronLeft, ClockIcon, Trash } from '@/svg-icons';
import { OfficeHoursService } from '@/services/OfficeHoursService';
import { useSaraColors, useIsDarkMode, type SaraColors } from '@/hooks/useSaraColors';

import type { WorkingPlanBlock } from '@/services/OfficeHoursService';

type OfficeHoursNavigation = NativeStackNavigationProp<SettingsStackParamList, 'OfficeHoursScreen'>;

type BreakWindow = { start: string; end: string };

type DayHours = {
  enabled: boolean;
  start: string;
  end: string;
  breaks: BreakWindow[];
};

type WeeklyHours = Record<DayKey, DayHours>;

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type DateException = {
  date: string;
  start: string;
  end: string;
};

// Static colors that don't change between themes (semantic colors for warnings, errors, etc.)
const DESTRUCTIVE_COLOR = '#B54747';
const WHITE = '#FFFFFF';

// Theme-aware UI colors helper
const getUiColors = (isDark: boolean, colors: SaraColors) => ({
  tagBg: isDark ? '#1E3A2E' : '#CCE6DE',
  tagText: isDark ? '#6BC4B8' : '#0F4D49',
  dangerIconBg: isDark ? '#3D2020' : '#F8E8E8',
  dangerIconPressedBg: isDark ? '#4D2828' : '#F5D9D9',
  disabledDangerIconBg: isDark ? '#2D1A1A' : '#F1D7D7',
  disabledText: isDark ? '#666666' : '#A8ABA9',
  disabledPrimaryBg: isDark ? '#1E3A38' : '#C4DAD6',
  disabledPrimaryText: isDark ? '#4CB6AC' : '#49605C',
});

const dayOrder: { key: DayKey; label: string }[] = [
  { key: 'monday', label: i18n.t('COMMON.DAY.MONDAY') || 'Monday' },
  { key: 'tuesday', label: i18n.t('COMMON.DAY.TUESDAY') || 'Tuesday' },
  { key: 'wednesday', label: i18n.t('COMMON.DAY.WEDNESDAY') || 'Wednesday' },
  { key: 'thursday', label: i18n.t('COMMON.DAY.THURSDAY') || 'Thursday' },
  { key: 'friday', label: i18n.t('COMMON.DAY.FRIDAY') || 'Friday' },
  { key: 'saturday', label: i18n.t('COMMON.DAY.SATURDAY') || 'Saturday' },
  { key: 'sunday', label: i18n.t('COMMON.DAY.SUNDAY') || 'Sunday' },
];

const emptyBreak: BreakWindow = { start: '12:00', end: '13:00' };

const defaultDay = (): DayHours => ({
  enabled: false,
  start: '09:00',
  end: '18:00',
  breaks: [],
});

const buildEmptyWeeklyHours = (): WeeklyHours => ({
  monday: defaultDay(),
  tuesday: defaultDay(),
  wednesday: defaultDay(),
  thursday: defaultDay(),
  friday: defaultDay(),
  saturday: defaultDay(),
  sunday: defaultDay(),
});

const normalizeTime = (value: string | null | undefined): string => {
  if (!value) {
    return '';
  }
  if (value.length >= 5) {
    return value.slice(0, 5);
  }
  return value;
};

const hydratePlan = (
  plan: Record<string, WorkingPlanBlock | null> | null | undefined,
): WeeklyHours => {
  const base = buildEmptyWeeklyHours();
  if (!plan) {
    return base;
  }
  dayOrder.forEach(({ key }) => {
    const remote = plan[key];
    if (remote && remote.start && remote.end) {
      base[key] = {
        enabled: true,
        start: normalizeTime(remote.start),
        end: normalizeTime(remote.end),
        breaks: Array.isArray(remote.breaks)
          ? remote.breaks
              .filter(breakWindow => breakWindow?.start && breakWindow?.end)
              .map(breakWindow => ({
                start: normalizeTime(breakWindow.start),
                end: normalizeTime(breakWindow.end),
              }))
          : [],
      };
    }
  });
  return base;
};

const hydrateExceptions = (
  exceptions: Record<string, WorkingPlanBlock | null> | null | undefined,
): DateException[] => {
  if (!exceptions) {
    return [];
  }
  return Object.entries(exceptions)
    .map(([date, block]) => ({
      date,
      start: normalizeTime(block?.start) || '',
      end: normalizeTime(block?.end) || '',
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const filterBreaks = (breaks: BreakWindow[]): BreakWindow[] =>
  breaks.filter(item => item.start && item.end);

const toApiDateTime = (value: string): string => {
  if (!value) {
    return value;
  }
  if (value.includes('T')) {
    const [date, timeRaw] = value.split('T');
    const time = timeRaw?.replace('Z', '') ?? '';
    const normalized = time.length === 5 ? `${time}:00` : time;
    return `${date} ${normalized}`;
  }
  if (value.length === 16 && value.includes(' ')) {
    return `${value}:00`;
  }
  return value;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

type TagProps = {
  label: string;
  colors: SaraColors;
  isDark: boolean;
};

const Tag = ({ label, colors, isDark }: TagProps) => {
  const uiColors = getUiColors(isDark, colors);
  return (
    <View style={[styles.tag, { backgroundColor: uiColors.tagBg }]}>
      <Text style={[styles.tagText, { color: uiColors.tagText }]}>{label}</Text>
    </View>
  );
};

type OutlineButtonProps = {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  colors: SaraColors;
  isDark: boolean;
};

const OutlineButton = ({ label, onPress, icon, disabled, colors, isDark }: OutlineButtonProps) => {
  const uiColors = getUiColors(isDark, colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.outlineButton,
        { borderColor: colors.border },
        disabled ? styles.disabledButton : null,
        pressed && !disabled ? { backgroundColor: colors.chip } : null,
      ]}>
      <View style={styles.outlineButtonContent}>
        {icon}
        <Text
          style={[
            styles.outlineButtonText,
            { color: colors.textSecondary },
            disabled ? { color: uiColors.disabledText } : null,
          ]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  colors: SaraColors;
  isDark: boolean;
};

const PrimaryButton = ({ label, onPress, disabled, colors, isDark }: PrimaryButtonProps) => {
  const uiColors = getUiColors(isDark, colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.accent },
        disabled ? { backgroundColor: uiColors.disabledPrimaryBg } : null,
        pressed && !disabled ? { opacity: 0.92 } : null,
      ]}>
      <Text
        style={[
          styles.primaryButtonText,
          disabled ? { color: uiColors.disabledPrimaryText } : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

type DangerIconButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  colors: SaraColors;
  isDark: boolean;
};

const DangerIconButton = ({ onPress, disabled, colors, isDark }: DangerIconButtonProps) => {
  const uiColors = getUiColors(isDark, colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.dangerIconButton,
        { backgroundColor: uiColors.dangerIconBg },
        disabled ? { backgroundColor: uiColors.disabledDangerIconBg, opacity: 0.6 } : null,
        pressed && !disabled ? { backgroundColor: uiColors.dangerIconPressedBg } : null,
      ]}>
      <Icon icon={<Trash />} size={20} />
    </Pressable>
  );
};

const OfficeHoursScreen = () => {
  const navigation = useNavigation<OfficeHoursNavigation>();
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  const agentId = useAppSelector(state => state.auth.chatwootSession?.agentId ?? null);
  const agentSettings = useAppSelector(selectAgentSettingsData);
  const agentSettingsLoading = useAppSelector(selectAgentSettingsIsFetching);

  // Memoize switch track colors based on theme
  const switchTrackColors = useMemo(
    () => ({
      true: colors.accent,
      false: colors.border,
    }),
    [colors.accent, colors.border],
  );

  const easyAppointments = agentSettings?.integrations.easyAppointments ?? null;
  const providerId = easyAppointments?.providerId ? String(easyAppointments.providerId) : null;

  const fallbackServiceId = useMemo(() => {
    if (easyAppointments?.serviceId) {
      return String(easyAppointments.serviceId);
    }
    const firstMapped = agentSettings?.services.find(service => service.eaServiceId);
    return firstMapped?.eaServiceId != null ? String(firstMapped.eaServiceId) : null;
  }, [agentSettings?.services, easyAppointments?.serviceId]);

  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(buildEmptyWeeklyHours);
  const [dateExceptions, setDateExceptions] = useState<DateException[]>([]);
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(fallbackServiceId);
  const [isSaving, setIsSaving] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [probeLoading, setProbeLoading] = useState(false);
  const [probeResults, setProbeResults] = useState<string[]>([]);
  const [closureStart, setClosureStart] = useState('');
  const [closureEnd, setClosureEnd] = useState('');
  const [closureNotes, setClosureNotes] = useState('');
  const [probeDate, setProbeDate] = useState('');

  useEffect(() => {
    if (!agentSettings && !agentSettingsLoading) {
      dispatch(agentSettingsActions.fetchAgentSettings());
    }
  }, [agentSettings, agentSettingsLoading, dispatch]);

  useEffect(() => {
    setServiceId(fallbackServiceId);
  }, [fallbackServiceId]);

  const loadSnapshot = useCallback(async () => {
    if (!providerId) {
      setWeeklyHours(buildEmptyWeeklyHours());
      setDateExceptions([]);
      setSnapshotError(i18n.t('SETTINGS.OFFICE_HOURS_PROVIDER_MISSING'));
      setSnapshotLoading(false);
      return;
    }

    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const snapshot = await OfficeHoursService.fetchWeekly({ providerId, agentId });
      setWeeklyHours(hydratePlan(snapshot.workingPlan));
      setDateExceptions(hydrateExceptions(snapshot.workingPlanExceptions));
      if (snapshot.service?.id) {
        setServiceId(snapshot.service.id);
      }
      setProbeResults([]);
    } catch (error) {
      const message = getErrorMessage(error, i18n.t('SETTINGS.OFFICE_HOURS_LOAD_ERROR'));
      setSnapshotError(message);
      showToast({ message });
    } finally {
      setSnapshotLoading(false);
    }
  }, [agentId, providerId]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const toggleDay = useCallback((day: DayKey) => {
    setWeeklyHours(prev => {
      const current = prev[day];
      const enabled = !current.enabled;
      return {
        ...prev,
        [day]: {
          ...current,
          enabled,
          breaks: enabled ? current.breaks : [],
        },
      };
    });
  }, []);

  const updateDayTime = useCallback((day: DayKey, field: 'start' | 'end', value: string) => {
    setWeeklyHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }, []);

  const addBreak = useCallback((day: DayKey) => {
    setWeeklyHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...prev[day].breaks, { ...emptyBreak }],
      },
    }));
  }, []);

  const removeBreak = useCallback((day: DayKey, index: number) => {
    setWeeklyHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const updateBreak = useCallback(
    (day: DayKey, index: number, field: 'start' | 'end', value: string) => {
      setWeeklyHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          breaks: prev[day].breaks.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
          ),
        },
      }));
    },
    [],
  );

  const addException = useCallback(() => {
    setDateExceptions(prev => [...prev, { date: '', start: '', end: '' }]);
  }, []);

  const removeException = useCallback((index: number) => {
    setDateExceptions(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateException = useCallback(
    (index: number, field: keyof DateException, value: string) => {
      setDateExceptions(prev =>
        prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
      );
    },
    [],
  );

  const handleSaveWeeklyHours = useCallback(async () => {
    if (!providerId) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_PROVIDER_MISSING') });
      return;
    }

    const invalidDays = dayOrder
      .filter(
        ({ key }) => weeklyHours[key].enabled && (!weeklyHours[key].start || !weeklyHours[key].end),
      )
      .map(({ label }) => label);

    if (invalidDays.length > 0) {
      showToast({
        message: i18n.t('SETTINGS.OFFICE_HOURS_MISSING_TIMES', {
          days: invalidDays.join(', '),
        }),
      });
      return;
    }

    for (const exception of dateExceptions) {
      const hasValue = exception.date || exception.start || exception.end;
      if (!hasValue) {
        continue;
      }
      if (!exception.date || !exception.start || !exception.end) {
        showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_EXCEPTION_INCOMPLETE') });
        return;
      }
    }

    const workingPlanPayload: Record<string, WorkingPlanBlock | null> = {};
    dayOrder.forEach(({ key }) => {
      const config = weeklyHours[key];
      if (!config.enabled) {
        workingPlanPayload[key] = null;
        return;
      }
      workingPlanPayload[key] = {
        start: config.start,
        end: config.end,
        breaks: filterBreaks(config.breaks),
      };
    });

    const exceptionPayload: Record<string, WorkingPlanBlock | null> = {};
    dateExceptions.forEach(item => {
      const hasValue = item.date || item.start || item.end;
      if (!hasValue) {
        return;
      }
      exceptionPayload[item.date] = {
        start: item.start,
        end: item.end,
        breaks: [],
      };
    });

    setIsSaving(true);
    try {
      await OfficeHoursService.updateWeekly({
        payload: {
          providerId,
          workingPlan: workingPlanPayload,
          workingPlanExceptions: exceptionPayload,
        },
        agentId,
      });
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_UPDATED_SUCCESS') });
      await loadSnapshot();
    } catch (error) {
      showToast({ message: getErrorMessage(error, i18n.t('SETTINGS.OFFICE_HOURS_UPDATE_ERROR')) });
    } finally {
      setIsSaving(false);
    }
  }, [agentId, dateExceptions, loadSnapshot, providerId, weeklyHours]);

  const handleCreateClosure = useCallback(async () => {
    if (!providerId) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_PROVIDER_MISSING') });
      return;
    }
    if (!closureStart || !closureEnd) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_CLOSURE_REQUIRED') });
      return;
    }

    const start = toApiDateTime(closureStart);
    const end = toApiDateTime(closureEnd);

    if (start >= end) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_CLOSURE_INVALID_RANGE') });
      return;
    }

    setBlockLoading(true);
    try {
      await OfficeHoursService.createUnavailability({
        payload: {
          providerId,
          start,
          end,
          notes: closureNotes ? closureNotes.trim() : null,
        },
        agentId,
      });
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_CLOSURE_SUCCESS') });
      setClosureStart('');
      setClosureEnd('');
      setClosureNotes('');
    } catch (error) {
      showToast({ message: getErrorMessage(error, i18n.t('SETTINGS.OFFICE_HOURS_CLOSURE_ERROR')) });
    } finally {
      setBlockLoading(false);
    }
  }, [agentId, closureEnd, closureNotes, closureStart, providerId]);

  const handleProbeAvailability = useCallback(async () => {
    if (!providerId) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_PROVIDER_MISSING') });
      return;
    }
    if (!serviceId) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_SERVICE_MISSING') });
      return;
    }
    if (!probeDate) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_PROBE_DATE_REQUIRED') });
      return;
    }

    setProbeLoading(true);
    try {
      const slots = await OfficeHoursService.probe({
        providerId,
        serviceId,
        date: probeDate,
        agentId,
      });
      setProbeResults(slots);
      if (slots.length === 0) {
        showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_NO_SLOTS') });
      }
    } catch (error) {
      showToast({ message: getErrorMessage(error, i18n.t('SETTINGS.OFFICE_HOURS_PROBE_ERROR')) });
      setProbeResults([]);
    } finally {
      setProbeLoading(false);
    }
  }, [agentId, probeDate, providerId, serviceId]);

  const editingDisabled = snapshotLoading || isSaving || !providerId;

  const DayEditor = useCallback(
    ({ dayKey, label }: { dayKey: DayKey; label: string }) => {
      const hours = weeklyHours[dayKey];
      return (
        <View style={styles.dayCard}>
          <View style={styles.dayRow}>
            <Text style={[styles.dayLabel, { color: colors.textPrimary }]}>{label}</Text>
            <Switch
              value={hours.enabled}
              onValueChange={() => toggleDay(dayKey)}
              trackColor={switchTrackColors}
              ios_backgroundColor={switchTrackColors.false}
              thumbColor={Platform.OS === 'android' ? colors.backgroundLight : undefined}
              disabled={editingDisabled}
            />
          </View>
          {hours.enabled ? (
            <View style={styles.dayDetails}>
              <View style={styles.doubleFieldRow}>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {i18n.t('SETTINGS.START_LABEL')}
                  </Text>
                  <TextInput
                    value={hours.start}
                    onChangeText={value => updateDayTime(dayKey, 'start', value)}
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="09:00"
                    placeholderTextColor={colors.textMeta}
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {i18n.t('SETTINGS.END_LABEL')}
                  </Text>
                  <TextInput
                    value={hours.end}
                    onChangeText={value => updateDayTime(dayKey, 'end', value)}
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="18:00"
                    placeholderTextColor={colors.textMeta}
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
              </View>

              {hours.breaks.map((breakWindow, index) => (
                <View
                  key={`${dayKey}-break-${index}`}
                  style={[styles.breakCard, { borderColor: colors.border }]}>
                  <View style={styles.breakHeader}>
                    <View style={styles.breakHeaderContent}>
                      <Icon
                        icon={<ClockIcon stroke={colors.textSecondary} />}
                        size={18}
                        style={styles.breakIcon}
                      />
                      <Text style={[styles.breakTitle, { color: colors.textSecondary }]}>
                        {i18n.t('SETTINGS.BREAK_LABEL')} {index + 1}
                      </Text>
                    </View>
                    <DangerIconButton
                      onPress={() => removeBreak(dayKey, index)}
                      disabled={editingDisabled}
                      colors={colors}
                      isDark={isDark}
                    />
                  </View>
                  <View style={styles.doubleFieldRow}>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        {i18n.t('SETTINGS.START_LABEL')}
                      </Text>
                      <TextInput
                        value={breakWindow.start}
                        onChangeText={value => updateBreak(dayKey, index, 'start', value)}
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          },
                        ]}
                        placeholder="12:00"
                        placeholderTextColor={colors.textMeta}
                        keyboardType="numbers-and-punctuation"
                        editable={!editingDisabled}
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                        {i18n.t('SETTINGS.END_LABEL')}
                      </Text>
                      <TextInput
                        value={breakWindow.end}
                        onChangeText={value => updateBreak(dayKey, index, 'end', value)}
                        style={[
                          styles.input,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.textPrimary,
                          },
                        ]}
                        placeholder="13:00"
                        placeholderTextColor={colors.textMeta}
                        keyboardType="numbers-and-punctuation"
                        editable={!editingDisabled}
                      />
                    </View>
                  </View>
                </View>
              ))}

              <OutlineButton
                label={i18n.t('SETTINGS.ADD_BREAK')}
                onPress={() => addBreak(dayKey)}
                icon={<Icon icon={<AddIcon stroke={colors.textSecondary} />} size={18} />}
                disabled={editingDisabled}
                colors={colors}
                isDark={isDark}
              />
            </View>
          ) : null}
        </View>
      );
    },
    [
      addBreak,
      colors,
      editingDisabled,
      isDark,
      removeBreak,
      switchTrackColors,
      toggleDay,
      updateBreak,
      updateDayTime,
      weeklyHours,
    ],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.backgroundLight,
            borderBottomColor: colors.border,
          },
        ]}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? { backgroundColor: colors.chip } : null,
          ]}>
          <Icon icon={<ChevronLeft stroke={colors.textPrimary} />} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {i18n.t('SETTINGS.OFFICE_HOURS')}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={snapshotLoading}
            onRefresh={() => {
              void loadSnapshot();
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundLight,
              shadowColor: colors.textPrimary,
            },
          ]}>
          <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
            {i18n.t('SETTINGS.WEEKLY_HOURS_TITLE')}
          </Text>
          {snapshotLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {i18n.t('COMMON.LOADING')}
              </Text>
            </View>
          ) : null}
          {snapshotError ? <Text style={styles.errorText}>{snapshotError}</Text> : null}
          <View>
            {dayOrder.map(({ key, label }, index) => (
              <View key={key}>
                <DayEditor dayKey={key} label={label} />
                {index !== dayOrder.length - 1 ? (
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                ) : null}
              </View>
            ))}
          </View>
          <PrimaryButton
            label={i18n.t('SETTINGS.SAVE_WEEKLY_HOURS')}
            onPress={handleSaveWeeklyHours}
            disabled={editingDisabled || isSaving}
            colors={colors}
            isDark={isDark}
          />
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundLight,
              shadowColor: colors.textPrimary,
            },
          ]}>
          <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
            {i18n.t('SETTINGS.DATE_EXCEPTIONS')}
          </Text>
          <View style={styles.cardBody}>
            {dateExceptions.map((item, index) => (
              <View
                key={`exception-${index}`}
                style={[styles.exceptionCard, { borderColor: colors.border }]}>
                <View style={styles.exceptionHeader}>
                  <Text style={[styles.exceptionTitle, { color: colors.textPrimary }]}>
                    {i18n.t('SETTINGS.EXCEPTION_LABEL')} {index + 1}
                  </Text>
                  <DangerIconButton
                    onPress={() => removeException(index)}
                    disabled={editingDisabled}
                    colors={colors}
                    isDark={isDark}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                    {i18n.t('SETTINGS.DATE_LABEL')}
                  </Text>
                  <TextInput
                    value={item.date}
                    onChangeText={value => updateException(index, 'date', value)}
                    style={[
                      styles.input,
                      {
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="2024-12-25"
                    placeholderTextColor={colors.textMeta}
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
                <View style={styles.doubleFieldRow}>
                  <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {i18n.t('SETTINGS.START_LABEL')}
                    </Text>
                    <TextInput
                      value={item.start}
                      onChangeText={value => updateException(index, 'start', value)}
                      style={[
                        styles.input,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="09:00"
                      placeholderTextColor={colors.textMeta}
                      keyboardType="numbers-and-punctuation"
                      editable={!editingDisabled}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      {i18n.t('SETTINGS.END_LABEL')}
                    </Text>
                    <TextInput
                      value={item.end}
                      onChangeText={value => updateException(index, 'end', value)}
                      style={[
                        styles.input,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="12:00"
                      placeholderTextColor={colors.textMeta}
                      keyboardType="numbers-and-punctuation"
                      editable={!editingDisabled}
                    />
                  </View>
                </View>
              </View>
            ))}
            <OutlineButton
              label={i18n.t('SETTINGS.ADD_EXCEPTION')}
              onPress={addException}
              icon={<Icon icon={<AddIcon stroke={colors.textSecondary} />} size={18} />}
              disabled={editingDisabled}
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundLight,
              shadowColor: colors.textPrimary,
            },
          ]}>
          <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
            {i18n.t('SETTINGS.UNAVAILABILITY_BLOCK')}
          </Text>
          <View style={styles.cardBody}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SETTINGS.START_LABEL')}
              </Text>
              <TextInput
                value={closureStart}
                onChangeText={setClosureStart}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="2024-12-31 09:00"
                placeholderTextColor={colors.textMeta}
                keyboardType="numbers-and-punctuation"
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SETTINGS.END_LABEL')}
              </Text>
              <TextInput
                value={closureEnd}
                onChangeText={setClosureEnd}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="2024-12-31 17:00"
                placeholderTextColor={colors.textMeta}
                keyboardType="numbers-and-punctuation"
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SETTINGS.NOTES_OPTIONAL_LABEL')}
              </Text>
              <TextInput
                value={closureNotes}
                onChangeText={setClosureNotes}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Holiday"
                placeholderTextColor={colors.textMeta}
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <PrimaryButton
              label={i18n.t('SETTINGS.CREATE_CLOSURE')}
              onPress={handleCreateClosure}
              disabled={blockLoading || !providerId}
              colors={colors}
              isDark={isDark}
            />
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundLight,
              shadowColor: colors.textPrimary,
            },
          ]}>
          <Text style={[styles.cardSectionTitle, { color: colors.textPrimary }]}>
            {i18n.t('SETTINGS.PROBE_CUSTOMER_VIEW')}
          </Text>
          <View style={styles.cardBody}>
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {i18n.t('SETTINGS.DATE_LABEL')}
              </Text>
              <TextInput
                value={probeDate}
                onChangeText={setProbeDate}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="2024-12-20"
                placeholderTextColor={colors.textMeta}
                keyboardType="numbers-and-punctuation"
                editable={!probeLoading && Boolean(providerId)}
              />
            </View>
            <PrimaryButton
              label={i18n.t('SETTINGS.CHECK_AVAILABILITY')}
              onPress={handleProbeAvailability}
              disabled={probeLoading || !providerId}
              colors={colors}
              isDark={isDark}
            />
            {probeLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  {i18n.t('COMMON.LOADING')}
                </Text>
              </View>
            ) : probeResults.length > 0 ? (
              <View style={styles.probeResults}>
                <Text style={[styles.probeLabel, { color: colors.textSecondary }]}>
                  {i18n.t('SETTINGS.AVAILABLE_SLOTS')}
                </Text>
                <View style={styles.probeTags}>
                  {probeResults.map(slot => (
                    <Tag key={slot} label={slot} colors={colors} isDark={isDark} />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OfficeHoursScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Inter-Medium',
  },
  headerRightPlaceholder: {
    width: 36,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardBody: {
    marginTop: 16,
    gap: 12,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  outlineButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outlineButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  dangerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCard: {
    paddingVertical: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
  },
  dayDetails: {
    marginTop: 12,
    gap: 12,
  },
  doubleFieldRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  breakCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  breakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakIcon: {
    width: 18,
  },
  breakTitle: {
    fontSize: 14,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  exceptionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  exceptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exceptionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  probeResults: {
    marginTop: 12,
    gap: 8,
  },
  probeLabel: {
    fontSize: 13,
  },
  probeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerSpacing: {
    height: 24,
  },
  disabledButton: {
    opacity: 0.55,
  },
  errorText: {
    color: DESTRUCTIVE_COLOR,
    fontSize: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
});
