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
  CONTACT_COLORS,
  buildConversationByPhoneMap,
  formatPhoneForDisplay,
  getContactDisplayName,
  isTemplateRequired,
  normalizePhone,
  toDateOrNull,
} from './contactUtils';

type ScreenProps = NativeStackScreenProps<ContactsStackParamList, 'ContactDetailsScreen'>;

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
  CANCELED: { backgroundColor: '#F8E6E6', textColor: '#8A3B3B' },
  NO_SHOW: { backgroundColor: '#E5E7F2', textColor: '#3B4770' },
};

const DEFAULT_STATUS_STYLE = { backgroundColor: '#E2E6EB', textColor: '#3D4A5C' };

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

  const contact = useAppSelector(state => selectCrmCustomerById(state, contactId));
  const uiFlags = useAppSelector(selectCrmCustomersUiFlags);
  const appointments = useAppSelector(selectAppointmentsList);
  const conversations = useAppSelector(selectAllConversations);

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor={CONTACT_COLORS.background} barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={I18n.t('CONTACTS.DETAIL.BACK_ACCESSIBILITY')}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
          <ChevronLeft stroke={CONTACT_COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerTrailing} />
      </View>

      {!contact ? (
        <View style={styles.loadingContainer}>
          {uiFlags.isLoading ? (
            <ActivityIndicator color={CONTACT_COLORS.accent} />
          ) : (
            <>
              <Text style={styles.emptyTitle}>{I18n.t('CONTACTS.DETAIL.NOT_FOUND_TITLE')}</Text>
              <Text style={styles.emptySubtitle}>
                {I18n.t('CONTACTS.DETAIL.NOT_FOUND_SUBTITLE')}
              </Text>
            </>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <Avatar size="xl" name={displayName} style={styles.avatar} />
            <Text style={styles.heroName} numberOfLines={2}>
              {displayName}
            </Text>
            <Text style={styles.heroPhone}>{phoneLabel}</Text>
            <View style={styles.badgeRow}>
              {showThreadBadge ? (
                <View style={styles.threadBadge}>
                  <View style={styles.threadDot} />
                  <Text style={styles.threadBadgeLabel}>
                    {I18n.t('CONTACTS.DETAIL.ACTIVE_THREAD')}
                  </Text>
                </View>
              ) : (
                <View style={styles.mutedBadge}>
                  <Text style={styles.mutedBadgeLabel}>
                    {I18n.t('CONTACTS.DETAIL.NO_THREAD_LABEL')}
                  </Text>
                </View>
              )}
              {templateRequired ? (
                <View style={styles.templateBadge}>
                  <Text style={styles.templateBadgeLabel}>{I18n.t('CONTACTS.BADGE_TEMPLATE')}</Text>
                </View>
              ) : null}
              {awaitingName ? (
                <View style={styles.awaitingBadge}>
                  <Text style={styles.awaitingBadgeLabel}>
                    {I18n.t('CONTACTS.DETAIL.AWAITING_NAME')}
                  </Text>
                </View>
              ) : null}
            </View>
            {lastSeenDate ? (
              <Text style={styles.lastSeenText}>
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
            />
            <ActionButton
              label={I18n.t('CONTACTS.DETAIL.ACTIONS.SCHEDULE')}
              onPress={handleSchedule}
              variant="secondary"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{I18n.t('CONTACTS.DETAIL.INFO_SECTION')}</Text>
            <InfoRow label={I18n.t('CONTACTS.DETAIL.EMAIL')} value={contact.email} />
            <InfoRow label={I18n.t('CONTACTS.DETAIL.LOCATION')} value={locationParts || null} />
            <InfoRow
              label={I18n.t('CONTACTS.DETAIL.CREATED_AT')}
              value={createdAt ? format(createdAt, 'dd MMM yyyy, HH:mm') : null}
            />
            <InfoRow
              label={I18n.t('CONTACTS.DETAIL.UPDATED_AT')}
              value={updatedAt ? format(updatedAt, 'dd MMM yyyy, HH:mm') : null}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{I18n.t('CONTACTS.DETAIL.APPOINTMENTS_TITLE')}</Text>
            {upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
              <Text style={styles.sectionEmptyText}>
                {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_EMPTY')}
              </Text>
            ) : null}

            {upcomingAppointments.length > 0 ? (
              <>
                <Text style={styles.sectionSubtitle}>
                  {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_UPCOMING')}
                </Text>
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={`upcoming-${appointment.id}`} appointment={appointment} />
                ))}
              </>
            ) : null}

            {pastAppointments.length > 0 ? (
              <>
                <Text style={styles.sectionSubtitle}>
                  {I18n.t('CONTACTS.DETAIL.APPOINTMENTS_HISTORY')}
                </Text>
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={`past-${appointment.id}`} appointment={appointment} />
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
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary';
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.actionButtonBase,
        variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary,
        pressed && styles.actionButtonPressed,
        disabled && styles.actionButtonDisabled,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          variant === 'primary' ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary,
          disabled && styles.actionButtonTextDisabled,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | null }) => {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || I18n.t('CONTACTS.DETAIL.VALUE_UNAVAILABLE')}</Text>
    </View>
  );
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const statusKey = (appointment.status || '').toUpperCase();
  const badgeStyle = STATUS_COLORS[statusKey] ?? DEFAULT_STATUS_STYLE;
  const timeLabel = appointment.startAt
    ? format(new Date(appointment.startAt), 'EEE, MMM d • HH:mm')
    : I18n.t('APPOINTMENTS.TIME_PLACEHOLDER');

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentTime}>{timeLabel}</Text>
        <View style={[styles.statusPill, { backgroundColor: badgeStyle.backgroundColor }]}>
          <Text style={[styles.statusPillText, { color: badgeStyle.textColor }]}>
            {getStatusLabel(statusKey)}
          </Text>
        </View>
      </View>
      <Text style={styles.appointmentTitle}>
        {appointment.serviceName || I18n.t('CONTACTS.DETAIL.SERVICE_PLACEHOLDER')}
      </Text>
      <Text style={styles.appointmentSubtitle}>
        {appointment.customerName || I18n.t('CONTACTS.UNKNOWN_NAME')}
      </Text>
      {appointment.location ? (
        <Text style={styles.appointmentMeta}>{appointment.location}</Text>
      ) : null}
    </View>
  );
};

export { CrmContactDetailsScreen };

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CONTACT_COLORS.background,
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
  backButtonPressed: {
    backgroundColor: '#EFE8E0',
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 18,
    fontFamily: 'Inter-600-24',
    color: CONTACT_COLORS.textPrimary,
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
    color: CONTACT_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: CONTACT_COLORS.card,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#00000010',
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
    color: CONTACT_COLORS.textPrimary,
    textAlign: 'center',
  },
  heroPhone: {
    marginTop: 6,
    fontSize: 15,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.textSecondary,
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
    backgroundColor: '#E4F3F0',
  },
  threadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CONTACT_COLORS.accent,
    marginRight: 6,
  },
  threadBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
    color: CONTACT_COLORS.accent,
  },
  mutedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEE7E1',
  },
  mutedBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
    color: CONTACT_COLORS.textSecondary,
  },
  templateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: CONTACT_COLORS.badgeAmberBg,
  },
  templateBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
    color: CONTACT_COLORS.badgeAmberText,
  },
  awaitingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E3FC',
  },
  awaitingBadgeLabel: {
    fontSize: 12,
    fontFamily: 'Inter-500-24',
    color: '#3E3A92',
  },
  lastSeenText: {
    marginTop: 18,
    fontSize: 13,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.muted,
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
  actionButtonPrimary: {
    backgroundColor: CONTACT_COLORS.accent,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: CONTACT_COLORS.accent,
    backgroundColor: CONTACT_COLORS.background,
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  actionButtonDisabled: {
    backgroundColor: '#D3E4E1',
    borderColor: '#D3E4E1',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-500-24',
  },
  actionButtonTextPrimary: {
    color: '#0F4D49',
  },
  actionButtonTextSecondary: {
    color: CONTACT_COLORS.accent,
  },
  actionButtonTextDisabled: {
    color: '#6F8A86',
  },
  section: {
    backgroundColor: CONTACT_COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Inter-600-24',
    color: CONTACT_COLORS.textPrimary,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-500-24',
    color: CONTACT_COLORS.textSecondary,
    marginBottom: 12,
  },
  sectionEmptyText: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.textSecondary,
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
    color: CONTACT_COLORS.textPrimary,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.textSecondary,
    textAlign: 'right',
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: '#E6E2DD',
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
    color: CONTACT_COLORS.textPrimary,
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
    color: CONTACT_COLORS.textPrimary,
    marginBottom: 4,
  },
  appointmentSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.textSecondary,
    marginBottom: 4,
  },
  appointmentMeta: {
    fontSize: 13,
    fontFamily: 'Inter-420-20',
    color: CONTACT_COLORS.muted,
  },
});
