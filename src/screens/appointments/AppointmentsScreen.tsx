import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { differenceInMinutes, format, formatDistanceToNow, isSameDay, parse } from 'date-fns';

import { Calendar, type DateData, type MarkedDates } from 'react-native-calendars';
import I18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { EmptyStateIcon } from '@/svg-icons';
import { appointmentsActions } from '@/store/appointments/appointmentsActions';
import {
  selectAppointmentsAgentId,
  selectAppointmentsError,
  selectAppointmentsLastUpdated,
  selectAppointmentsList,
  selectAppointmentsPagination,
  selectAppointmentsUiFlags,
} from '@/store/appointments/appointmentsSelectors';
import type { Appointment } from '@/store/appointments/appointmentsTypes';

const DEFAULT_LIMIT = 25;

const SARA_COLORS = {
  background: '#F8F5F3',
  textPrimary: '#16273D',
  textSecondary: '#4B5D6E',
  cardShadow: '#16273D',
  accent: '#4CB6AC',
};

const STATUS_COLORS: Record<
  string,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  CONFIRMED: { backgroundColor: '#CCE6DE', textColor: '#0F4D49' },
  PENDING: { backgroundColor: '#FFF1D6', textColor: '#8A5A2E' },
  AWAITING_PAYMENT: { backgroundColor: '#FFE6E0', textColor: '#9F4E2F' },
  CANCELLED: { backgroundColor: '#F8E6E6', textColor: '#8A3B3B' },
  NO_SHOW: { backgroundColor: '#E5E7F2', textColor: '#3B4770' },
};

const DEFAULT_STATUS_STYLE = { backgroundColor: '#E2E6EB', textColor: '#3D4A5C' };
const DATE_KEY_FORMAT = 'yyyy-MM-dd';

const getDateKey = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return format(date, DATE_KEY_FORMAT);
};

const formatCalendarDayLabel = (dateKey: string): string | null => {
  if (!dateKey) {
    return null;
  }
  const parsedDate = parse(dateKey, DATE_KEY_FORMAT, new Date());
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }
  return format(parsedDate, 'EEEE, MMMM d');
};

const formatAppointmentTime = (appointment: Appointment): string => {
  if (appointment.startAt) {
    const date = new Date(appointment.startAt);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'EEE, MMM d • HH:mm');
    }
  }
  return I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');
};

const formatAppointmentRange = (appointment: Appointment): string => {
  if (!appointment.startAt) {
    return I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');
  }

  const startDate = new Date(appointment.startAt);
  if (Number.isNaN(startDate.getTime())) {
    return I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');
  }

  if (!appointment.endAt) {
    return format(startDate, 'EEEE, MMMM d, yyyy • HH:mm');
  }

  const endDate = new Date(appointment.endAt);
  if (Number.isNaN(endDate.getTime())) {
    return format(startDate, 'EEEE, MMMM d, yyyy • HH:mm');
  }

  if (isSameDay(startDate, endDate)) {
    return `${format(startDate, 'EEEE, MMMM d, yyyy')} • ${format(startDate, 'HH:mm')} – ${format(
      endDate,
      'HH:mm',
    )}`;
  }

  return `${format(startDate, 'EEEE, MMMM d, yyyy • HH:mm')} → ${format(
    endDate,
    'EEEE, MMMM d, yyyy • HH:mm',
  )}`;
};

const coerceString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
};

const STRING_FIELD_CANDIDATES = [
  'name',
  'full_name',
  'fullName',
  'display_name',
  'displayName',
  'description',
  'title',
  'label',
  'value',
];

const NUMERIC_FIELD_CANDIDATES = [
  'minutes',
  'duration',
  'value',
  'length',
  'amount',
  'total_minutes',
  'totalMinutes',
];

const normalizeKey = (key: string): string => key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const coerceStringDeep = (value: unknown, depth = 0): string | null => {
  if (depth > 4 || value == null) {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return coerceString(value);
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const result = coerceStringDeep(entry, depth + 1);
      if (result) {
        return result;
      }
    }
    return null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const field of STRING_FIELD_CANDIDATES) {
      if (field in record) {
        const candidate = coerceStringDeep(record[field], depth + 1);
        if (candidate) {
          return candidate;
        }
      }
    }
    for (const entry of Object.values(record)) {
      const nested = coerceStringDeep(entry, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
};

const coerceNumberDeep = (value: unknown, depth = 0): number | null => {
  if (depth > 4 || value == null) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+(?:\.\d+)?/);
    if (match) {
      const parsed = Number.parseFloat(match[0]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const result = coerceNumberDeep(entry, depth + 1);
      if (result) {
        return result;
      }
    }
    return null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const field of NUMERIC_FIELD_CANDIDATES) {
      if (field in record) {
        const candidate = coerceNumberDeep(record[field], depth + 1);
        if (candidate) {
          return candidate;
        }
      }
    }
    for (const entry of Object.values(record)) {
      const nested = coerceNumberDeep(entry, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
};

const searchMetadata = (
  value: unknown,
  matcher: (key: string, entry: unknown) => string | number | null,
  depth = 0,
): string | number | null => {
  if (depth > 4 || value == null) {
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = searchMetadata(item, matcher, depth + 1);
      if (result) {
        return result;
      }
    }
    return null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const [key, entry] of Object.entries(record)) {
      const match = matcher(key, entry);
      if (match) {
        return match;
      }
      const nested = searchMetadata(entry, matcher, depth + 1);
      if (nested) {
        return nested;
      }
    }
  }
  return null;
};

const extractProviderName = (appointment: Appointment): string | null => {
  if (appointment.providerName) {
    const direct = coerceString(appointment.providerName);
    if (direct) {
      return direct;
    }
  }
  const metadata = appointment.metadata ?? {};
  const directSources: unknown[] = [
    metadata.provider,
    metadata.provider_name,
    metadata.providerName,
    metadata.provider_display_name,
    metadata.providerDisplayName,
    metadata.provider_full_name,
    metadata.providerFullName,
    metadata.staff,
    metadata.staff_name,
    metadata.staffName,
    metadata.team_member,
    metadata.teamMember,
    metadata.host,
    metadata.hosts,
    metadata.practitioner,
    metadata.practitioner_name,
    metadata.practitionerName,
    metadata.doctor,
    metadata.coach,
    metadata.specialist,
  ];

  for (const source of directSources) {
    const resolved = coerceStringDeep(source);
    if (resolved) {
      return resolved;
    }
  }

  const providerPatterns = [
    'provider',
    'staff',
    'practitioner',
    'host',
    'coach',
    'doctor',
    'therapist',
    'mentor',
    'specialist',
    'consultant',
  ];

  const viaTraversal = searchMetadata(metadata, (rawKey, entry) => {
    const normalized = normalizeKey(rawKey);
    if (providerPatterns.some(pattern => normalized.includes(pattern))) {
      return coerceStringDeep(entry);
    }
    return null;
  });

  return typeof viaTraversal === 'string' ? viaTraversal : null;
};

const extractDurationMinutes = (appointment: Appointment): number | null => {
  if (appointment.durationMinutes && appointment.durationMinutes > 0) {
    return appointment.durationMinutes;
  }
  if (appointment.startAt && appointment.endAt) {
    const startDate = new Date(appointment.startAt);
    const endDate = new Date(appointment.endAt);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      const diff = differenceInMinutes(endDate, startDate);
      if (diff > 0) {
        return diff;
      }
    }
  }

  const metadata = appointment.metadata ?? {};
  const metadataCandidates: unknown[] = [
    metadata.duration,
    metadata.duration_minutes,
    metadata.durationMinutes,
    metadata.duration_mins,
    metadata.appointment_duration,
    metadata.appointmentDuration,
    metadata.appointment_length,
    metadata.appointmentLength,
    metadata.service_duration,
    metadata.serviceDuration,
    metadata.slot_duration,
    metadata.slotDuration,
    metadata.length,
  ];

  for (const candidate of metadataCandidates) {
    const minutes = coerceNumberDeep(candidate);
    if (minutes && minutes > 0) {
      return minutes;
    }
  }

  const durationPatterns = ['duration', 'length', 'slot'];
  const viaTraversal = searchMetadata(metadata, (rawKey, entry) => {
    const normalized = normalizeKey(rawKey);
    if (durationPatterns.some(pattern => normalized.includes(pattern))) {
      const numeric = coerceNumberDeep(entry);
      if (numeric && numeric > 0) {
        return numeric;
      }
    }
    return null;
  });

  return typeof viaTraversal === 'number' && viaTraversal > 0 ? viaTraversal : null;
};

const formatDurationLabel = (minutes: number | null): string | null => {
  if (!minutes) {
    return null;
  }
  const rounded = Math.round(minutes);
  if (rounded <= 0) {
    return null;
  }
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (remainder > 0) {
    parts.push(`${remainder}m`);
  }
  if (parts.length === 0) {
    parts.push(`${rounded}m`);
  }
  return parts.join(' ');
};

const getStatusLabel = (status: string): string => {
  const key = status.toUpperCase();
  const translationKey = `APPOINTMENTS.STATUS.${key}`;
  const translated = I18n.t(translationKey);
  return translated === translationKey ? status : translated;
};

const AppointmentCard = ({
  appointment,
  onPress,
}: {
  appointment: Appointment;
  onPress?: (appointment: Appointment) => void;
}) => {
  const statusKey = (appointment.status || '').toUpperCase();
  const badgeStyle = STATUS_COLORS[statusKey] ?? DEFAULT_STATUS_STYLE;

  const displayName = appointment.customerName || I18n.t('APPOINTMENTS.CUSTOMER_PLACEHOLDER');
  const displayService = appointment.serviceName || I18n.t('APPOINTMENTS.SERVICE_PLACEHOLDER');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={() => onPress?.(appointment)}
      disabled={!onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTime}>{formatAppointmentTime(appointment)}</Text>
        <View style={[styles.statusPill, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.statusPillText, { color: badgeStyle.textColor }]}>
            {getStatusLabel(statusKey)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{displayService}</Text>
      <Text style={styles.cardSubtitle}>{displayName}</Text>

      {appointment.customerPhone ? (
        <Text style={styles.cardMeta}>{appointment.customerPhone}</Text>
      ) : null}

      {appointment.location ? <Text style={styles.cardMeta}>{appointment.location}</Text> : null}

      {/* Payment badge removed – the status pill now reflects payment state */}
    </TouchableOpacity>
  );
};

const AppointmentsScreen = () => {
  const dispatch = useAppDispatch();
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), DATE_KEY_FORMAT),
  );
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const renderDetailBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const appointments = useAppSelector(selectAppointmentsList);
  const pagination = useAppSelector(selectAppointmentsPagination);
  const uiFlags = useAppSelector(selectAppointmentsUiFlags);
  const error = useAppSelector(selectAppointmentsError);
  const lastUpdated = useAppSelector(selectAppointmentsLastUpdated);
  const loadedAgentId = useAppSelector(selectAppointmentsAgentId);
  const sessionAgentId = useAppSelector(state => state.auth.chatwootSession?.agentId ?? null);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach(appointment => {
      const dateKey = getDateKey(appointment.startAt);
      if (!dateKey) {
        return;
      }
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(appointment);
    });

    Object.values(map).forEach(entries => {
      entries.sort((a, b) => {
        const aTime = a.startAt ? new Date(a.startAt).getTime() : 0;
        const bTime = b.startAt ? new Date(b.startAt).getTime() : 0;
        return aTime - bTime;
      });
    });

    return map;
  }, [appointments]);

  const calendarMarkedDates = useMemo<MarkedDates>(() => {
    const markers: MarkedDates = {};
    Object.keys(appointmentsByDate).forEach(dateKey => {
      const isSelected = dateKey === selectedDate;
      markers[dateKey] = {
        marked: true,
        dotColor: SARA_COLORS.accent,
        ...(isSelected
          ? {
              selected: true,
              selectedColor: SARA_COLORS.accent,
              selectedTextColor: '#FFFFFF',
            }
          : {}),
      };
    });

    if (!markers[selectedDate]) {
      markers[selectedDate] = {
        selected: true,
        selectedColor: SARA_COLORS.accent,
        selectedTextColor: '#FFFFFF',
      };
    } else if (!markers[selectedDate].selected) {
      markers[selectedDate] = {
        ...markers[selectedDate],
        selected: true,
        selectedColor: SARA_COLORS.accent,
        selectedTextColor: '#FFFFFF',
      };
    }

    return markers;
  }, [appointmentsByDate, selectedDate]);

  const selectedDateAppointments = appointmentsByDate[selectedDate] ?? [];
  const selectedDateLabel = useMemo(() => formatCalendarDayLabel(selectedDate), [selectedDate]);
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: '#FFFFFF',
      calendarBackground: '#FFFFFF',
      textSectionTitleColor: SARA_COLORS.textSecondary,
      dayTextColor: SARA_COLORS.textPrimary,
      monthTextColor: SARA_COLORS.textPrimary,
      todayTextColor: SARA_COLORS.accent,
      selectedDayBackgroundColor: SARA_COLORS.accent,
      selectedDayTextColor: '#FFFFFF',
      arrowColor: SARA_COLORS.accent,
      dotColor: SARA_COLORS.accent,
      selectedDotColor: '#FFFFFF',
    }),
    [],
  );

  const bootstrappedAgentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionAgentId) {
      bootstrappedAgentRef.current = null;
      return;
    }

    const isFetching = uiFlags.isLoading || uiFlags.isRefreshing;
    if (isFetching) {
      return;
    }

    if (bootstrappedAgentRef.current === sessionAgentId) {
      return;
    }

    dispatch(appointmentsActions.fetchAppointments({ limit: DEFAULT_LIMIT }));
    bootstrappedAgentRef.current = sessionAgentId;
  }, [dispatch, sessionAgentId, uiFlags.isLoading, uiFlags.isRefreshing]);

  useEffect(() => {
    if (!sessionAgentId) {
      bootstrappedAgentRef.current = null;
    }
  }, [sessionAgentId]);

  useEffect(() => {
    if (!sessionAgentId) {
      return;
    }
    if (
      loadedAgentId &&
      sessionAgentId !== loadedAgentId &&
      !uiFlags.isLoading &&
      !uiFlags.isRefreshing
    ) {
      dispatch(appointmentsActions.fetchAppointments({ limit: DEFAULT_LIMIT }));
      bootstrappedAgentRef.current = sessionAgentId;
    }
  }, [dispatch, loadedAgentId, sessionAgentId, uiFlags.isLoading, uiFlags.isRefreshing]);

  const handleAppointmentPress = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    detailSheetRef.current?.present();
  }, []);

  const handleDetailDismiss = useCallback(() => {
    setSelectedAppointment(null);
  }, []);

  const handleDetailClosePress = useCallback(() => {
    detailSheetRef.current?.dismiss();
  }, []);

  const handleViewModeChange = useCallback((mode: 'list' | 'calendar') => {
    setViewMode(mode);
  }, []);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
  }, []);

  const detailRelativeTime = useMemo(() => {
    if (!selectedAppointment?.startAt) {
      return null;
    }
    const startDate = new Date(selectedAppointment.startAt);
    if (Number.isNaN(startDate.getTime())) {
      return null;
    }
    return formatDistanceToNow(startDate, { addSuffix: true });
  }, [selectedAppointment?.startAt]);

  const handleRefresh = useCallback(() => {
    if (!sessionAgentId) {
      return;
    }
    dispatch(
      appointmentsActions.fetchAppointments({
        refresh: true,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch, sessionAgentId]);

  const handleRetry = useCallback(() => {
    dispatch(
      appointmentsActions.fetchAppointments({
        refresh: true,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (!pagination?.hasMore || !pagination.nextCursor || uiFlags.isLoadingMore) {
      return;
    }
    dispatch(
      appointmentsActions.fetchAppointments({
        append: true,
        cursor: pagination.nextCursor,
        limit: DEFAULT_LIMIT,
      }),
    );
  }, [dispatch, pagination?.hasMore, pagination?.nextCursor, uiFlags.isLoadingMore]);

  const isInitialLoading = uiFlags.isLoading && appointments.length === 0;

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return null;
    }
    const parsed = new Date(lastUpdated);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return formatDistanceToNow(parsed, { addSuffix: true });
  }, [lastUpdated]);

  const renderItem = useCallback(
    ({ item }: { item: Appointment }) => (
      <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
    ),
    [handleAppointmentPress],
  );

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  const listFooter =
    uiFlags.isLoadingMore && appointments.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator color={SARA_COLORS.accent} />
      </View>
    ) : null;

  const emptyComponent =
    uiFlags.isLoading || uiFlags.isRefreshing ? null : (
      <View style={styles.emptyState}>
        <EmptyStateIcon stroke={SARA_COLORS.accent} />
        <Text style={styles.emptyTitle}>{I18n.t('APPOINTMENTS.EMPTY_TITLE')}</Text>
        <Text style={styles.emptySubtitle}>{I18n.t('APPOINTMENTS.EMPTY_SUBTITLE')}</Text>
      </View>
    );

  const detailStatusKey = selectedAppointment
    ? (selectedAppointment.status || '').toUpperCase()
    : null;
  const detailBadgeStyle = detailStatusKey
    ? (STATUS_COLORS[detailStatusKey] ?? DEFAULT_STATUS_STYLE)
    : DEFAULT_STATUS_STYLE;
  const detailDisplayService =
    selectedAppointment?.serviceName || I18n.t('APPOINTMENTS.SERVICE_PLACEHOLDER');
  const detailDisplayName =
    selectedAppointment?.customerName || I18n.t('APPOINTMENTS.CUSTOMER_PLACEHOLDER');
  const detailSchedule = selectedAppointment ? formatAppointmentRange(selectedAppointment) : null;
  const detailProvider = selectedAppointment ? extractProviderName(selectedAppointment) : null;
  const detailDuration = selectedAppointment
    ? formatDurationLabel(extractDurationMinutes(selectedAppointment))
    : null;
  const detailPaymentSummary = selectedAppointment
    ? selectedAppointment.paymentRequired
      ? selectedAppointment.paymentStatus
        ? `${I18n.t('APPOINTMENTS.PAYMENT_REQUIRED')} • ${selectedAppointment.paymentStatus}`
        : I18n.t('APPOINTMENTS.PAYMENT_REQUIRED')
      : (selectedAppointment.paymentStatus ?? null)
    : null;
  const detailPhone = selectedAppointment?.customerPhone;
  const detailLocation = selectedAppointment?.location;
  const detailNotes = selectedAppointment?.notes?.trim();
  const detailSource = selectedAppointment?.source;
  const detailStatusPillStyle = useMemo(
    () => ({ backgroundColor: detailBadgeStyle.backgroundColor }),
    [detailBadgeStyle.backgroundColor],
  );
  const detailStatusPillTextStyle = useMemo(
    () => ({ color: detailBadgeStyle.textColor }),
    [detailBadgeStyle.textColor],
  );

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={SARA_COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const viewToggle = (
    <View style={styles.viewToggleGroup}>
      {(['list', 'calendar'] as const).map(mode => {
        const isActive = viewMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[styles.viewToggleButton, isActive && styles.viewToggleButtonActive]}
            onPress={() => handleViewModeChange(mode)}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}>
            <Text
              style={[styles.viewToggleButtonText, isActive && styles.viewToggleButtonTextActive]}>
              {mode === 'list'
                ? I18n.t('APPOINTMENTS.VIEW_TOGGLE_LIST')
                : I18n.t('APPOINTMENTS.VIEW_TOGGLE_CALENDAR')}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const header = (
    <View style={styles.hero}>
      <Text style={styles.title}>{I18n.t('APPOINTMENTS.TITLE')}</Text>
      {lastUpdatedLabel ? (
        <Text style={styles.updatedText}>
          {I18n.t('APPOINTMENTS.UPDATED', { time: lastUpdatedLabel })}
        </Text>
      ) : null}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error || I18n.t('APPOINTMENTS.ERROR')}</Text>
          <TouchableOpacity onPress={handleRetry}>
            <Text style={styles.retryText}>{I18n.t('APPOINTMENTS.RETRY')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {viewToggle}
    </View>
  );
  const calendarRefreshControl = (
    <RefreshControl
      refreshing={uiFlags.isRefreshing}
      onRefresh={handleRefresh}
      tintColor={SARA_COLORS.accent}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={SARA_COLORS.background} barStyle="dark-content" />
      {viewMode === 'list' ? (
        <FlatList
          data={appointments}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListFooterComponent={listFooter}
          ListEmptyComponent={emptyComponent}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshing={uiFlags.isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView
          style={styles.calendarScroll}
          contentContainerStyle={styles.calendarScrollContent}
          refreshControl={calendarRefreshControl}
          showsVerticalScrollIndicator={false}>
          {header}
          <View style={styles.calendarCard}>
            <Calendar
              current={selectedDate}
              markedDates={calendarMarkedDates}
              onDayPress={handleDayPress}
              enableSwipeMonths
              theme={calendarTheme}
              style={styles.calendar}
            />
          </View>
          <View style={styles.calendarDaySection}>
            <Text style={styles.calendarDayLabel}>{selectedDateLabel ?? selectedDate}</Text>
            {selectedDateAppointments.length === 0 ? (
              <View style={styles.calendarEmptyState}>
                <Text style={styles.calendarEmptyTitle}>
                  {I18n.t('APPOINTMENTS.CALENDAR_EMPTY_TITLE')}
                </Text>
                <Text style={styles.calendarEmptySubtitle}>
                  {I18n.t('APPOINTMENTS.CALENDAR_EMPTY_SUBTITLE')}
                </Text>
              </View>
            ) : (
              selectedDateAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  onPress={handleAppointmentPress}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
      <BottomSheetModal
        ref={detailSheetRef}
        onDismiss={handleDetailDismiss}
        backdropComponent={renderDetailBackdrop}
        handleIndicatorStyle={styles.sheetHandle}
        backgroundStyle={styles.sheetBackground}
        enableDynamicSizing
        enablePanDownToClose>
        <BottomSheetView style={styles.sheetContent}>
          {selectedAppointment ? (
            <View style={styles.sheetInner}>
              <View style={styles.sheetTitleRow}>
                <View style={styles.sheetTitleGroup}>
                  <Text style={styles.sheetTitle}>{detailDisplayService}</Text>
                  <Text style={styles.sheetSubtitle}>{detailDisplayName}</Text>
                </View>
                <TouchableOpacity onPress={handleDetailClosePress} style={styles.sheetCloseButton}>
                  <Text style={styles.sheetCloseText}>{I18n.t('APPOINTMENTS.DETAIL.CLOSE')}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.statusPill, detailStatusPillStyle]}>
                <Text style={[styles.statusPillText, detailStatusPillTextStyle]}>
                  {getStatusLabel(detailStatusKey ?? '')}
                </Text>
              </View>
              <View style={styles.sheetDivider} />
              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.SCHEDULE')}</Text>
                {detailSchedule ? <Text style={styles.sheetValue}>{detailSchedule}</Text> : null}
                {detailRelativeTime ? (
                  <Text style={styles.sheetRelativeText}>{detailRelativeTime}</Text>
                ) : null}
                {detailProvider || detailDuration ? (
                  <View style={styles.sheetMetaRow}>
                    {detailProvider ? (
                      <View style={styles.sheetMiniSection}>
                        <Text style={styles.sheetMetaLabel}>
                          {I18n.t('APPOINTMENTS.DETAIL.PROVIDER')}
                        </Text>
                        <Text style={styles.sheetMetaValue}>{detailProvider}</Text>
                      </View>
                    ) : null}
                    {detailDuration ? (
                      <View style={styles.sheetMiniSection}>
                        <Text style={styles.sheetMetaLabel}>
                          {I18n.t('APPOINTMENTS.DETAIL.DURATION')}
                        </Text>
                        <View style={styles.sheetChip}>
                          <Text style={styles.sheetChipText}>{detailDuration}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
              <View style={styles.sheetDivider} />
              <View style={styles.sheetSection}>
                <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.CUSTOMER')}</Text>
                <Text style={styles.sheetValue}>{detailDisplayName}</Text>
                <View style={styles.sheetMetaBlock}>
                  <Text style={styles.sheetMetaLabel}>{I18n.t('APPOINTMENTS.DETAIL.PHONE')}</Text>
                  <Text style={styles.sheetMetaValue}>
                    {detailPhone ?? I18n.t('CONTACTS.DETAIL.VALUE_UNAVAILABLE')}
                  </Text>
                </View>
              </View>
              {detailLocation ? (
                <>
                  <View style={styles.sheetDivider} />
                  <View style={styles.sheetSection}>
                    <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.LOCATION')}</Text>
                    <Text style={styles.sheetValue}>{detailLocation}</Text>
                  </View>
                </>
              ) : null}
              {detailNotes ? (
                <>
                  <View style={styles.sheetDivider} />
                  <View style={styles.sheetSection}>
                    <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.NOTES')}</Text>
                    <Text style={styles.sheetValue}>{detailNotes}</Text>
                  </View>
                </>
              ) : null}
              {detailPaymentSummary ? (
                <>
                  <View style={styles.sheetDivider} />
                  <View style={styles.sheetSection}>
                    <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.PAYMENT')}</Text>
                    <Text style={styles.sheetValue}>{detailPaymentSummary}</Text>
                  </View>
                </>
              ) : null}
              {detailSource ? (
                <>
                  <View style={styles.sheetDivider} />
                  <View style={styles.sheetSection}>
                    <Text style={styles.sheetLabel}>{I18n.t('APPOINTMENTS.DETAIL.SOURCE')}</Text>
                    <Text style={styles.sheetValue}>{detailSource}</Text>
                  </View>
                </>
              ) : null}
            </View>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

export default AppointmentsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  list: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  hero: {
    marginBottom: 16,
    gap: 8,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#ECE7E1',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: SARA_COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  viewToggleButtonText: {
    color: SARA_COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggleButtonTextActive: {
    color: SARA_COLORS.textPrimary,
  },
  title: {
    color: SARA_COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  updatedText: {
    color: '#566273',
    fontSize: 13,
  },
  errorBanner: {
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FDEBEC',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  errorText: {
    color: '#9F3A3A',
    fontSize: 14,
    flex: 1,
  },
  retryText: {
    color: '#9F3A3A',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: SARA_COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTime: {
    color: SARA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 15,
  },
  cardMeta: {
    color: '#6F7A85',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  calendarScroll: {
    flex: 1,
    backgroundColor: SARA_COLORS.background,
  },
  calendarScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 24,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    shadowColor: SARA_COLORS.cardShadow,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  calendarDaySection: {
    gap: 16,
    paddingBottom: 24,
  },
  calendarDayLabel: {
    color: SARA_COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  calendarEmptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 6,
    shadowColor: SARA_COLORS.cardShadow,
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  calendarEmptyTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarEmptySubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 14,
  },
  footer: {
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
  },
  sheetHandle: {
    backgroundColor: '#D2D9E3',
    width: 48,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetInner: {
    gap: 16,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetTitleGroup: {
    flex: 1,
    gap: 6,
  },
  sheetTitle: {
    color: SARA_COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    color: SARA_COLORS.textSecondary,
    fontSize: 16,
  },
  sheetCloseButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  sheetCloseText: {
    color: SARA_COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#E2E6EB',
  },
  sheetSection: {
    gap: 8,
  },
  sheetLabel: {
    color: '#7D8895',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sheetValue: {
    color: SARA_COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  sheetRelativeText: {
    color: '#6F7A85',
    fontSize: 13,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  sheetMiniSection: {
    gap: 4,
  },
  sheetMetaBlock: {
    gap: 4,
    marginTop: 4,
  },
  sheetMetaLabel: {
    color: '#9AA3B1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sheetMetaValue: {
    color: SARA_COLORS.textPrimary,
    fontSize: 15,
  },
  sheetChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F2F5F9',
  },
  sheetChipText: {
    color: SARA_COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
