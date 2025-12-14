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
import {
  differenceInMinutes,
  endOfDay,
  endOfWeek,
  format,
  formatDistanceToNow,
  isSameDay,
  parse,
  startOfDay,
  startOfWeek,
} from 'date-fns';

import CalendarKit, {
  type CalendarKitHandle,
  type DateOrDateTime,
  type EventItem,
  type OnEventResponse,
  type SelectedEventType,
  type UnavailableHourProps,
} from '@howljs/calendar-kit';
import { Calendar, type DateData, type MarkedDates } from 'react-native-calendars';
import I18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { OfficeHoursService } from '@/services/OfficeHoursService';
import type { WorkingPlanBlock } from '@/services/OfficeHoursService';
import { EmptyStateIcon } from '@/svg-icons';
import { agentSettingsActions } from '@/store/agent-settings/agentSettingsActions';
import { selectAgentSettingsIntegrations } from '@/store/agent-settings';
import { appointmentsActions } from '@/store/appointments/appointmentsActions';
import {
  selectAppointmentsAgentId,
  selectAppointmentsError,
  selectAppointmentsList,
  selectAppointmentsPagination,
  selectAppointmentsUiFlags,
} from '@/store/appointments/appointmentsSelectors';
import type { Appointment } from '@/store/appointments/appointmentsTypes';
import { tailwind } from '@/theme';

const DEFAULT_LIMIT = 25;

// Resolve Sara theme colors from tailwind config
const SARA_BACKGROUND = tailwind.color('sara-background') ?? '#F8F5F3';
const SARA_BACKGROUND_LIGHT = tailwind.color('sara-background-light') ?? '#FFFFFF';
const SARA_ACCENT = tailwind.color('sara-accent') ?? '#4CB6AC';
const SARA_TEXT_PRIMARY = tailwind.color('sara-text-primary') ?? '#16273D';
const SARA_TEXT_SECONDARY = tailwind.color('sara-text-secondary') ?? '#4B5D6E';
const SARA_TEXT_META = tailwind.color('sara-text-meta') ?? '#6C778A';
const SARA_BORDER = tailwind.color('sara-border') ?? '#E6E2DD';
const SARA_CHIP = tailwind.color('sara-chip') ?? '#F5F3F0';

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
const TIMELINE_WEEK_OPTIONS = { weekStartsOn: 1 as const };
const TIMELINE_DEFAULT_DURATION_MINUTES = 30;
const TIMELINE_UNAVAILABLE_COLOR = SARA_CHIP;
const MINUTES_PER_DAY = 24 * 60;
const WEEKDAY_INDEX_LOOKUP = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
} as const;
type WeekdayKey = keyof typeof WEEKDAY_INDEX_LOOKUP;
const DEFAULT_UNAVAILABLE_HOURS: UnavailableHourProps[] = [
  { start: 0, end: 6 * 60, backgroundColor: TIMELINE_UNAVAILABLE_COLOR },
  { start: 21 * 60, end: 24 * 60, backgroundColor: TIMELINE_UNAVAILABLE_COLOR },
];

type ViewMode = 'list' | 'month' | 'timeline';
type TimelineViewMode = 'week' | 'day';

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

const normalizeDateKey = (value: string): string => {
  if (!value) {
    return value;
  }
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return format(direct, DATE_KEY_FORMAT);
  }
  const parsed = parse(value, DATE_KEY_FORMAT, new Date());
  if (!Number.isNaN(parsed.getTime())) {
    return format(parsed, DATE_KEY_FORMAT);
  }
  return value;
};

const isWeekdayKey = (value: string): value is WeekdayKey =>
  Object.prototype.hasOwnProperty.call(WEEKDAY_INDEX_LOOKUP, value);

const getWeekdayIndex = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }
  const normalized = value.toLowerCase();
  return isWeekdayKey(normalized) ? WEEKDAY_INDEX_LOOKUP[normalized] : null;
};

const clampMinutes = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > MINUTES_PER_DAY) {
    return MINUTES_PER_DAY;
  }
  return value;
};

const parseTimeToMinutes = (value?: string | null): number | null => {
  if (!value) {
    return null;
  }
  const match = /(\d{1,2}):(\d{2})/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  if (hours < 0 || minutes < 0 || minutes >= 60) {
    return null;
  }
  if (hours > 24 || (hours === 24 && minutes > 0)) {
    return null;
  }
  return clampMinutes(hours * 60 + minutes);
};

const buildUnavailableSegment = (start: number, end: number): UnavailableHourProps => ({
  start,
  end,
  backgroundColor: TIMELINE_UNAVAILABLE_COLOR,
});

const mergeUnavailableSegments = (segments: UnavailableHourProps[]): UnavailableHourProps[] => {
  const sorted = segments
    .map(segment => ({
      ...segment,
      start: clampMinutes(segment.start),
      end: clampMinutes(segment.end),
    }))
    .filter(segment => segment.end > segment.start)
    .sort((a, b) => a.start - b.start);

  return sorted.reduce<UnavailableHourProps[]>((acc, segment) => {
    const last = acc[acc.length - 1];
    if (last && segment.start <= last.end) {
      last.end = Math.max(last.end, segment.end);
      return acc;
    }
    acc.push({ ...segment });
    return acc;
  }, []);
};

const buildUnavailableSegmentsFromBlock = (
  block?: WorkingPlanBlock | null,
): UnavailableHourProps[] => {
  if (!block || !block.start || !block.end) {
    return [buildUnavailableSegment(0, MINUTES_PER_DAY)];
  }

  const startMinutes = parseTimeToMinutes(block.start);
  const endMinutes = parseTimeToMinutes(block.end);

  if (
    startMinutes === null ||
    endMinutes === null ||
    startMinutes < 0 ||
    endMinutes > MINUTES_PER_DAY ||
    startMinutes >= endMinutes
  ) {
    return [buildUnavailableSegment(0, MINUTES_PER_DAY)];
  }

  const segments: UnavailableHourProps[] = [];
  if (startMinutes > 0) {
    segments.push(buildUnavailableSegment(0, startMinutes));
  }
  if (endMinutes < MINUTES_PER_DAY) {
    segments.push(buildUnavailableSegment(endMinutes, MINUTES_PER_DAY));
  }

  if (Array.isArray(block.breaks)) {
    block.breaks.forEach(breakWindow => {
      const breakStart = parseTimeToMinutes(breakWindow.start);
      const breakEnd = parseTimeToMinutes(breakWindow.end);
      if (breakStart === null || breakEnd === null) {
        return;
      }
      const clampedStart = clampMinutes(Math.max(breakStart, startMinutes));
      const clampedEnd = clampMinutes(Math.min(breakEnd, endMinutes));
      if (clampedStart < clampedEnd) {
        segments.push(buildUnavailableSegment(clampedStart, clampedEnd));
      }
    });
  }

  return mergeUnavailableSegments(segments);
};

const buildUnavailableHoursLookup = (
  workingPlan?: Record<string, WorkingPlanBlock | null>,
  workingPlanExceptions?: Record<string, WorkingPlanBlock | null>,
): Record<string, UnavailableHourProps[]> => {
  const lookup: Record<string, UnavailableHourProps[]> = {};

  if (workingPlan) {
    Object.entries(workingPlan).forEach(([dayKey, block]) => {
      const weekDay = getWeekdayIndex(dayKey);
      if (!weekDay) {
        return;
      }
      const segments = buildUnavailableSegmentsFromBlock(block);
      if (segments.length > 0) {
        lookup[String(weekDay)] = segments;
      } else if (lookup[String(weekDay)]) {
        delete lookup[String(weekDay)];
      }
    });
  }

  if (workingPlanExceptions) {
    Object.entries(workingPlanExceptions).forEach(([dateKey, block]) => {
      const normalizedDate = normalizeDateKey(dateKey);
      const segments = buildUnavailableSegmentsFromBlock(block);
      if (segments.length > 0) {
        lookup[normalizedDate] = segments;
      } else if (lookup[normalizedDate]) {
        delete lookup[normalizedDate];
      }
    });
  }

  return lookup;
};

const hasWorkingPlanDefinitions = (
  workingPlan?: Record<string, WorkingPlanBlock | null> | null,
): boolean => {
  if (!workingPlan) {
    return false;
  }
  return Object.keys(workingPlan).some(dayKey => getWeekdayIndex(dayKey) !== null);
};

const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toISOString = (value?: string | null): string | null => {
  const parsed = toDateOrNull(value);
  return parsed ? parsed.toISOString() : null;
};

const getAppointmentEnd = (appointment: Appointment): string | null => {
  if (appointment.endAt) {
    return appointment.endAt;
  }
  if (!appointment.startAt) {
    return null;
  }
  const derivedMinutes = extractDurationMinutes(appointment) ?? TIMELINE_DEFAULT_DURATION_MINUTES;
  const startDate = toDateOrNull(appointment.startAt);
  if (!startDate) {
    return null;
  }
  const endDate = new Date(startDate.getTime() + derivedMinutes * 60 * 1000);
  return endDate.toISOString();
};

const resolveCalendarKitDate = (value?: DateOrDateTime): string | null => {
  if (!value) {
    return null;
  }
  if ('dateTime' in value && value.dateTime) {
    return value.dateTime;
  }
  if ('date' in value && value.date) {
    return `${value.date}T00:00:00.000Z`;
  }
  return null;
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

const getTimelinePriority = (status?: string | null): number => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'CONFIRMED') {
    return 0;
  }
  if (normalized === 'CANCELLED') {
    return 2;
  }
  return 1;
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
  const timelineRef = useRef<CalendarKitHandle>(null);
  const timelineSelectionSourceRef = useRef<'timeline' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), DATE_KEY_FORMAT),
  );
  const [timelineViewMode, setTimelineViewMode] = useState<TimelineViewMode>('week');
  const [timelineVisibleDate, setTimelineVisibleDate] = useState<string>(() =>
    format(new Date(), DATE_KEY_FORMAT),
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [timelineOverrides, setTimelineOverrides] = useState<
    Record<string, { startAt: string; endAt?: string | null }>
  >({});
  const [timelineUnavailableHours, setTimelineUnavailableHours] = useState<
    Record<string, UnavailableHourProps[]> | UnavailableHourProps[]
  >(DEFAULT_UNAVAILABLE_HOURS);
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

  const appointmentsFromStore = useAppSelector(selectAppointmentsList);
  const pagination = useAppSelector(selectAppointmentsPagination);
  const uiFlags = useAppSelector(selectAppointmentsUiFlags);
  const error = useAppSelector(selectAppointmentsError);
  const loadedAgentId = useAppSelector(selectAppointmentsAgentId);
  const sessionAgentId = useAppSelector(state => state.auth.chatwootSession?.agentId ?? null);
  const agentSettingsIntegrations = useAppSelector(selectAgentSettingsIntegrations);
  const easyAppointmentsIntegration = agentSettingsIntegrations?.easyAppointments ?? null;
  const easyAppointmentsProviderId = easyAppointmentsIntegration?.providerId ?? null;
  const easyAppointmentsConnected = Boolean(easyAppointmentsIntegration?.connected);
  const providerKey =
    easyAppointmentsProviderId != null ? String(easyAppointmentsProviderId) : null;

  useEffect(() => {
    if (!sessionAgentId) {
      return;
    }
    dispatch(agentSettingsActions.fetchAgentSettings());
  }, [dispatch, sessionAgentId]);

  useEffect(() => {
    if (!sessionAgentId) {
      setTimelineUnavailableHours(DEFAULT_UNAVAILABLE_HOURS);
      return;
    }
    if (!easyAppointmentsConnected || !providerKey) {
      setTimelineUnavailableHours(DEFAULT_UNAVAILABLE_HOURS);
      return;
    }

    let isCancelled = false;
    setTimelineUnavailableHours(DEFAULT_UNAVAILABLE_HOURS);

    const syncOfficeHours = async () => {
      try {
        const snapshot = await OfficeHoursService.fetchWeekly({
          providerId: providerKey,
          agentId: sessionAgentId,
        });
        if (isCancelled) {
          return;
        }
        const planHasDefinitions = hasWorkingPlanDefinitions(snapshot.workingPlan);
        const hasExceptions = Boolean(
          snapshot.workingPlanExceptions && Object.keys(snapshot.workingPlanExceptions).length > 0,
        );
        if (!planHasDefinitions && !hasExceptions) {
          setTimelineUnavailableHours(DEFAULT_UNAVAILABLE_HOURS);
          return;
        }
        const unavailableLookup = buildUnavailableHoursLookup(
          snapshot.workingPlan,
          snapshot.workingPlanExceptions,
        );
        if (Object.keys(unavailableLookup).length > 0) {
          setTimelineUnavailableHours(unavailableLookup);
        } else {
          setTimelineUnavailableHours([]);
        }
      } catch (err) {
        if (isCancelled) {
          return;
        }
        console.warn('Failed to sync office hours for timeline view', err);
        setTimelineUnavailableHours(DEFAULT_UNAVAILABLE_HOURS);
      }
    };

    syncOfficeHours();

    return () => {
      isCancelled = true;
    };
  }, [sessionAgentId, providerKey, easyAppointmentsConnected]);

  const mergedAppointments = useMemo(() => {
    if (!Object.keys(timelineOverrides).length) {
      return appointmentsFromStore;
    }
    return appointmentsFromStore.map(appointment => {
      const override = timelineOverrides[appointment.id];
      if (!override) {
        return appointment;
      }
      return {
        ...appointment,
        startAt: override.startAt,
        endAt: override.endAt ?? appointment.endAt,
      };
    });
  }, [appointmentsFromStore, timelineOverrides]);

  const appointmentsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    mergedAppointments.forEach(appointment => {
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
  }, [mergedAppointments]);

  const calendarMarkedDates = useMemo<MarkedDates>(() => {
    const markers: MarkedDates = {};
    Object.keys(appointmentsByDate).forEach(dateKey => {
      const isSelected = dateKey === selectedDate;
      markers[dateKey] = {
        marked: true,
        dotColor: SARA_ACCENT,
        ...(isSelected
          ? {
              selected: true,
              selectedColor: SARA_ACCENT,
              selectedTextColor: SARA_BACKGROUND_LIGHT,
            }
          : {}),
      };
    });

    if (!markers[selectedDate]) {
      markers[selectedDate] = {
        selected: true,
        selectedColor: SARA_ACCENT,
        selectedTextColor: SARA_BACKGROUND_LIGHT,
      };
    } else if (!markers[selectedDate].selected) {
      markers[selectedDate] = {
        ...markers[selectedDate],
        selected: true,
        selectedColor: SARA_ACCENT,
        selectedTextColor: SARA_BACKGROUND_LIGHT,
      };
    }

    return markers;
  }, [appointmentsByDate, selectedDate]);

  const selectedDateAppointments = appointmentsByDate[selectedDate] ?? [];
  const selectedDateLabel = useMemo(() => formatCalendarDayLabel(selectedDate), [selectedDate]);
  const timelineVisibleLabel = useMemo(
    () => formatCalendarDayLabel(timelineVisibleDate),
    [timelineVisibleDate],
  );
  const calendarTheme = useMemo(
    () => ({
      backgroundColor: SARA_BACKGROUND_LIGHT,
      calendarBackground: SARA_BACKGROUND_LIGHT,
      textSectionTitleColor: SARA_TEXT_SECONDARY,
      dayTextColor: SARA_TEXT_PRIMARY,
      monthTextColor: SARA_TEXT_PRIMARY,
      todayTextColor: SARA_ACCENT,
      selectedDayBackgroundColor: SARA_ACCENT,
      selectedDayTextColor: SARA_BACKGROUND_LIGHT,
      arrowColor: SARA_ACCENT,
      dotColor: SARA_ACCENT,
      selectedDotColor: SARA_BACKGROUND_LIGHT,
    }),
    [],
  );

  const selectedAppointment = useMemo(
    () => mergedAppointments.find(appointment => appointment.id === selectedAppointmentId) ?? null,
    [mergedAppointments, selectedAppointmentId],
  );

  useEffect(() => {
    if (selectedAppointmentId && !selectedAppointment) {
      detailSheetRef.current?.dismiss();
      setSelectedAppointmentId(null);
    }
  }, [selectedAppointment, selectedAppointmentId]);

  type TimelineEventCandidate = {
    event: EventItem;
    priority: number;
    startMs: number;
    endMs: number;
  };

  const timelineEventCandidates = useMemo<TimelineEventCandidate[]>(() => {
    const candidates: TimelineEventCandidate[] = [];
    mergedAppointments.forEach(appointment => {
      if (!appointment.startAt) {
        return;
      }
      const startIso = toISOString(appointment.startAt);
      if (!startIso) {
        return;
      }
      const endIso = toISOString(getAppointmentEnd(appointment)) ?? startIso;
      const startDate = new Date(startIso);
      const endDate = new Date(endIso);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return;
      }
      const statusKey = (appointment.status || '').toUpperCase();
      const badgeStyle = STATUS_COLORS[statusKey] ?? DEFAULT_STATUS_STYLE;
      const priority = getTimelinePriority(statusKey);
      candidates.push({
        priority,
        startMs: startDate.getTime(),
        endMs: endDate.getTime(),
        event: {
          id: appointment.id,
          title:
            appointment.serviceName ||
            appointment.customerName ||
            I18n.t('APPOINTMENTS.SERVICE_PLACEHOLDER'),
          start: { dateTime: startIso },
          end: { dateTime: endIso },
          color: badgeStyle.backgroundColor,
          titleColor: badgeStyle.textColor,
        },
      });
    });

    return candidates.sort((a, b) => a.startMs - b.startMs);
  }, [mergedAppointments]);

  const timelineEvents = useMemo<EventItem[]>(() => {
    if (timelineViewMode === 'day') {
      return timelineEventCandidates.map(candidate => candidate.event);
    }

    const condensed: TimelineEventCandidate[] = [];

    timelineEventCandidates.forEach(candidate => {
      let merged = false;
      for (let i = 0; i < condensed.length; i += 1) {
        const existing = condensed[i];
        const overlaps = candidate.startMs < existing.endMs && candidate.endMs > existing.startMs;
        if (!overlaps) {
          continue;
        }
        if (candidate.priority < existing.priority) {
          condensed[i] = candidate;
        }
        merged = true;
        break;
      }

      if (!merged) {
        condensed.push(candidate);
      }
    });

    return condensed.sort((a, b) => a.startMs - b.startMs).map(candidate => candidate.event);
  }, [timelineEventCandidates, timelineViewMode]);

  const timelineRange = useMemo(() => {
    const parsed = parse(timelineVisibleDate, DATE_KEY_FORMAT, new Date());
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    if (timelineViewMode === 'day') {
      return {
        start: startOfDay(parsed),
        end: endOfDay(parsed),
      };
    }
    return {
      start: startOfWeek(parsed, TIMELINE_WEEK_OPTIONS),
      end: endOfDay(endOfWeek(parsed, TIMELINE_WEEK_OPTIONS)),
    };
  }, [timelineVisibleDate, timelineViewMode]);

  const timelineRangeLabel = useMemo(() => {
    if (!timelineRange) {
      return null;
    }
    if (timelineViewMode === 'day') {
      return format(timelineRange.start, 'EEEE, MMM d, yyyy');
    }
    const sameYear = timelineRange.start.getFullYear() === timelineRange.end.getFullYear();
    const sameMonth = sameYear && timelineRange.start.getMonth() === timelineRange.end.getMonth();
    if (sameYear) {
      const startLabel = format(timelineRange.start, 'MMM d');
      const endLabel = sameMonth
        ? format(timelineRange.end, 'd, yyyy')
        : format(timelineRange.end, 'MMM d, yyyy');
      return `${startLabel} – ${endLabel}`;
    }
    return `${format(timelineRange.start, 'MMM d, yyyy')} – ${format(
      timelineRange.end,
      'MMM d, yyyy',
    )}`;
  }, [timelineRange, timelineViewMode]);

  const timelineSelectedEvent = useMemo<SelectedEventType | undefined>(() => {
    if (!selectedAppointment) {
      return undefined;
    }
    const start = toISOString(selectedAppointment.startAt);
    if (!start) {
      return undefined;
    }
    const end = toISOString(getAppointmentEnd(selectedAppointment)) ?? start;
    return {
      id: selectedAppointment.id,
      start: { dateTime: start },
      end: { dateTime: end },
      title: selectedAppointment.serviceName,
    };
  }, [selectedAppointment]);

  const timelineTheme = useMemo(
    () => ({
      colors: {
        primary: SARA_ACCENT,
        onPrimary: SARA_BACKGROUND_LIGHT,
        background: SARA_BACKGROUND_LIGHT,
        onBackground: SARA_TEXT_PRIMARY,
        border: SARA_BORDER,
        text: SARA_TEXT_PRIMARY,
        surface: SARA_CHIP,
        onSurface: SARA_TEXT_SECONDARY,
      },
      dayBarContainer: {
        borderRadius: 18,
        backgroundColor: SARA_BACKGROUND_LIGHT,
        marginBottom: 4,
      },
      unavailableHourBackgroundColor: SARA_CHIP,
    }),
    [],
  );

  useEffect(() => {
    if (viewMode === 'timeline' || timelineVisibleDate === selectedDate) {
      return;
    }
    setTimelineVisibleDate(selectedDate);
  }, [selectedDate, timelineVisibleDate, viewMode]);

  useEffect(() => {
    if (viewMode !== 'timeline') {
      return;
    }
    if (timelineSelectionSourceRef.current === 'timeline') {
      timelineSelectionSourceRef.current = null;
      return;
    }
    timelineRef.current?.goToDate({ date: selectedDate, animatedDate: true });
  }, [selectedDate, viewMode]);

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
    setSelectedAppointmentId(appointment.id);
    detailSheetRef.current?.present();
  }, []);

  const handleDetailDismiss = useCallback(() => {
    setSelectedAppointmentId(null);
  }, []);

  const handleDetailClosePress = useCallback(() => {
    detailSheetRef.current?.dismiss();
    setSelectedAppointmentId(null);
  }, []);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      setViewMode(mode);
      if (mode === 'timeline') {
        timelineRef.current?.goToDate({ date: selectedDate, animatedDate: true });
      }
    },
    [selectedDate],
  );

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(normalizeDateKey(day.dateString));
  }, []);

  const handleTimelineDateChange = useCallback((date: string) => {
    const normalized = normalizeDateKey(date);
    timelineSelectionSourceRef.current = 'timeline';
    setTimelineVisibleDate(normalized);
    setSelectedDate(normalized);
  }, []);

  const handleTimelineEventPress = useCallback(
    (event: OnEventResponse) => {
      const appointment = mergedAppointments.find(item => item.id === event.id);
      if (appointment) {
        handleAppointmentPress(appointment);
      }
    },
    [handleAppointmentPress, mergedAppointments],
  );

  const handleTimelineDragEnd = useCallback((event: OnEventResponse) => {
    if (!event.id) {
      return;
    }
    const newStart = resolveCalendarKitDate(event.start);
    if (!newStart) {
      return;
    }
    const newEnd = resolveCalendarKitDate(event.end);
    setTimelineOverrides(prev => ({
      ...prev,
      [event.id]: {
        startAt: newStart,
        endAt: newEnd ?? null,
      },
    }));
  }, []);

  const handleTimelineViewModeChange = useCallback(
    (mode: TimelineViewMode) => {
      setTimelineViewMode(mode);
      timelineRef.current?.goToDate({ date: timelineVisibleDate, animatedDate: true });
    },
    [timelineVisibleDate],
  );

  const handleTimelineTodayPress = useCallback(() => {
    const today = format(new Date(), DATE_KEY_FORMAT);
    setSelectedDate(today);
    setTimelineVisibleDate(today);
    timelineRef.current?.goToDate({ date: today, animatedDate: true, hourScroll: true });
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

  const handleTimelineRefresh = useCallback(
    (_: string) => {
      handleRefresh();
    },
    [handleRefresh],
  );

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

  const isInitialLoading = uiFlags.isLoading && mergedAppointments.length === 0;

  const renderItem = useCallback(
    ({ item }: { item: Appointment }) => (
      <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
    ),
    [handleAppointmentPress],
  );

  const keyExtractor = useCallback((item: Appointment) => item.id, []);

  const listFooter =
    uiFlags.isLoadingMore && mergedAppointments.length > 0 ? (
      <View style={styles.footer}>
        <ActivityIndicator color={SARA_ACCENT} />
      </View>
    ) : null;

  const emptyComponent =
    uiFlags.isLoading || uiFlags.isRefreshing ? null : (
      <View style={styles.emptyState}>
        <EmptyStateIcon stroke={SARA_ACCENT} />
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
        <StatusBar translucent backgroundColor={SARA_BACKGROUND} barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={SARA_ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  const viewOptions: { mode: ViewMode; label: string }[] = [
    { mode: 'list', label: I18n.t('APPOINTMENTS.VIEW_TOGGLE_LIST') },
    { mode: 'month', label: I18n.t('APPOINTMENTS.VIEW_TOGGLE_MONTH') },
    { mode: 'timeline', label: I18n.t('APPOINTMENTS.VIEW_TOGGLE_WEEK') },
  ];

  const viewToggle = (
    <View style={styles.viewToggleGroup}>
      {viewOptions.map(({ mode, label }) => {
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
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const header = (
    <View style={styles.hero}>
      <Text style={styles.title}>{I18n.t('APPOINTMENTS.TITLE')}</Text>
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
      tintColor={SARA_ACCENT}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={SARA_BACKGROUND} barStyle="dark-content" />
      {viewMode === 'list' ? (
        <FlatList
          data={mergedAppointments}
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
      ) : viewMode === 'month' ? (
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
      ) : (
        <View style={styles.timelineContainer}>
          {header}
          <View style={styles.timelineControls}>
            <View style={styles.timelineModeGroup}>
              {(['week', 'day'] as const).map(mode => {
                const isActive = timelineViewMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.timelineModeButton, isActive && styles.timelineModeButtonActive]}
                    onPress={() => handleTimelineViewModeChange(mode)}
                    accessibilityState={{ selected: isActive }}>
                    <Text
                      style={[
                        styles.timelineModeButtonText,
                        isActive && styles.timelineModeButtonTextActive,
                      ]}>
                      {mode === 'week'
                        ? I18n.t('APPOINTMENTS.TIMELINE_MODE_WEEK')
                        : I18n.t('APPOINTMENTS.TIMELINE_MODE_DAY')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.timelineTodayButton}
              onPress={handleTimelineTodayPress}
              accessibilityRole="button">
              <Text style={styles.timelineTodayText}>{I18n.t('APPOINTMENTS.TIMELINE_TODAY')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timelineRangeRow}>
            <Text style={styles.timelineRangeLabel}>
              {timelineRangeLabel ?? timelineVisibleLabel ?? selectedDateLabel ?? selectedDate}
            </Text>
          </View>
          <View style={styles.timelineCalendarCard}>
            <CalendarKit
              ref={timelineRef}
              events={timelineEvents}
              numberOfDays={timelineViewMode === 'week' ? 7 : 1}
              scrollByDay={timelineViewMode === 'day'}
              allowDragToEdit
              allowDragToCreate={false}
              dragStep={15}
              timeInterval={30}
              start={6 * 60}
              end={22 * 60}
              showNowIndicator
              selectedEvent={timelineSelectedEvent}
              unavailableHours={timelineUnavailableHours}
              theme={timelineTheme}
              onPressEvent={handleTimelineEventPress}
              onDragEventEnd={handleTimelineDragEnd}
              onDateChanged={handleTimelineDateChange}
              onChange={handleTimelineDateChange}
              onRefresh={handleTimelineRefresh}
              isLoading={uiFlags.isRefreshing}
              initialDate={selectedDate}
              scrollToNow
              style={styles.timelineCalendar}
            />
          </View>
        </View>
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
    backgroundColor: SARA_BACKGROUND,
  },
  list: {
    flex: 1,
    backgroundColor: SARA_BACKGROUND,
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
    backgroundColor: SARA_BACKGROUND_LIGHT,
    shadowColor: SARA_TEXT_PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  viewToggleButtonText: {
    color: SARA_TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  viewToggleButtonTextActive: {
    color: SARA_TEXT_PRIMARY,
  },
  title: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  updatedText: {
    color: SARA_TEXT_META,
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
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: SARA_TEXT_PRIMARY,
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
    color: SARA_TEXT_PRIMARY,
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
    color: SARA_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: SARA_TEXT_SECONDARY,
    fontSize: 15,
  },
  cardMeta: {
    color: SARA_TEXT_META,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  emptySubtitle: {
    color: SARA_TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  timelineContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 16,
  },
  timelineControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelineModeGroup: {
    flexDirection: 'row',
    backgroundColor: '#ECE7E1',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  timelineModeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  timelineModeButtonActive: {
    backgroundColor: SARA_BACKGROUND_LIGHT,
    shadowColor: SARA_TEXT_PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  timelineModeButtonText: {
    color: SARA_TEXT_SECONDARY,
    fontWeight: '600',
  },
  timelineModeButtonTextActive: {
    color: SARA_TEXT_PRIMARY,
  },
  timelineTodayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SARA_BACKGROUND_LIGHT,
    shadowColor: SARA_TEXT_PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  timelineTodayText: {
    color: SARA_ACCENT,
    fontWeight: '600',
  },
  timelineRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineRangeLabel: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  timelineCalendarCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: SARA_BACKGROUND_LIGHT,
    padding: 8,
    shadowColor: SARA_TEXT_PRIMARY,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  timelineCalendar: {
    flex: 1,
  },
  calendarScroll: {
    flex: 1,
    backgroundColor: SARA_BACKGROUND,
  },
  calendarScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 24,
  },
  calendarCard: {
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderRadius: 24,
    padding: 12,
    shadowColor: SARA_TEXT_PRIMARY,
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
    color: SARA_TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  calendarEmptyState: {
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 6,
    shadowColor: SARA_TEXT_PRIMARY,
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  calendarEmptyTitle: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarEmptySubtitle: {
    color: SARA_TEXT_SECONDARY,
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
    backgroundColor: SARA_BACKGROUND_LIGHT,
    borderRadius: 28,
  },
  sheetHandle: {
    backgroundColor: SARA_BORDER,
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
    color: SARA_TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    color: SARA_TEXT_SECONDARY,
    fontSize: 16,
  },
  sheetCloseButton: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  sheetCloseText: {
    color: SARA_ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: SARA_BORDER,
  },
  sheetSection: {
    gap: 8,
  },
  sheetLabel: {
    color: SARA_TEXT_META,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sheetValue: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 22,
  },
  sheetRelativeText: {
    color: SARA_TEXT_META,
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
    color: SARA_TEXT_META,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sheetMetaValue: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 15,
  },
  sheetChip: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SARA_CHIP,
  },
  sheetChipText: {
    color: SARA_TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
