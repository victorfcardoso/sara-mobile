import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/theme';
import type { NotificationType, NotificationPayload } from '@/types/Notification';
import { getNotificationTypeConfig } from './NotificationTypeIndicator';

const SARA_COLORS = {
  primaryText: '#16273D',
  secondaryText: '#4B5D6E',
  metaText: '#6C778A',
  divider: '#E6E2DD',
  cardBorder: '#E6E2DD',
  cardBorderUnread: '#D1CCC6',
  background: '#FFFFFF',
  chipBackground: '#F5F3F0',
};

type InboxItemProps = {
  isRead: boolean;
  notificationType: NotificationType | string;
  pushMessageTitle: string;
  lastActivityAt: () => string;
  payload?: NotificationPayload;
};

// Extract meaningful summary from payload (similar to web CRM)
const getPayloadSummary = (
  payload?: NotificationPayload,
  pushMessageTitle?: string
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
    payload.service_name || payload.service_label || bookingData.service_name || bookingData.service_label;

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

export const InboxItemComponent = (props: InboxItemProps) => {
  const { isRead, notificationType, pushMessageTitle, lastActivityAt, payload } = props;

  const config = getNotificationTypeConfig(notificationType);
  const { title, subtitle, providerName, appointmentTime } = getPayloadSummary(payload, pushMessageTitle);

  return (
    <View style={tailwind.style('mx-3 my-1.5')}>
      <View
        style={[
          tailwind.style('rounded-2xl overflow-hidden flex-row'),
          styles.card,
          !isRead && styles.cardUnread,
        ]}>
        {/* Left accent bar */}
        <View
          style={[
            tailwind.style('w-1'),
            {
              backgroundColor: isRead
                ? tailwind.color(`${config.color}`) + '40' // 25% opacity when read
                : tailwind.color(`${config.color}`),
            },
          ]}
        />

        {/* Card content */}
        <View style={tailwind.style('flex-1 p-3')}>
          {/* Header: Icon + Type + Dot + Time */}
          <View style={tailwind.style('flex-row items-center mb-2')}>
            {/* Icon container */}
            <View
              style={tailwind.style('w-8 h-8 rounded-lg items-center justify-center mr-2', `bg-${config.bgColor}`)}>
              {config.icon}
            </View>

            {/* Type label */}
            <Animated.Text
              style={tailwind.style(
                'text-xs font-inter-medium-24 uppercase tracking-wide',
                `text-${config.color}`
              )}>
              {config.label}
            </Animated.Text>

            {/* Spacer */}
            <View style={tailwind.style('flex-1')} />

            {/* Unread dot */}
            {!isRead && <View style={tailwind.style('w-2 h-2 rounded-full mr-2', `bg-${config.color}`)} />}

            {/* Time */}
            <Animated.Text style={[tailwind.style('text-xs font-inter-normal-20'), styles.metaText]}>
              {lastActivityAt()}
            </Animated.Text>
          </View>

          {/* Main content: Title + Subtitle + Provider */}
          <Animated.Text
            style={[tailwind.style('text-base font-inter-semibold-20 leading-tight'), styles.primaryText]}
            numberOfLines={1}>
            {title}
          </Animated.Text>

          {(subtitle || providerName) && (
            <Animated.Text
              style={[tailwind.style('text-sm font-inter-normal-20 mt-0.5'), styles.secondaryText]}
              numberOfLines={1}>
              {subtitle}
              {subtitle && providerName && ' \u2022 '}
              {providerName}
            </Animated.Text>
          )}

          {/* Appointment time chip (if available) */}
          {appointmentTime && (
            <View style={tailwind.style('flex-row mt-2')}>
              <View style={[tailwind.style('flex-row items-center px-2 py-1 rounded-lg'), styles.chip]}>
                <Animated.Text style={[tailwind.style('text-xs font-inter-medium-24'), styles.chipText]}>
                  {appointmentTime}
                </Animated.Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

InboxItemComponent.displayName = 'InboxItem';
export const InboxItem = React.memo(InboxItemComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: SARA_COLORS.background,
    borderWidth: 1,
    borderColor: SARA_COLORS.cardBorder,
  },
  cardUnread: {
    borderColor: SARA_COLORS.cardBorderUnread,
  },
  primaryText: {
    color: SARA_COLORS.primaryText,
  },
  secondaryText: {
    color: SARA_COLORS.secondaryText,
  },
  metaText: {
    color: SARA_COLORS.metaText,
  },
  chip: {
    backgroundColor: SARA_COLORS.chipBackground,
  },
  chipText: {
    color: SARA_COLORS.secondaryText,
  },
});
