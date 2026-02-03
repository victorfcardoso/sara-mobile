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
  // Lead lifecycle (Sara)
  | 'lead.new'
  | 'lead.reengaged'
  | 'lead.details_missing'
  // Conversation escalation types (Sara)
  | 'conversation.escalate_to_human'
  | 'conversation.first_message'
  | 'conversation.handoff_requested'
  | 'conversation.handoff_resolved'
  | 'conversation.paused_expiring'
  | 'conversation.escalation_failed'
  // Scheduling intent & link hygiene (Sara)
  | 'scheduling.link_created'
  | 'scheduling.service_selected'
  | 'scheduling.link_expired_without_booking'
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
  // EasyAppointments health
  | 'ea.webhook_retry_exhausted'
  | 'ea.provider_unassigned'
  | 'ea.slot_sync_failed'
  // Channel health
  | 'channel.meta_policy_violation'
  | 'channel.chatwoot_credentials_invalid'
  | 'channel.chatwoot_inbox_disconnected'
  // Automation/tool safety
  | 'tool.inline_faq_fallback_triggered'
  | 'tool.agentbot_tool_error'
  // Configuration + platform
  | 'config.agent_preferences_changed'
  | 'config.service_catalog_missing_defaults'
  | 'deployment.feature_flag_switched'
  | 'system.lambda_throttling'
  | 'system.notification_delivery_retry';

export type PrimaryActorType = 'Conversation' | 'Message';

type NotificationBookingData = {
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
  pending_booking_id?: string;
  available_providers?: { id: string; name: string }[];
};

export type NotificationPayload = {
  customer_name?: string;
  client_name?: string;
  patient_name?: string;
  customer_phone?: string;
  phone?: string;
  customer_id?: string;
  contact_name?: string;
  service_name?: string;
  service_label?: string;
  provider_name?: string;
  slot_time?: string;
  start_time?: string;
  previous_start_iso?: string;
  new_start_iso?: string;
  title?: string;
  message?: string;
  description?: string;
  reason?: string;
  message_preview?: string;
  summary?: string;
  last_user_text?: string;
  price_cents?: number;
  amount_cents?: number;
  payment_link?: string;
  timeout_minutes?: number;
  days_since_last?: number | string;
  date_ymd?: string;
  appointment_id?: string;
  conversation_id?: string;
  cw_conversation_id?: string;
  assignee_id?: string;
  previous_assignee_id?: string;
  source_id?: string;
  source?: string;
  inbox_id?: string;
  reservation_id?: string;
  pending_booking_id?: string;
  available_providers?: { id: string; name: string }[];
  // Status fields for decision checking
  appointment_status?: string;
  status?: string;
  agent_decision_at?: string;
  doctor_decision_at?: string;
  booking_data?: NotificationBookingData;
  booking?: NotificationBookingData;
  appointment?: NotificationBookingData;
  reservation?: NotificationBookingData;
} & Record<string, unknown>;

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
