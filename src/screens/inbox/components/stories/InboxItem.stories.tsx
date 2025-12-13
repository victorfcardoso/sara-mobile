import { Meta } from '@storybook/react';
import { InboxItem } from '../InboxItem';
import { ScrollView, View, Text } from 'react-native';
import { tailwind } from '@/theme';
import { NotificationType } from '@/types/Notification';

const meta: Meta<typeof InboxItem> = {
  title: 'Inbox Item',
  component: InboxItem,
  argTypes: {
    isRead: {
      control: 'boolean',
      defaultValue: false,
    },
    notificationType: {
      control: 'select',
      options: [
        'conversation_creation',
        'conversation_assignment',
        'assigned_conversation_new_message',
        'conversation_mention',
        'booking.confirmed',
        'booking.rescheduled',
        'booking.cancelled_by_patient',
        'payment.awaiting',
        'doctor.decision_required',
      ],
      defaultValue: 'conversation_creation',
    },
  },
};

export default meta;

const baseInboxItem = {
  lastActivityAt: () => '2h ago',
  pushMessageTitle: 'This is a sample notification message',
  notificationType: 'conversation_creation' as NotificationType,
  isRead: false,
};

const Title = ({ title }: { title: string }) => (
  <View style={tailwind.style('flex items-center justify-center py-2')}>
    <Text style={tailwind.style('text-md font-medium italic text-gray-800')}>{title}</Text>
  </View>
);

export const Basic = {
  args: {
    ...baseInboxItem,
    isRead: false,
  },
};

export const AllVariants = {
  render: () => (
    <ScrollView contentContainerStyle={tailwind.style('flex flex-col gap-2 bg-gray-50 py-4')}>
      <Title title="Unread - New Message" />
      <InboxItem
        isRead={false}
        notificationType="assigned_conversation_new_message"
        pushMessageTitle="New message from customer"
        lastActivityAt={() => '2m ago'}
      />

      <Title title="Read - New Message" />
      <InboxItem
        isRead={true}
        notificationType="assigned_conversation_new_message"
        pushMessageTitle="New message from customer"
        lastActivityAt={() => '1h ago'}
      />

      <Title title="Booking Confirmed (Sara)" />
      <InboxItem
        isRead={false}
        notificationType="booking.confirmed"
        pushMessageTitle="Booking confirmed"
        lastActivityAt={() => '5m ago'}
        payload={{
          customer_name: 'Sarah Johnson',
          service_name: 'Initial Consultation',
          provider_name: 'Dr. Smith',
          slot_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        }}
      />

      <Title title="Booking Rescheduled (Sara)" />
      <InboxItem
        isRead={false}
        notificationType="booking.rescheduled"
        pushMessageTitle="Booking rescheduled"
        lastActivityAt={() => '10m ago'}
        payload={{
          customer_name: 'Mike Chen',
          service_name: 'Follow-up Visit',
          provider_name: 'Dr. Williams',
          slot_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        }}
      />

      <Title title="Booking Cancelled" />
      <InboxItem
        isRead={false}
        notificationType="booking.cancelled_by_patient"
        pushMessageTitle="Booking cancelled by patient"
        lastActivityAt={() => '15m ago'}
        payload={{
          customer_name: 'Emily Davis',
          service_name: 'Annual Checkup',
        }}
      />

      <Title title="Awaiting Payment" />
      <InboxItem
        isRead={false}
        notificationType="payment.awaiting"
        pushMessageTitle="Payment pending"
        lastActivityAt={() => '30m ago'}
        payload={{
          customer_name: 'James Wilson',
          service_name: 'Lab Tests',
        }}
      />

      <Title title="Decision Required" />
      <InboxItem
        isRead={false}
        notificationType="doctor.decision_required"
        pushMessageTitle="Decision required for booking"
        lastActivityAt={() => '45m ago'}
        payload={{
          customer_name: 'Anna Brown',
          service_name: 'Specialist Referral',
        }}
      />

      <Title title="Conversation Assignment" />
      <InboxItem
        isRead={false}
        notificationType="conversation_assignment"
        pushMessageTitle="Conversation assigned to you"
        lastActivityAt={() => '1h ago'}
      />

      <Title title="Mention" />
      <InboxItem
        isRead={false}
        notificationType="conversation_mention"
        pushMessageTitle="You were mentioned in a conversation"
        lastActivityAt={() => '2h ago'}
      />

      <Title title="SLA Missed" />
      <InboxItem
        isRead={false}
        notificationType="sla_missed_first_response"
        pushMessageTitle="SLA missed for first response"
        lastActivityAt={() => '3h ago'}
      />

      <Title title="Escalated" />
      <InboxItem
        isRead={false}
        notificationType="conversation.escalate_to_human"
        pushMessageTitle="Conversation escalated to human"
        lastActivityAt={() => 'Yesterday'}
        payload={{
          customer_name: 'Robert Lee',
        }}
      />
    </ScrollView>
  ),
};
