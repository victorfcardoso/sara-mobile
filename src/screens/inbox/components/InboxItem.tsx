import React, { useState, useCallback } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { tailwind } from '@/theme';
import type { NotificationType, NotificationPayload } from '@/types/Notification';
import { getNotificationTypeConfig } from './NotificationTypeIndicator';
import { useSaraColors, useIsDarkMode } from '@/hooks/useSaraColors';
import { saraApiService } from '@/services/SaraAPIService';
import { showToast } from '@/utils/toastUtils';
import i18n from '@/i18n';

interface AvailableProvider {
  id: string;
  name: string;
}

type InboxItemProps = {
  isRead: boolean;
  notificationType: NotificationType | string;
  pushMessageTitle: string;
  lastActivityAt: () => string;
  payload?: NotificationPayload;
  onActionComplete?: () => void;
};

// Extract meaningful summary from payload (similar to web CRM)
const getPayloadSummary = (
  payload?: NotificationPayload,
  pushMessageTitle?: string,
): { title: string; subtitle?: string; providerName?: string; appointmentTime?: string } => {
  if (!payload) {
    return { title: pushMessageTitle || 'New notification' };
  }

  const bookingData = payload.booking_data || {};

  // Try to get customer/patient name
  const customerName =
    payload.customer_name ||
    payload.client_name ||
    bookingData.customer_name ||
    bookingData.client_name ||
    payload.patient_name;

  // Try to get service name
  const serviceName =
    payload.service_name ||
    payload.service_label ||
    bookingData.service_name ||
    bookingData.service_label;

  // Try to get provider name
  const providerName = payload.provider_name || bookingData.provider_name;

  // Try to get appointment time
  const appointmentTime = payload.slot_time || payload.start_time || bookingData.start_time;

  if (customerName && serviceName) {
    return {
      title: String(customerName),
      subtitle: String(serviceName),
      providerName: providerName ? String(providerName) : undefined,
      appointmentTime: appointmentTime ? formatAppointmentTime(appointmentTime) : undefined,
    };
  }
  if (customerName) {
    return {
      title: String(customerName),
      providerName: providerName ? String(providerName) : undefined,
      appointmentTime: appointmentTime ? formatAppointmentTime(appointmentTime) : undefined,
    };
  }
  if (payload.title && payload.title !== pushMessageTitle) {
    return { title: String(payload.title) };
  }
  if (payload.message) {
    return { title: String(payload.message) };
  }

  return { title: pushMessageTitle || 'New notification' };
};

// Format appointment time (Today at 2:30 PM, Tomorrow at 10:00 AM, etc.)
const formatAppointmentTime = (iso?: string): string => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (date.toDateString() === now.toDateString()) return `Today at ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr} at ${timeStr}`;
  } catch {
    return '';
  }
};

// Extract booking UID from payload
const getBookingUid = (payload?: NotificationPayload): string | null => {
  if (!payload) return null;
  const bookingData = payload.booking_data || {};
  return (
    bookingData.uid ||
    bookingData.ea_appointment_id ||
    payload.pending_booking_id ||
    bookingData.reservation_id ||
    null
  );
};

// Check if doctor decision is still needed
const isDecisionPending = (payload?: NotificationPayload): boolean => {
  if (!payload) return true;
  const bookingData = payload.booking_data || {};
  const appointmentStatus = (
    payload.appointment_status ||
    payload.status ||
    bookingData.status ||
    ''
  )
    .toString()
    .toUpperCase();
  const decisionMade =
    payload.agent_decision_at ||
    payload.doctor_decision_at ||
    bookingData.agent_decision_at ||
    bookingData.doctor_decision_at ||
    ['CONFIRMED', 'CANCELLED', 'AWAITING_PAYMENT'].includes(appointmentStatus);
  return !decisionMade;
};

// Inline action button component
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
  colors: ReturnType<typeof useSaraColors>;
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
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={loading || disabled}
      style={[
        tailwind.style('px-4 py-2 rounded-xl items-center justify-center'),
        bgStyle,
        (loading || disabled) && { opacity: 0.5 },
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? colors.accent : '#FFFFFF'}
        />
      ) : (
        <Animated.Text
          style={[tailwind.style('text-sm font-inter-semibold-20'), { color: textColor }]}>
          {label}
        </Animated.Text>
      )}
    </Pressable>
  );
};

export const InboxItemComponent = (props: InboxItemProps) => {
  const { isRead, notificationType, pushMessageTitle, lastActivityAt, payload, onActionComplete } =
    props;
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  // Action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionCompleted, setActionCompleted] = useState(false);

  const config = getNotificationTypeConfig(notificationType);
  const { title, subtitle, providerName, appointmentTime } = getPayloadSummary(
    payload,
    pushMessageTitle,
  );

  // Check if this notification supports inline actions
  const needsDoctorDecision =
    notificationType === 'doctor.decision_required' &&
    isDecisionPending(payload) &&
    !actionCompleted;
  const needsProviderAssignment =
    notificationType === 'booking.provider_assignment_required' && !actionCompleted;

  const bookingUid = getBookingUid(payload);
  const availableProviders: AvailableProvider[] = payload?.available_providers || [];
  const pendingBookingId = payload?.pending_booking_id;

  // Handle doctor decision (confirm/decline)
  const handleDoctorDecision = useCallback(
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
        const response = await saraApiService.get(`/doctor/decision/${action}/${bookingUid}`);
        const result = response.data as { status?: string; message?: string };

        if (result.status === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          showToast({
            message:
              action === 'confirm'
                ? i18n.t('NOTIFICATION.DECISION.CONFIRMED', {
                    defaultValue: 'Booking confirmed',
                  })
                : i18n.t('NOTIFICATION.DECISION.DECLINED', { defaultValue: 'Booking declined' }),
          });
          setActionCompleted(true);
          onActionComplete?.();
        } else {
          throw new Error(result.message || 'Failed to process decision');
        }
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const message = error instanceof Error ? error.message : 'An error occurred';
        showToast({ message });
      } finally {
        setActionLoading(null);
      }
    },
    [bookingUid, onActionComplete],
  );

  // Handle provider assignment
  const handleProviderAssignment = useCallback(
    async (providerId: string, providerDisplayName: string) => {
      if (!pendingBookingId) {
        showToast({
          message: i18n.t('NOTIFICATION.ERRORS.MISSING_BOOKING_ID', {
            defaultValue: 'Booking ID not found',
          }),
        });
        return;
      }

      setActionLoading(providerId);
      try {
        await saraApiService.post(`/s/pending-bookings/${pendingBookingId}/assign`, {
          provider_id: parseInt(providerId, 10),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToast({
          message: i18n.t('NOTIFICATION.PROVIDER_ASSIGNED', {
            defaultValue: `${providerDisplayName} assigned`,
            name: providerDisplayName,
          }),
        });
        setActionCompleted(true);
        onActionComplete?.();
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const message = error instanceof Error ? error.message : 'Failed to assign provider';
        showToast({ message });
      } finally {
        setActionLoading(null);
      }
    },
    [pendingBookingId, onActionComplete],
  );

  return (
    <View style={tailwind.style('mx-3 my-1.5')}>
      <View
        style={[
          tailwind.style('rounded-2xl overflow-hidden flex-row border'),
          {
            backgroundColor: colors.backgroundLight,
            borderColor: isRead ? colors.border : colors.borderStrong,
          },
        ]}>
        {/* Left accent bar - uses notification type color */}
        <View
          style={[
            tailwind.style('w-1'),
            {
              backgroundColor: config.hexColor,
              opacity: isRead ? 0.4 : 1,
            },
          ]}
        />

        {/* Card content */}
        <View style={tailwind.style('flex-1 p-3')}>
          {/* Header: Icon + Type + Dot + Time */}
          <View style={tailwind.style('flex-row items-center mb-2')}>
            {/* Icon container */}
            <View
              style={tailwind.style(
                'w-8 h-8 rounded-lg items-center justify-center mr-2',
                `bg-${config.bgColor}`,
              )}>
              {config.icon}
            </View>

            {/* Type label */}
            <Animated.Text
              style={tailwind.style(
                'text-xs font-inter-medium-24 uppercase tracking-wide',
                `text-${config.color}`,
              )}>
              {config.label}
            </Animated.Text>

            {/* Spacer */}
            <View style={tailwind.style('flex-1')} />

            {/* Unread dot */}
            {!isRead && (
              <View style={tailwind.style('w-2 h-2 rounded-full mr-2', `bg-${config.color}`)} />
            )}

            {/* Time */}
            <Animated.Text
              style={[tailwind.style('text-xs font-inter-normal-20'), { color: colors.textMeta }]}>
              {lastActivityAt()}
            </Animated.Text>
          </View>

          {/* Main content: Title + Subtitle + Provider */}
          <Animated.Text
            style={[
              tailwind.style('text-base font-inter-semibold-20 leading-tight'),
              { color: colors.textPrimary },
            ]}
            numberOfLines={1}>
            {title}
          </Animated.Text>

          {(subtitle || providerName) && (
            <Animated.Text
              style={[
                tailwind.style('text-sm font-inter-normal-20 mt-0.5'),
                { color: colors.textSecondary },
              ]}
              numberOfLines={1}>
              {subtitle}
              {subtitle && providerName && ' \u2022 '}
              {providerName}
            </Animated.Text>
          )}

          {/* Appointment time chip (if available) */}
          {appointmentTime && (
            <View style={tailwind.style('flex-row mt-2')}>
              <View
                style={[
                  tailwind.style('flex-row items-center px-2 py-1 rounded-lg'),
                  { backgroundColor: colors.chip },
                ]}>
                <Animated.Text
                  style={[
                    tailwind.style('text-xs font-inter-medium-24'),
                    { color: colors.textSecondary },
                  ]}>
                  {appointmentTime}
                </Animated.Text>
              </View>
            </View>
          )}

          {/* Inline action buttons for doctor decisions */}
          {needsDoctorDecision && bookingUid && (
            <View style={tailwind.style('flex-row gap-2 mt-3')}>
              <ActionButton
                label={i18n.t('NOTIFICATION.DECISION.DECLINE_BUTTON', { defaultValue: 'Decline' })}
                variant="secondary"
                onPress={() => handleDoctorDecision('decline')}
                loading={actionLoading === 'decline'}
                disabled={actionLoading !== null}
                colors={colors}
                isDark={isDark}
              />
              <ActionButton
                label={i18n.t('NOTIFICATION.DECISION.CONFIRM_BUTTON', { defaultValue: 'Confirm' })}
                variant="primary"
                onPress={() => handleDoctorDecision('confirm')}
                loading={actionLoading === 'confirm'}
                disabled={actionLoading !== null}
                colors={colors}
                isDark={isDark}
              />
            </View>
          )}

          {/* Inline action buttons for provider assignment */}
          {needsProviderAssignment && availableProviders.length > 0 && (
            <View style={tailwind.style('flex-row flex-wrap gap-2 mt-3')}>
              {availableProviders.map(provider => (
                <ActionButton
                  key={provider.id}
                  label={`${i18n.t('NOTIFICATION.ASSIGN_BUTTON', { defaultValue: 'Assign' })} ${provider.name}`}
                  variant="primary"
                  onPress={() => handleProviderAssignment(provider.id, provider.name)}
                  loading={actionLoading === provider.id}
                  disabled={actionLoading !== null}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>
          )}

          {/* Action completed indicator */}
          {actionCompleted && (
            <View style={tailwind.style('flex-row items-center mt-2')}>
              <Animated.Text
                style={[tailwind.style('text-xs font-inter-medium-24'), { color: colors.accent }]}>
                ✓ {i18n.t('NOTIFICATION.ACTION_COMPLETED', { defaultValue: 'Done' })}
              </Animated.Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

InboxItemComponent.displayName = 'InboxItem';
export const InboxItem = React.memo(InboxItemComponent);
