import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, isAfter, isSameDay } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackActions } from '@react-navigation/native';

import I18n from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { useSaraColors, useIsDarkMode, SaraColors } from '@/hooks/useSaraColors';
import { Avatar } from '@/components-next/common/avatar/Avatar';
import { ChevronLeft } from '@/svg-icons';
import { showToast } from '@/utils/toastUtils';
import { crmCustomersActions } from '@/store/crm-customers';
import {
  selectCrmCustomerById,
  selectCrmCustomersUiFlags,
} from '@/store/crm-customers/crmCustomersSelectors';
import { ContactsStackParamList } from '@/navigation/stack/ContactsStack';
import { selectAppointmentsList } from '@/store/appointments/appointmentsSelectors';
import type { Appointment } from '@/store/appointments/appointmentsTypes';
import { selectAllConversations } from '@/store/conversation/conversationSelectors';
import {
  buildConversationByPhoneMap,
  formatPhoneForDisplay,
  getContactDisplayName,
  isTemplateRequired,
  normalizePhone,
  toDateOrNull,
} from './contactUtils';

type ScreenProps = NativeStackScreenProps<ContactsStackParamList, 'ContactDetailsScreen'>;

// Additional colors used for badges (not in core Sara palette)
const BADGE_AMBER_BG_LIGHT = '#FFEBD6';
const BADGE_AMBER_BG_DARK = '#4A3D2A';
const BADGE_AMBER_TEXT_LIGHT = '#8A5A2E';
const BADGE_AMBER_TEXT_DARK = '#E5C08A';
const BADGE_PURPLE_BG_LIGHT = '#E5E3FC';
const BADGE_PURPLE_BG_DARK = '#2E2C4A';
const BADGE_PURPLE_TEXT_LIGHT = '#3E3A92';
const BADGE_PURPLE_TEXT_DARK = '#A8A4E5';

// Status badge colors for light mode
const STATUS_COLORS_LIGHT: Record<
  string,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  CONFIRMED: { backgroundColor: '#CCE6DE', textColor: '#0F4D49' },
  PENDING: { backgroundColor: '#FFF1D6', textColor: '#8A5A2E' },
  AWAITING_PAYMENT: { backgroundColor: '#FFE6E0', textColor: '#9F4E2F' },
  CANCELED: { backgroundColor: '#F8E6E6', textColor: '#8A3B3B' },
  NO_SHOW: { backgroundColor: '#E5E7F2', textColor: '#3B4770' },
};

// Status badge colors for dark mode
const STATUS_COLORS_DARK: Record<
  string,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  CONFIRMED: { backgroundColor: '#1E3A38', textColor: '#6BD4C8' },
  PENDING: { backgroundColor: '#4A3D2A', textColor: '#E5C08A' },
  AWAITING_PAYMENT: { backgroundColor: '#4A3028', textColor: '#E5A88A' },
  CANCELED: { backgroundColor: '#4A2828', textColor: '#E5A0A0' },
  NO_SHOW: { backgroundColor: '#2E3040', textColor: '#A8B0C8' },
};

const DEFAULT_STATUS_STYLE_LIGHT = { backgroundColor: '#E2E6EB', textColor: '#3D4A5C' };
const DEFAULT_STATUS_STYLE_DARK = { backgroundColor: '#3A3D45', textColor: '#B8C4CE' };

const getStatusLabel = (status: string): string => {
  const key = status.toUpperCase();
  const translationKey = `APPOINTMENTS.STATUS.${key}`;
  const translated = I18n.t(translationKey);
  return translated === translationKey ? status : translated;
};

const CrmContactDetailsScreen = ({ navigation, route }: ScreenProps) => {
  const { contactId } = route.params;
  const dispatch = useAppDispatch();
  const fetchAttemptRef = useRef(false);
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  const contact = useAppSelector(state => selectCrmCustomerById(state, contactId));
  const uiFlags = useAppSelector(selectCrmCustomersUiFlags);
  const appointments = useAppSelector(selectAppointmentsList);
  const conversations = useAppSelector(selectAllConversations);

  // Theme-aware badge colors
  const badgeAmberBg = isDark ? BADGE_AMBER_BG_DARK : BADGE_AMBER_BG_LIGHT;
  const badgeAmberText = isDark ? BADGE_AMBER_TEXT_DARK : BADGE_AMBER_TEXT_LIGHT;
  const badgePurpleBg = isDark ? BADGE_PURPLE_BG_DARK : BADGE_PURPLE_BG_LIGHT;
  const badgePurpleText = isDark ? BADGE_PURPLE_TEXT_DARK : BADGE_PURPLE_TEXT_LIGHT;
  const threadBadgeBg = isDark ? colors.accentLight : '#E4F3F0';
  const mutedBadgeBg = isDark ? colors.chip : '#EEE7E1';
  const backButtonPressedBg = isDark ? colors.chip : '#EFE8E0';

  const normalizedPhone = useMemo(
    () => normalizePhone(contact?.whatsappPhone ?? null),
    [contact?.whatsappPhone],
  );

  useEffect(() => {
    if (!contact && !fetchAttemptRef.current) {
      dispatch(crmCustomersActions.fetchCustomers({ search: contactId, refresh: true }));
      fetchAttemptRef.current = true;
    }
  }, [contact, contactId, dispatch]);

  const conversationByPhone = useMemo(
    () => buildConversationByPhoneMap(conversations),
    [conversations],
  );

  const conversation = normalizedPhone ? conversationByPhone.get(normalizedPhone) : undefined;

  const relevantAppointments = useMemo(() => {
    if (!normalizedPhone) {
      return [];
    }
    return appointments
      .filter(appointment => normalizePhone(appointment.customerPhone) === normalizedPhone)
      .slice();
  }, [appointments, normalizedPhone]);

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    relevantAppointments.forEach(appointment => {
      if (!appointment.startAt) {
        return;
      }
      const date = new Date(appointment.startAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      if (isAfter(date, now)) {
        upcoming.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    upcoming.sort((a, b) => {
      const aDate = new Date(a.startAt ?? '').getTime();
      const bDate = new Date(b.startAt ?? '').getTime();
      return aDate - bDate;
    });

    past
      .sort((a, b) => {
        const aDate = new Date(a.startAt ?? '').getTime();
        const bDate = new Date(b.startAt ?? '').getTime();
        return bDate - aDate;
      })
      .splice(3); // keep only three most recent past appointments

    return {
      upcomingAppointments: upcoming,
      pastAppointments: past,
    };
  }, [relevantAppointments]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleOpenChat = () => {
    if (!conversation) {
      showToast({ message: I18n.t('CONTACTS.NO_THREAD') });
      return;
    }

    const action = StackActions.push('ChatScreen', {
      conversationId: conversation.id,
      isConversationOpenedExternally: false,
    });
    navigation.dispatch(action);
  };

  const handleSchedule = () => {
    const parentNavigator = navigation.getParent();
    parentNavigator?.navigate('Appointments');
  };

  const displayName = contact ? getContactDisplayName(contact) : '';
  const phoneLabel = contact ? formatPhoneForDisplay(contact.whatsappPhone) : '';
  const templateRequired = contact ? isTemplateRequired(contact) : false;
  const lastSeenDate = toDateOrNull(contact?.latestSeen ?? null);
  const createdAt = toDateOrNull(contact?.createdAt ?? null);
  const updatedAt = toDateOrNull(contact?.updatedAt ?? null);

  const showThreadBadge = Boolean(contact?.threadId);
  const awaitingName = Boolean(contact?.awaitingName);

  const locationParts = [contact?.address, contact?.city, contact?.state, contact?.country]
    .filter(part => part && part.trim().length > 0)
    .join(', ');

  const headerTitle =
    contact && contact.fullName ? contact.fullName : I18n.t('CONTACTS.DETAIL.TITLE');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={colors.background} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={I18n.t('CONTACTS.DETAIL.BACK_ACCESSIBILITY')}
          style={({ pressed }) => [styles.backButton, pressed && { backgroundColor: backButtonPressedBg }]}>
          <ChevronLeft stroke={colors.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerTrailing} />
      </View>

      {!contact ? (
        <View style={styles.loadingContainer}>
          {uiFlags.isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                {I18n.t('CONTACTS.DETAIL.NOT_FOUND_TITLE')}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {I18n.t('CONTACTS.DETAIL.NOT_FOUND_SUBTITLE')}
              </Text>
            </>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.heroCard, { backgroundColor: colors.backgroundLight }]}>
            <Avatar size="xl" name={displayName} style={styles.avatar} />
            <Text style={[styles.heroName, { color: colors.textPrimary }]} numberOfLines={2}>
              {displayName}
            </Text>
            <Text style={[styles.heroPhone, { color: colors.textSecondary }]}>{phoneLabel}</Text>
            <View style={styles.badgeRow}>
              {showThreadBadge ? (
                <View style={[styles.threadBadge, { backgroundColor: threadBadgeBg }]}>
                  <View style={[styles.threadDot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.threadBadgeLabel, { color: colors.accent }]}>
                    {I18n.t('CONTACTS.DETAIL.ACTIVE_THREAD')}
                  </Text>
                </View>
              ) : (
                <View style={[styles.mutedBadge, { backgroundColor: mutedBadgeBg }]}>
                  <Text style={[styles.mutedBadgeLabel, { color: colors.textSecondary }]}>
                    {I18n.t('CONTACTS.DETAIL.NO_THREAD_LABEL')}
                  </Text>
                </View>
              )}
              {templateRequired ? (
                <View style={[styles.templateBadge, { backgroundColor: badgeAmberBg }]}>
                  <Text style={[styles.templateBadgeLabel, { color: badgeAmberText }]}>
                    {I18n.t('CONTACTS.BADGE_TEMPLATE')}
                  </Text>
                </View>
              ) : null}
              {awaitingName ? (
                <View style={[styles.awaitingBadge, { backgroundColor: badgePurpleBg }]}>
                  <Text style={[styles.awaitingBadgeLabel, { color: badgePurpleText }]}>
                    {I18n.t('CONTACTS.DETAIL.AWAITING_NAME')}
                  </Text>
                </View>
              ) : null}
            </View>
            {lastSeenDate ? (
              <Text style={[styles.lastSeenText, { color: colors.textMeta }]}>
                {isSameDay(lastSeenDate, new Date())
                  ? I18n.t('CONTACTS.LAST_SEEN_TODAY', {
                      time: format(lastSeenDate, 'HH:mm'),
                    })
                  : I18n.t('CONTACTS.LAST_SEEN_DATE', {
                      date: format(lastSeenDate, 'dd MMM yyyy, HH:mm'),
                    })}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionsRow}>
            <ActionButton
              label={
                conversation
                  ? I18n.t('CONTACTS.DETAIL.ACTIONS.OPEN_CHAT')
                  : I18n.t('CONTACTS.DETAIL.ACTIONS.START_CHAT')
              }
              onPress={handleOpenChat}
              disabled={!conversation}
              variant="primary"
              colors={colors}
            />
            <ActionButton
              label={I18n.t('CONTACTS.DETAIL.ACTIONS.SCHEDULE')}
              onPress={handleSchedule}
              variant="secondary"
              colors={colors}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.backgroundLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {I18n.t('CONTACTS.DETAIL.INFO_SECTION')}
            </Text>
            <InfoRow label={I18n.t('CONTACTS.DETAIL.EMAIL')} value={contact.email} colors={colors} />
            <InfoRow label={I18n.t('CONTACTS.DETAIL.LOCATION')} value={locationParts || null} colors={colors} />
            <InfoRow
              label={I18n.t('CONTACTS.DETAIL.CREATED_AT')}
              value={createdAt ? format(createdAt, 'dd MMM yyyy, HH:mm') : null}
              colors={colors}
            />
            <InfoRow
              label={I18n.t('CONTACTS.DETAIL.UPDATED_AT')}
              value={updatedAt ? format(updatedAt, 'dd MMM yyyy, HH:mm') : null}
              colors={colors}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.backgroundLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_TITLE')}
            </Text>
            {upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
              <Text style={[styles.sectionEmptyText, { color: colors.textSecondary }]}>
                {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_EMPTY')}
              </Text>
            ) : null}

            {upcomingAppointments.length > 0 ? (
              <>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_UPCOMING')}
                </Text>
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={`upcoming-${appointment.id}`} appointment={appointment} colors={colors} isDark={isDark} />
                ))}
              </>
            ) : null}

            {pastAppointments.length > 0 ? (
              <>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_HISTORY')}
                </Text>
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={`past-${appointment.id}`} appointment={appointment} colors={colors} isDark={isDark} />
                ))}
              </>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const ActionButton = ({
  label,
  onPress,
  disabled,
  variant,
  colors,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary';
  colors: SaraColors;
}) => {
  const disabledBg = colors.accentMuted;
  const disabledText = colors.textMeta;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.actionButtonBase,
        variant === 'primary'
          ? { backgroundColor: disabled ? disabledBg : colors.accent }
          : { borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.background },
        pressed && styles.actionButtonPressed,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          variant === 'primary'
            ? { color: disabled ? disabledText : colors.backgroundLight }
            : { color: colors.accent },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const InfoRow = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string | null;
  colors: SaraColors;
}) => {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
        {value || I18n.t('CONTACTS.DETAIL.VALUE_UNAVAILABLE')}
      </Text>
    </View>
  );
};

const AppointmentCard = ({
  appointment,
  colors,
  isDark,
}: {
  appointment: Appointment;
  colors: SaraColors;
  isDark: boolean;
}) => {
  const statusKey = (appointment.status || '').toUpperCase();
  const statusColors = isDark ? STATUS_COLORS_DARK : STATUS_COLORS_LIGHT;
  const defaultStatusStyle = isDark ? DEFAULT_STATUS_STYLE_DARK : DEFAULT_STATUS_STYLE_LIGHT;
  const badgeStyle = statusColors[statusKey] ?? defaultStatusStyle;
  const timeLabel = appointment.startAt
    ? format(new Date(appointment.startAt), 'EEE, MMM d • HH:mm')
    : I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');

  return (
    <View style={[styles.appointmentCard, { borderColor: colors.border }]}>
      <View style={styles.appointmentHeader}>
        <Text style={[styles.appointmentTime, { color: colors.textPrimary }]}>{timeLabel}</Text>
        <View style={[styles.statusPill, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.statusPillText, { color: badgeStyle.textColor }]}>
            {getStatusLabel(statusKey)}
          </Text>
        </View>
      </View>
      <Text style={[styles.appointmentTitle, { color: colors.textPrimary }]}>
        {appointment.serviceName || I18n.t('CONTACTS.DETAIL.SERVICE_PLACEHOLDER')}
      </Text>
      <Text style={[styles.appointmentSubtitle, { color: colors.textSecondary }]}>
        {appointment.customerName || I18n.t('CONTACTS.UNKNOWN_NAME')}
      </Text>
      {appointment.location ? (
        <Text style={[styles.appointmentMeta, { color: colors.textMeta }]}>{appointment.location}</Text>
      ) : null}
    </View>
  );
};

export { CrmContactDetailsScreen };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 18,
    fontFamily: 'Inter-600-24',
  },
  headerTrailing: {
    width: 44,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-500-24',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
  },
  heroName: {
    fontSize: 22,
    fontFamily: 'Inter-600-24',
    textAlign: 'center',
  },
  heroPhone: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Inter-420-20',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
    justifyContent: 'center',
  },
  threadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  threadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  threadBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
  },
  mutedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mutedBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
  },
  templateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  templateBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
  },
  awaitingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  awaitingBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
  },
  lastSeenText: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: 'Inter-420-20',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButtonBase: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-500-24',
  },
  section: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter-600-24',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
    marginBottom: 12,
  },
  sectionEmptyText: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-500-24',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    textAlign: 'right',
  },
  appointmentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
  },
  appointmentTitle: {
    fontSize: 16,
    fontFamily: 'Inter-500-24',
    marginBottom: 4,
  },
  appointmentSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    marginBottom: 4,
  },
  appointmentMeta: {
    fontSize: 13,
    fontFamily: 'Inter-420-20',
  },
});
