import React from 'react';
import Svg, { Path, Circle, Rect, G, Mask } from 'react-native-svg';
import { tailwind } from '@/theme';
import Animated from 'react-native-reanimated';
import { NotificationType } from '@/types/Notification';

// Brand colors matching DESIGN_GUIDELINES.md
export const BRAND_COLORS = {
  teal: '#6AB4B6',
  navy: '#16273D',
  mint: '#CCE6DE',
  warning: '#F6A609',
  error: '#D84356',
  blue: '#3E63DD',
};

// Icon components for notification types
const ConfirmedIcon = ({ color = BRAND_COLORS.teal }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M13.3334 4L6.00002 11.3333L2.66669 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RescheduledIcon = ({ color = BRAND_COLORS.warning }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M1.33331 8C1.33331 11.6819 4.31808 14.6667 7.99998 14.6667C11.6819 14.6667 14.6666 11.6819 14.6666 8C14.6666 4.3181 11.6819 1.33333 7.99998 1.33333"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M7.99998 4V8L10.6666 9.33333"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1.33331 4L4 1.33333M1.33331 4L4 6.66667M1.33331 4H5.33331"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CancelledIcon = ({ color = BRAND_COLORS.error }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <Path
      d="M10.5 5.5L5.5 10.5M5.5 5.5L10.5 10.5"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const AssignIcon = ({ color = BRAND_COLORS.navy }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="6" cy="4.66667" r="2.66667" stroke={color} strokeWidth="1.5" />
    <Path
      d="M1.33331 13.3333C1.33331 11.1242 3.12418 9.33333 5.33331 9.33333H6.66665"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="11.3333" cy="10.6667" r="3.33333" stroke={color} strokeWidth="1.5" />
    <Path
      d="M11.3333 9V12.3333M9.66665 10.6667H13"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const PaymentIcon = ({ color = BRAND_COLORS.warning }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Rect
      x="1.33331"
      y="3.33333"
      width="13.3333"
      height="9.33333"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path d="M1.33331 6.66667H14.6666" stroke={color} strokeWidth="1.5" />
    <Path d="M4 10H6.66667" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const EscalateIcon = ({ color = BRAND_COLORS.warning }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="6" r="2.66667" stroke={color} strokeWidth="1.5" />
    <Path
      d="M3.33331 14C3.33331 11.4227 5.42265 9.33333 7.99998 9.33333C10.5773 9.33333 12.6666 11.4227 12.6666 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M12 2L14 4L12 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MessageIcon = ({ color = BRAND_COLORS.teal }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M14 10C14 10.3536 13.8595 10.6928 13.6095 10.9428C13.3594 11.1929 13.0203 11.3333 12.6667 11.3333H4.66667L2 14V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H12.6667C13.0203 2 13.3594 2.14048 13.6095 2.39052C13.8595 2.64057 14 2.97971 14 3.33333V10Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DecisionIcon = ({ color = BRAND_COLORS.navy }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <Path
      d="M8 5.33333V8L9.66667 9.66667"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8" cy="8" r="1" fill={color} />
  </Svg>
);

const DefaultIcon = ({ color = BRAND_COLORS.teal }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <Path d="M8 5.33333V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="8" cy="10.6667" r="0.66667" fill={color} />
  </Svg>
);

const MentionIcon = ({ color = BRAND_COLORS.blue }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
    <Path
      d="M8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667C8.73638 10.6667 9.33333 10.0697 9.33333 9.33333V6.66667"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Circle cx="8" cy="8" r="1.33333" stroke={color} strokeWidth="1.2" />
  </Svg>
);

const SLAIcon = ({ color = BRAND_COLORS.error }: { color?: string }) => (
  <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
      stroke={color}
      strokeWidth="1.5"
    />
    <Path d="M8 5.33333V8.66667" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Circle cx="8" cy="10.6667" r="0.66667" fill={color} />
  </Svg>
);

// Type configuration mapping
export interface NotificationTypeConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  hexColor: string; // For accent bar
}

export const getNotificationTypeConfig = (
  type: NotificationType | string,
): NotificationTypeConfig => {
  const typeConfigs: Record<string, NotificationTypeConfig> = {
    // Booking types (Sara)
    'booking.confirmed': {
      label: 'Confirmed',
      icon: <ConfirmedIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    'booking.rescheduled': {
      label: 'Rescheduled',
      icon: <RescheduledIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    'booking.cancelled_by_patient': {
      label: 'Cancelled',
      icon: <CancelledIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    'booking.cancelled_by_doctor': {
      label: 'Cancelled',
      icon: <CancelledIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    'booking.no_show_flagged': {
      label: 'No Show',
      icon: <CancelledIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    'booking.followup_due': {
      label: 'Follow-up Due',
      icon: <RescheduledIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    'booking.provider_assignment_required': {
      label: 'Assign Provider',
      icon: <AssignIcon color={BRAND_COLORS.navy} />,
      color: 'slate-950',
      bgColor: 'gray-100',
      hexColor: BRAND_COLORS.navy,
    },
    'booking.provider_assigned': {
      label: 'Provider Assigned',
      icon: <AssignIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    'booking.provider_assignment_expired': {
      label: 'Expired',
      icon: <CancelledIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    // Payment types
    'payment.awaiting': {
      label: 'Awaiting Payment',
      icon: <PaymentIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    'payment.completed': {
      label: 'Payment Complete',
      icon: <PaymentIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    'payment.failed': {
      label: 'Payment Failed',
      icon: <PaymentIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    'payment.refunded': {
      label: 'Refunded',
      icon: <PaymentIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    'payment.chargeback_alert': {
      label: 'Chargeback',
      icon: <PaymentIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    // Doctor workflow types
    'doctor.decision_required': {
      label: 'Needs Decision',
      icon: <DecisionIcon color={BRAND_COLORS.navy} />,
      color: 'slate-950',
      bgColor: 'gray-100',
      hexColor: BRAND_COLORS.navy,
    },
    'doctor.decision_submitted': {
      label: 'Decision Made',
      icon: <ConfirmedIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    'doctor.decision_timeout': {
      label: 'Decision Timeout',
      icon: <DecisionIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    // Conversation escalation types
    'conversation.escalate_to_human': {
      label: 'Escalated',
      icon: <EscalateIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    'conversation.first_message': {
      label: 'New Contact',
      icon: <MessageIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    'conversation.handoff_requested': {
      label: 'Handoff',
      icon: <EscalateIcon color={BRAND_COLORS.warning} />,
      color: 'amber-700',
      bgColor: 'amber-100',
      hexColor: BRAND_COLORS.warning,
    },
    // Chatwoot conversation types
    conversation_assignment: {
      label: 'Assigned',
      icon: <AssignIcon color={BRAND_COLORS.navy} />,
      color: 'slate-950',
      bgColor: 'gray-100',
      hexColor: BRAND_COLORS.navy,
    },
    conversation_mention: {
      label: 'Mentioned',
      icon: <MentionIcon color={BRAND_COLORS.blue} />,
      color: 'blue-700',
      bgColor: 'blue-100',
      hexColor: BRAND_COLORS.blue,
    },
    assigned_conversation_new_message: {
      label: 'New Message',
      icon: <MessageIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    participating_conversation_new_message: {
      label: 'New Message',
      icon: <MessageIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    conversation_creation: {
      label: 'New Conversation',
      icon: <MessageIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    },
    // SLA types
    sla_missed_first_response: {
      label: 'SLA Missed',
      icon: <SLAIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    sla_missed_next_response: {
      label: 'SLA Missed',
      icon: <SLAIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
    sla_missed_resolution: {
      label: 'SLA Missed',
      icon: <SLAIcon color={BRAND_COLORS.error} />,
      color: 'ruby-700',
      bgColor: 'ruby-100',
      hexColor: BRAND_COLORS.error,
    },
  };

  return (
    typeConfigs[type] || {
      label: 'Notification',
      icon: <DefaultIcon color={BRAND_COLORS.teal} />,
      color: 'teal-700',
      bgColor: 'teal-100',
      hexColor: BRAND_COLORS.teal,
    }
  );
};

type NotificationTypeIndicatorProps = {
  type: NotificationType | string;
  showLabel?: boolean;
};

export const NotificationTypeIndicator = ({
  type,
  showLabel = false,
}: NotificationTypeIndicatorProps) => {
  const config = getNotificationTypeConfig(type);

  if (showLabel) {
    return (
      <Animated.View
        style={tailwind.style(
          'flex-row items-center gap-1 px-2 py-1 rounded-lg',
          `bg-${config.bgColor}`,
        )}>
        <Animated.View style={tailwind.style('w-4 h-4')}>{config.icon}</Animated.View>
        <Animated.Text
          style={tailwind.style(
            'text-xs font-inter-medium-24 uppercase tracking-wide',
            `text-${config.color}`,
          )}>
          {config.label}
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={tailwind.style(
        'w-8 h-8 rounded-lg items-center justify-center',
        `bg-${config.bgColor}`,
      )}>
      {config.icon}
    </Animated.View>
  );
};
