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
import { tailwind } from '@/theme';
import { Icon } from '@/components-next/common/icon';
import { SettingsStackParamList } from '@/navigation/stack/SettingsStack';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { agentSettingsActions } from '@/store/agent-settings/agentSettingsActions';
import {
  selectAgentSettingsData,
  selectAgentSettingsIsFetching,
} from '@/store/agent-settings';
import { showToast } from '@/utils/toastUtils';
import { AddIcon, ChevronLeft, ClockIcon, Trash } from '@/svg-icons';
import { OfficeHoursService } from '@/services/OfficeHoursService';

import type { WorkingPlanBlock } from '@/services/OfficeHoursService';

type OfficeHoursNavigation = NativeStackNavigationProp<
  SettingsStackParamList,
  'OfficeHoursScreen'
>;

type BreakWindow = { start: string; end: string };

type DayHours = {
  enabled: boolean;
  start: string;
  end: string;
  breaks: BreakWindow[];
};

type WeeklyHours = Record<DayKey, DayHours>;

type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type DateException = {
  date: string;
  start: string;
  end: string;
};

// Resolve Sara theme colors from tailwind config
const SARA_BACKGROUND = tailwind.color('sara-background') ?? '#F8F5F3';
const SARA_BACKGROUND_LIGHT = tailwind.color('sara-background-light') ?? '#FFFFFF';
const SARA_ACCENT = tailwind.color('sara-accent') ?? '#4CB6AC';
const SARA_TEXT_PRIMARY = tailwind.color('sara-text-primary') ?? '#16273D';
const SARA_TEXT_SECONDARY = tailwind.color('sara-text-secondary') ?? '#4B5D6E';
const SARA_BORDER = tailwind.color('sara-border') ?? '#E6E2DD';
const SARA_CHIP = tailwind.color('sara-chip') ?? '#F5F3F0';

// Additional colors used in this screen (not in core Sara palette)
const TAG_BG = tailwind.color('jade-200') ?? '#CCE6DE';
const TAG_TEXT = tailwind.color('teal-900') ?? '#0F4D49';
const DESTRUCTIVE_COLOR = tailwind.color('red-800') ?? '#B54747';
const INPUT_BG = tailwind.color('sara-background') ?? '#FDFBF9';

// Button state colors
const DANGER_BUTTON_PRESSED_BG = tailwind.color('red-100') ?? '#F5D9D9';
const DANGER_ICON_BG = tailwind.color('red-50') ?? '#F8E8E8';
const DISABLED_DANGER_ICON_BG = tailwind.color('red-100') ?? '#F1D7D7';
const WHITE = tailwind.color('white') ?? '#FFFFFF';
const DISABLED_TEXT = tailwind.color('gray-400') ?? '#A8ABA9';
const DISABLED_PRIMARY_BG = tailwind.color('teal-200') ?? '#C4DAD6';
const DISABLED_PRIMARY_TEXT = tailwind.color('teal-700') ?? '#49605C';

const SWITCH_TRACK_COLORS = {
  true: SARA_ACCENT,
  false: SARA_BORDER,
} as const;

const dayOrder: Array<{ key: DayKey; label: string }> = [
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

const hydratePlan = (plan: Record<string, WorkingPlanBlock | null> | null | undefined): WeeklyHours => {
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

const Tag = ({ label }: { label: string }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const OutlineButton = ({
  label,
  onPress,
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.outlineButton,
      disabled ? styles.disabledButton : null,
      pressed && !disabled ? { backgroundColor: SARA_CHIP } : null,
    ]}>
    <View style={styles.outlineButtonContent}>
      {icon}
      <Text style={[styles.outlineButtonText, disabled ? styles.disabledText : null]}>{label}</Text>
    </View>
  </Pressable>
);

const PrimaryButton = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.primaryButton,
      disabled ? styles.disabledPrimary : null,
      pressed && !disabled ? { opacity: 0.92 } : null,
    ]}>
    <Text style={[styles.primaryButtonText, disabled ? styles.disabledPrimaryText : null]}>
      {label}
    </Text>
  </Pressable>
);

const DangerIconButton = ({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.dangerIconButton,
      disabled ? styles.disabledDangerIcon : null,
      pressed && !disabled ? { backgroundColor: DANGER_BUTTON_PRESSED_BG } : null,
    ]}>
    <Icon icon={<Trash />} size={20} />
  </Pressable>
);

const OfficeHoursScreen = () => {
  const navigation = useNavigation<OfficeHoursNavigation>();
  const dispatch = useAppDispatch();
  const agentId = useAppSelector(state => state.auth.chatwootSession?.agentId ?? null);
  const agentSettings = useAppSelector(selectAgentSettingsData);
  const agentSettingsLoading = useAppSelector(selectAgentSettingsIsFetching);

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
          breaks: prev[day].breaks.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
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

  const updateException = useCallback((index: number, field: keyof DateException, value: string) => {
    setDateExceptions(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }, []);

  const handleSaveWeeklyHours = useCallback(async () => {
    if (!providerId) {
      showToast({ message: i18n.t('SETTINGS.OFFICE_HOURS_PROVIDER_MISSING') });
      return;
    }

    const invalidDays = dayOrder
      .filter(({ key }) => weeklyHours[key].enabled && (!weeklyHours[key].start || !weeklyHours[key].end))
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
            <Text style={styles.dayLabel}>{label}</Text>
            <Switch
              value={hours.enabled}
              onValueChange={() => toggleDay(dayKey)}
              trackColor={SWITCH_TRACK_COLORS}
              ios_backgroundColor={SWITCH_TRACK_COLORS.false}
              thumbColor={Platform.OS === 'android' ? SARA_BACKGROUND_LIGHT : undefined}
              disabled={editingDisabled}
            />
          </View>
          {hours.enabled ? (
            <View style={styles.dayDetails}>
              <View style={styles.doubleFieldRow}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.START_LABEL')}</Text>
                  <TextInput
                    value={hours.start}
                    onChangeText={value => updateDayTime(dayKey, 'start', value)}
                    style={styles.input}
                    placeholder="09:00"
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.END_LABEL')}</Text>
                  <TextInput
                    value={hours.end}
                    onChangeText={value => updateDayTime(dayKey, 'end', value)}
                    style={styles.input}
                    placeholder="18:00"
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
              </View>

              {hours.breaks.map((breakWindow, index) => (
                <View key={`${dayKey}-break-${index}`} style={styles.breakCard}>
                  <View style={styles.breakHeader}>
                    <View style={styles.breakHeaderContent}>
                      <Icon
                        icon={<ClockIcon stroke={SARA_TEXT_SECONDARY} />}
                        size={18}
                        style={styles.breakIcon}
                      />
                      <Text style={styles.breakTitle}>
                        {i18n.t('SETTINGS.BREAK_LABEL')} {index + 1}
                      </Text>
                    </View>
                    <DangerIconButton
                      onPress={() => removeBreak(dayKey, index)}
                      disabled={editingDisabled}
                    />
                  </View>
                  <View style={styles.doubleFieldRow}>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.START_LABEL')}</Text>
                      <TextInput
                        value={breakWindow.start}
                        onChangeText={value => updateBreak(dayKey, index, 'start', value)}
                        style={styles.input}
                        placeholder="12:00"
                        keyboardType="numbers-and-punctuation"
                        editable={!editingDisabled}
                      />
                    </View>
                    <View style={styles.field}>
                      <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.END_LABEL')}</Text>
                      <TextInput
                        value={breakWindow.end}
                        onChangeText={value => updateBreak(dayKey, index, 'end', value)}
                        style={styles.input}
                        placeholder="13:00"
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
                icon={<Icon icon={<AddIcon stroke={SARA_TEXT_SECONDARY} />} size={18} />}
                disabled={editingDisabled}
              />
            </View>
          ) : null}
        </View>
      );
    },
    [addBreak, editingDisabled, removeBreak, toggleDay, updateBreak, updateDayTime, weeklyHours],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed ? { backgroundColor: SARA_CHIP } : null,
          ]}>
          <Icon icon={<ChevronLeft stroke={SARA_TEXT_PRIMARY} />} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>{i18n.t('SETTINGS.OFFICE_HOURS')}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={snapshotLoading} onRefresh={() => { void loadSnapshot(); }} />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{i18n.t('SETTINGS.WEEKLY_HOURS_TITLE')}</Text>
          {snapshotLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={SARA_ACCENT} />
              <Text style={styles.loadingText}>{i18n.t('COMMON.LOADING')}</Text>
            </View>
          ) : null}
          {snapshotError ? <Text style={styles.errorText}>{snapshotError}</Text> : null}
          <View>
            {dayOrder.map(({ key, label }, index) => (
              <View key={key}>
                <DayEditor dayKey={key} label={label} />
                {index !== dayOrder.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
          <PrimaryButton
            label={i18n.t('SETTINGS.SAVE_WEEKLY_HOURS')}
            onPress={handleSaveWeeklyHours}
            disabled={editingDisabled || isSaving}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{i18n.t('SETTINGS.DATE_EXCEPTIONS')}</Text>
          <View style={styles.cardBody}>
            {dateExceptions.map((item, index) => (
              <View key={`exception-${index}`} style={styles.exceptionCard}>
                <View style={styles.exceptionHeader}>
                  <Text style={styles.exceptionTitle}>
                    {i18n.t('SETTINGS.EXCEPTION_LABEL')} {index + 1}
                  </Text>
                  <DangerIconButton
                    onPress={() => removeException(index)}
                    disabled={editingDisabled}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.DATE_LABEL')}</Text>
                  <TextInput
                    value={item.date}
                    onChangeText={value => updateException(index, 'date', value)}
                    style={styles.input}
                    placeholder="2024-12-25"
                    keyboardType="numbers-and-punctuation"
                    editable={!editingDisabled}
                  />
                </View>
                <View style={styles.doubleFieldRow}>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.START_LABEL')}</Text>
                    <TextInput
                      value={item.start}
                      onChangeText={value => updateException(index, 'start', value)}
                      style={styles.input}
                      placeholder="09:00"
                      keyboardType="numbers-and-punctuation"
                      editable={!editingDisabled}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.END_LABEL')}</Text>
                    <TextInput
                      value={item.end}
                      onChangeText={value => updateException(index, 'end', value)}
                      style={styles.input}
                      placeholder="12:00"
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
              icon={<Icon icon={<AddIcon stroke={SARA_TEXT_SECONDARY} />} size={18} />}
              disabled={editingDisabled}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{i18n.t('SETTINGS.UNAVAILABILITY_BLOCK')}</Text>
          <View style={styles.cardBody}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.START_LABEL')}</Text>
              <TextInput
                value={closureStart}
                onChangeText={setClosureStart}
                style={styles.input}
                placeholder="2024-12-31 09:00"
                keyboardType="numbers-and-punctuation"
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.END_LABEL')}</Text>
              <TextInput
                value={closureEnd}
                onChangeText={setClosureEnd}
                style={styles.input}
                placeholder="2024-12-31 17:00"
                keyboardType="numbers-and-punctuation"
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.NOTES_OPTIONAL_LABEL')}</Text>
              <TextInput
                value={closureNotes}
                onChangeText={setClosureNotes}
                style={styles.input}
                placeholder="Holiday"
                editable={!blockLoading && Boolean(providerId)}
              />
            </View>
            <PrimaryButton
              label={i18n.t('SETTINGS.CREATE_CLOSURE')}
              onPress={handleCreateClosure}
              disabled={blockLoading || !providerId}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>{i18n.t('SETTINGS.PROBE_CUSTOMER_VIEW')}</Text>
          <View style={styles.cardBody}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{i18n.t('SETTINGS.DATE_LABEL')}</Text>
              <TextInput
                value={probeDate}
                onChangeText={setProbeDate}
                style={styles.input}
                placeholder="2024-12-20"
                keyboardType="numbers-and-punctuation"
                editable={!probeLoading && Boolean(providerId)}
              />
            </View>
            <PrimaryButton
              label={i18n.t('SETTINGS.CHECK_AVAILABILITY')}
              onPress={handleProbeAvailability}
              disabled={probeLoading || !providerId}
            />
            {probeLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={SARA_ACCENT} />
                <Text style={styles.loadingText}>{i18n.t('COMMON.LOADING')}</Text>
              </View>
            ) : probeResults.length > 0 ? (
              <View style={styles.probeResults}>
                <Text style={styles.probeLabel}>{i18n.t('SETTINGS.AVAILABLE_SLOTS')}</Text>
                <View style={styles.probeTags}>
                  {probeResults.map(slot => (
                    <Tag key={slot} label={slot} />
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
    backgroundColor: SARA_BACKGROUND,
  },
  header: {
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SARA_BORDER,
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
    color: SARA_TEXT_PRIMARY,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: SARA_TEXT_PRIMARY,
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
    color: SARA_TEXT_PRIMARY,
    marginBottom: 16,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: TAG_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 12,
    color: TAG_TEXT,
    fontFamily: 'Inter-Medium',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: SARA_BORDER,
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
    color: SARA_TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: SARA_ACCENT,
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
    backgroundColor: DANGER_ICON_BG,
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
    color: SARA_TEXT_PRIMARY,
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
    color: SARA_TEXT_SECONDARY,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: SARA_BORDER,
    backgroundColor: INPUT_BG,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: SARA_TEXT_PRIMARY,
  },
  breakCard: {
    borderWidth: 1,
    borderColor: SARA_BORDER,
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
    color: SARA_TEXT_SECONDARY,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SARA_BORDER,
  },
  exceptionCard: {
    borderWidth: 1,
    borderColor: SARA_BORDER,
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
    color: SARA_TEXT_PRIMARY,
    fontFamily: 'Inter-Medium',
  },
  probeResults: {
    marginTop: 12,
    gap: 8,
  },
  probeLabel: {
    fontSize: 13,
    color: SARA_TEXT_SECONDARY,
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
  disabledText: {
    color: DISABLED_TEXT,
  },
  disabledPrimary: {
    backgroundColor: DISABLED_PRIMARY_BG,
  },
  disabledPrimaryText: {
    color: DISABLED_PRIMARY_TEXT,
  },
  disabledDangerIcon: {
    backgroundColor: DISABLED_DANGER_ICON_BG,
    opacity: 0.6,
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
    color: SARA_TEXT_SECONDARY,
  },
});
