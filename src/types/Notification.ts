import { ConversationPriority } from './common';
import type { User } from './User';
import type { ConversationAdditionalAttributes } from './Conversation';
export type NotificationType =
  // Conversation types (Chatwoot)
  | 'sla_missed_next_response'
  | 'sla_missed_first_response'
  | 'sla_missed_resolution'
  | 'conversation_creation'
  | 'conversation_assignment'
  | 'assigned_conversation_new_message'
  | 'conversation_mention'
  | 'participating_conversation_new_message'
  // Booking types (Sara)
  | 'booking.confirmed'
  | 'booking.rescheduled'
  | 'booking.cancelled_by_patient'
  | 'booking.cancelled_by_doctor'
  | 'booking.no_show_flagged'
  | 'booking.followup_due'
  | 'booking.provider_assignment_required'
  | 'booking.provider_assigned'
  | 'booking.provider_assignment_expired'
  // Payment types
  | 'payment.awaiting'
  | 'payment.completed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.chargeback_alert'
  // Doctor workflow types
  | 'doctor.decision_required'
  | 'doctor.decision_submitted'
  | 'doctor.decision_timeout'
  // Conversation escalation types
  | 'conversation.escalate_to_human'
  | 'conversation.first_message'
  | 'conversation.handoff_requested';

export type PrimaryActorType = 'Conversation' | 'Message';

export type NotificationPayload = {
  customer_name?: string;
  client_name?: string;
  patient_name?: string;
  service_name?: string;
  service_label?: string;
  provider_name?: string;
  slot_time?: string;
  start_time?: string;
  title?: string;
  message?: string;
  pending_booking_id?: string;
  available_providers?: { id: string; name: string }[];
  // Status fields for decision checking
  appointment_status?: string;
  status?: string;
  agent_decision_at?: string;
  doctor_decision_at?: string;
  booking_data?: {
    customer_name?: string;
    client_name?: string;
    service_name?: string;
    service_label?: string;
    provider_name?: string;
    start_time?: string;
    reservation_id?: string;
    ea_appointment_id?: string;
    uid?: string;
    status?: string;
    agent_decision_at?: string;
    doctor_decision_at?: string;
  };
};

export type Notification = {
  id: number;
  notifUlid?: string; // Sara API notification ULID (for mark as read)
  notificationType: NotificationType;
  pushMessageTitle: string;
  primaryActorType: PrimaryActorType;
  primaryActorId: number;
  primaryActor: PrimaryActor;
  readAt: string;
  user: User;
  snoozedUntil: string;
  createdAt: number;
  lastActivityAt: number;
  meta: object;
  payload?: NotificationPayload;
};

export type PrimaryActor = {
  id: number;
  priority?: ConversationPriority | null;
  meta: {
    assignee: User;
    sender: User;
  };
  inboxId: number;
  additionalAttributes: ConversationAdditionalAttributes;
  conversationId: number;
};

export interface NotificationMeta {
  unreadCount: number;
  count: number;
  currentPage: string;
}
