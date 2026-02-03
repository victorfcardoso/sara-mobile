import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { tailwind } from '@/theme';
import { TAB_BAR_HEIGHT } from '@/constants';
import { NotificationsStackParamList } from '@/navigation/stack/NotificationsStack';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { selectNotificationById } from '@/store/notification/notificationSelectors';
import { notificationActions } from '@/store/notification/notificationAction';
import { getNotificationTypeConfig } from './components/NotificationTypeIndicator';
import { formatRelativeTime, formatTimeToShortForm } from '@/utils/dateTimeUtils';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';
import { saraConfig } from '@/config/saraConfig';
import { Icon } from '@/components-next';
import { ChevronLeft } from '@/svg-icons';
import { useSaraColors, useIsDarkMode, type SaraColors } from '@/hooks/useSaraColors';
import type { NotificationPayload } from '@/types/Notification';

type NotificationDetailScreenProps = NativeStackScreenProps<
  NotificationsStackParamList,
  'NotificationDetail'
>;

// Icons for detail sections - color passed from useSaraColors
const CalendarIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.66667 1.66667V4.16667M13.3333 1.66667V4.16667M2.91667 7.57501H17.0833M17.5 7.08334V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08334C2.5 4.58334 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58334 17.5 7.08334Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ServiceIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M7.50001 18.3333H12.5C16.6667 18.3333 18.3333 16.6667 18.3333 12.5V7.5C18.3333 3.33333 16.6667 1.66667 12.5 1.66667H7.50001C3.33334 1.66667 1.66667 3.33333 1.66667 7.5V12.5C1.66667 16.6667 3.33334 18.3333 7.50001 18.3333Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.125 7.5H6.875M13.125 12.5H6.875"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProviderIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M10 10C12.3012 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53214 12.3012 1.66667 10 1.66667C7.69882 1.66667 5.83334 3.53214 5.83334 5.83333C5.83334 8.13452 7.69882 10 10 10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17.1583 18.3333C17.1583 15.1083 13.95 12.5 10 12.5C6.05001 12.5 2.84167 15.1083 2.84167 18.3333"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 7.5L16.6667 9.16667L18.3333 7.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M6.11111 2.5H5C3.89543 2.5 3 3.39543 3 4.5V5.94444C3 12.0478 7.95222 17 14.0556 17H15.5C16.6046 17 17.5 16.1046 17.5 15V13.8889C17.5 13.3366 17.0523 12.8889 16.5 12.8889H14.2778C13.7255 12.8889 13.2778 13.3366 13.2778 13.8889V15"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6.11111 2.5V5C6.11111 5.55228 6.55883 6 7.11111 6H8.55556C9.10784 6 9.55556 5.55228 9.55556 5V3.61111"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChatIcon = ({ color }: { color: string }) => (
  <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.5 12.5C16.5 13.0523 16.0523 13.5 15.5 13.5H7.5L4 17V5.5C4 4.94772 4.44772 4.5 5 4.5H15.5C16.0523 4.5 16.5 4.94772 16.5 5.5V12.5Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Format appointment time for detail view
const formatDetailTime = (iso?: string): { date: string; time: string } | null => {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return { date: dateStr, time: timeStr };
  } catch {
    return null;
  }
};

// Info row component
const InfoRow = ({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: SaraColors;
}) => (
  <View
    style={[tailwind.style('flex-row items-start py-3 border-b'), { borderColor: colors.border }]}>
    <View
      style={[
        tailwind.style('w-10 h-10 rounded-xl items-center justify-center mr-3'),
        { backgroundColor: colors.accentLight },
      ]}>
      {icon}
    </View>
    <View style={tailwind.style('flex-1')}>
      <Animated.Text
        style={[
          tailwind.style('text-xs font-inter-medium-24 uppercase tracking-wide mb-1'),
          { color: colors.textMeta },
        ]}>
        {label}
      </Animated.Text>
      <Animated.Text
        style={[tailwind.style('text-base font-inter-semibold-20'), { color: colors.textPrimary }]}>
        {value}
      </Animated.Text>
    </View>
  </View>
);

// Action button component
const ActionButton = ({
  label,
  variant,
  onPress,
  loading,
  disabled,
  colors,
  isDark,
}: {
  label: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  colors: SaraColors;
  isDark: boolean;
}) => {
  const bgStyle =
    variant === 'primary'
      ? { backgroundColor: colors.accent }
      : { backgroundColor: colors.backgroundLight, borderWidth: 1, borderColor: colors.border };

  const textColor =
    variant === 'primary' ? (isDark ? colors.textPrimary : '#FFFFFF') : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={[
        tailwind.style('flex-1 py-4 rounded-xl items-center justify-center'),
        bgStyle,
        (loading || disabled) && { opacity: 0.5 },
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.accent : '#FFFFFF'} />
      ) : (
        <Animated.Text
          style={[tailwind.style('text-base font-inter-semibold-20'), { color: textColor }]}>
          {label}
        </Animated.Text>
      )}
    </Pressable>
  );
};

const NotificationDetailScreen = ({ route, navigation }: NotificationDetailScreenProps) => {
  const { notificationId } = route.params;
  const dispatch = useAppDispatch();
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  const notification = useAppSelector(state => selectNotificationById(state, notificationId));

  const [actionLoading, setActionLoading] = useState<'confirm' | 'decline' | null>(null);

  // Mark as read on mount
  React.useEffect(() => {
    if (notification && !notification.readAt) {
      dispatch(
        notificationActions.markAsRead({
          primaryActorId: notification.primaryActorId,
          primaryActorType: notification.primaryActorType,
          notifUlid: notification.notifUlid, // Pass Sara ULID for proper API routing
        }),
      );
    }
  }, [dispatch, notification]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Extract payload data
  const payload = notification?.payload || {};
  const bookingData = (payload.booking_data ||
    payload.booking ||
    payload.appointment ||
    payload.reservation ||
    {}) as NotificationPayload['booking_data'];

  const contactName =
    payload.customer_name ||
    payload.client_name ||
    bookingData.customer_name ||
    bookingData.client_name ||
    payload.patient_name ||
    payload.contact_name;

  const customerPhone = payload.customer_phone || payload.phone || payload.customer_id;

  const customerName = contactName || customerPhone || 'Unknown';

  const serviceName =
    payload.service_name ||
    payload.service_label ||
    bookingData.service_name ||
    bookingData.service_label;

  const providerName = payload.provider_name || bookingData.provider_name;

  const appointmentTime =
    payload.slot_time || payload.start_time || payload.new_start_iso || bookingData.start_time;

  const formattedTime = formatDetailTime(appointmentTime);

  const bookingUid =
    bookingData.uid ||
    bookingData.ea_appointment_id ||
    payload.pending_booking_id ||
    bookingData.reservation_id;

  const conversationId =
    payload.conversation_id || payload.cw_conversation_id || payload.source_id;

  // Get notification type config
  const notificationType = notification?.notificationType || '';
  const typeConfig = getNotificationTypeConfig(notificationType);

  const detailMessage =
    payload.message ||
    payload.description ||
    payload.message_preview ||
    payload.reason ||
    payload.summary ||
    payload.last_user_text;

  // Check if this notification needs doctor decision
  const needsDecision = notificationType === 'doctor.decision_required';

  // Handle doctor decision
  const handleDecision = useCallback(
    async (action: 'confirm' | 'decline') => {
      if (!bookingUid) {
        showToast({
          message: i18n.t('NOTIFICATION.ERRORS.MISSING_BOOKING_ID', {
            defaultValue: 'Booking ID not found',
          }),
        });
        return;
      }

      setActionLoading(action);

      try {
        // Call the doctor decision endpoint
        const response = await fetch(
          `${saraConfig.apiBaseUrl}/doctor/decision/${action}/${bookingUid}`,
          { method: 'GET' },
        );

        const result = await response.json();

        if (response.ok && result.status === 'success') {
          showToast({
            message:
              action === 'confirm'
                ? i18n.t('NOTIFICATION.DECISION.CONFIRMED', {
                    defaultValue: 'Booking confirmed successfully',
                  })
                : i18n.t('NOTIFICATION.DECISION.DECLINED', { defaultValue: 'Booking declined' }),
          });
          // Navigate back after successful action
          navigation.goBack();
        } else {
          throw new Error(result.message || 'Failed to process decision');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        Alert.alert(
          i18n.t('NOTIFICATION.ERRORS.DECISION_FAILED', { defaultValue: 'Decision Failed' }),
          message,
        );
      } finally {
        setActionLoading(null);
      }
    },
    [bookingUid, navigation],
  );

  // Format relative time
  const lastActivityAt = notification?.lastActivityAt
    ? formatTimeToShortForm(formatRelativeTime(notification.lastActivityAt), true)
    : '';

  if (!notification) {
    return (
      <SafeAreaView
        edges={['top']}
        style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={tailwind.style('flex-1 items-center justify-center')}>
          <Animated.Text
            style={[
              tailwind.style('text-base font-inter-normal-20'),
              { color: colors.textSecondary },
            ]}>
            {i18n.t('NOTIFICATION.NOT_FOUND', { defaultValue: 'Notification not found' })}
          </Animated.Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[tailwind.style('flex-1'), { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {/* Header */}
      <View
        style={[
          tailwind.style('flex-row items-center px-4 py-3 border-b'),
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}>
        <TouchableOpacity
          onPress={handleBack}
          style={tailwind.style('w-10 h-10 items-center justify-center -ml-2')}>
          <Icon icon={<ChevronLeft />} size={24} />
        </TouchableOpacity>
        <Animated.Text
          style={[
            tailwind.style('flex-1 text-lg font-inter-semibold-20'),
            { color: colors.textPrimary },
          ]}>
          {i18n.t('NOTIFICATION.DETAIL_TITLE', { defaultValue: 'Notification Details' })}
        </Animated.Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tailwind.style(`pb-[${TAB_BAR_HEIGHT + 20}px]`)}>
        {/* Type badge + time */}
        <View style={tailwind.style('px-4 pt-4 pb-2')}>
          <View style={tailwind.style('flex-row items-center')}>
            <View
              style={tailwind.style(
                'flex-row items-center gap-2 px-3 py-2 rounded-xl',
                `bg-${typeConfig.bgColor}`,
              )}>
              <View style={tailwind.style('w-5 h-5')}>{typeConfig.icon}</View>
              <Animated.Text
                style={tailwind.style(
                  'text-sm font-inter-semibold-20 uppercase tracking-wide',
                  `text-${typeConfig.color}`,
                )}>
                {typeConfig.label}
              </Animated.Text>
            </View>
            <View style={tailwind.style('flex-1')} />
            <Animated.Text
              style={[tailwind.style('text-sm font-inter-normal-20'), { color: colors.textMeta }]}>
              {lastActivityAt}
            </Animated.Text>
          </View>
        </View>

        {/* Main card */}
        <View
          style={[
            tailwind.style('mx-4 mt-2 rounded-2xl border overflow-hidden'),
            { backgroundColor: colors.backgroundLight, borderColor: colors.border },
          ]}>
          {/* Customer name (hero) */}
          <View style={[tailwind.style('px-4 pt-5 pb-4 border-b'), { borderColor: colors.border }]}>
            <Animated.Text
              style={[
                tailwind.style('text-xs font-inter-medium-24 uppercase tracking-wide mb-1'),
                { color: colors.textMeta },
              ]}>
              {i18n.t('NOTIFICATION.DETAIL.CUSTOMER', { defaultValue: 'Customer' })}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style('text-2xl font-inter-semibold-20'),
                { color: colors.textPrimary },
              ]}>
              {customerName}
            </Animated.Text>
          </View>

          {/* Info rows */}
          <View style={tailwind.style('px-4')}>
            {serviceName && (
              <InfoRow
                icon={<ServiceIcon color={colors.accent} />}
                label={i18n.t('NOTIFICATION.DETAIL.SERVICE', { defaultValue: 'Service' })}
                value={serviceName}
                colors={colors}
              />
            )}

            {providerName && (
              <InfoRow
                icon={<ProviderIcon color={colors.accent} />}
                label={i18n.t('NOTIFICATION.DETAIL.PROVIDER', { defaultValue: 'Provider' })}
                value={providerName}
                colors={colors}
              />
            )}

            {formattedTime && (
              <InfoRow
                icon={<CalendarIcon color={colors.accent} />}
                label={i18n.t('NOTIFICATION.DETAIL.APPOINTMENT_TIME', {
                  defaultValue: 'Appointment',
                })}
                value={`${formattedTime.date}\n${formattedTime.time}`}
                colors={colors}
              />
            )}

            {customerPhone && customerPhone !== customerName && (
              <InfoRow
                icon={<PhoneIcon color={colors.accent} />}
                label={i18n.t('NOTIFICATION.DETAIL.PHONE', { defaultValue: 'Phone' })}
                value={customerPhone}
                colors={colors}
              />
            )}

            {conversationId && (
              <InfoRow
                icon={<ChatIcon color={colors.accent} />}
                label={i18n.t('NOTIFICATION.DETAIL.CONVERSATION', {
                  defaultValue: 'Conversation',
                })}
                value={String(conversationId)}
                colors={colors}
              />
            )}
          </View>
        </View>

        {/* Action buttons for decision-required notifications */}
        {needsDecision && bookingUid && (
          <View style={tailwind.style('mx-4 mt-6')}>
            <Animated.Text
              style={[
                tailwind.style('text-sm font-inter-medium-24 mb-3 text-center'),
                { color: colors.textSecondary },
              ]}>
              {i18n.t('NOTIFICATION.DECISION.PROMPT', {
                defaultValue: 'Approve or decline this booking request?',
              })}
            </Animated.Text>
            <View style={tailwind.style('flex-row gap-3')}>
              <ActionButton
                label={i18n.t('NOTIFICATION.DECISION.DECLINE_BUTTON', { defaultValue: 'Decline' })}
                variant="secondary"
                onPress={() => handleDecision('decline')}
                loading={actionLoading === 'decline'}
                disabled={actionLoading !== null}
                colors={colors}
                isDark={isDark}
              />
              <ActionButton
                label={i18n.t('NOTIFICATION.DECISION.CONFIRM_BUTTON', { defaultValue: 'Confirm' })}
                variant="primary"
                onPress={() => handleDecision('confirm')}
                loading={actionLoading === 'confirm'}
                disabled={actionLoading !== null}
                colors={colors}
                isDark={isDark}
              />
            </View>
          </View>
        )}

        {/* Additional context section (for other notification types) */}
        {!needsDecision && detailMessage && (
          <View
            style={[
              tailwind.style('mx-4 mt-4 p-4 rounded-2xl border'),
              { backgroundColor: colors.backgroundLight, borderColor: colors.border },
            ]}>
            <Animated.Text
              style={[
                tailwind.style('text-xs font-inter-medium-24 uppercase tracking-wide mb-2'),
                { color: colors.textMeta },
              ]}>
              {i18n.t('NOTIFICATION.DETAIL.MESSAGE', { defaultValue: 'Message' })}
            </Animated.Text>
            <Animated.Text
              style={[
                tailwind.style('text-base font-inter-normal-20 leading-relaxed'),
                { color: colors.textPrimary },
              ]}>
              {detailMessage}
            </Animated.Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;
