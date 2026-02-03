import { saraApiService } from '@/services/SaraAPIService';
import type { NotificationResponse } from './notificationTypes';
import type { Notification, NotificationPayload } from '@/types/Notification';

// Sara API notification record (from /notifications endpoint)
interface SaraNotificationRecord {
  id: string;
  notif_ulid?: string;
  agent_id?: string;
  user_id?: string | null;
  type?: string | null;
  status?: string;
  channels?: string[];
  payload?: NotificationPayload;
  created_at?: string;
  read_at?: string | null;
  reservation_id?: string | null;
}

const hashStringToNumber = (value: string): number => {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const combined = 4294967296 * (h2 >>> 0) + (h1 >>> 0);
  return combined % Number.MAX_SAFE_INTEGER;
};

const toEpochSeconds = (value?: string | number | null): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    const ms = value > 1e12 ? value : value * 1000;
    return Math.floor(ms / 1000);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return Math.floor(parsed.getTime() / 1000);
};

const getStableNotificationId = (record: SaraNotificationRecord): number => {
  const rawId = record.id || record.notif_ulid || '';
  if (!rawId) {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
  if (/^\d+$/.test(rawId)) {
    return parseInt(rawId, 10);
  }
  return hashStringToNumber(rawId);
};

const coerceString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return undefined;
};

const coerceRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
};

const normalizeProviders = (
  value: unknown,
): NotificationPayload['available_providers'] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const providers = value
    .map(entry => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const id = coerceString((entry as { id?: unknown }).id);
      const name = coerceString((entry as { name?: unknown }).name);
      if (!id || !name) {
        return null;
      }
      return { id, name };
    })
    .filter(Boolean) as { id: string; name: string }[];
  return providers.length > 0 ? providers : undefined;
};

const getBookingData = (payload?: NotificationPayload): NotificationPayload['booking_data'] => {
  if (!payload) {
    return {};
  }
  const bookingData =
    coerceRecord(payload.booking_data) ||
    coerceRecord(payload.booking) ||
    coerceRecord(payload.appointment) ||
    coerceRecord(payload.reservation);
  return (bookingData ?? {}) as NotificationPayload['booking_data'];
};

const normalizeSaraPayload = (record: SaraNotificationRecord): NotificationPayload => {
  const rawPayload = (record.payload ?? {}) as NotificationPayload;
  const bookingData = getBookingData(rawPayload);

  const contactName = coerceString(rawPayload.contact_name);
  const customerName =
    coerceString(rawPayload.customer_name) ||
    coerceString(rawPayload.client_name) ||
    coerceString(bookingData.customer_name) ||
    coerceString(bookingData.client_name) ||
    coerceString(rawPayload.patient_name) ||
    contactName;

  const customerPhone =
    coerceString(rawPayload.customer_phone) ||
    coerceString(rawPayload.phone) ||
    coerceString(rawPayload.customer_id);

  const serviceName =
    coerceString(rawPayload.service_name) ||
    coerceString(rawPayload.service_label) ||
    coerceString(bookingData.service_name) ||
    coerceString(bookingData.service_label);

  const providerName =
    coerceString(rawPayload.provider_name) || coerceString(bookingData.provider_name);

  const rescheduleStart = coerceString(rawPayload.new_start_iso);
  const slotTime =
    coerceString(rawPayload.slot_time) ||
    coerceString(rawPayload.start_time) ||
    rescheduleStart ||
    coerceString(bookingData.start_time);

  const pendingBookingId =
    coerceString(rawPayload.pending_booking_id) ||
    coerceString((bookingData as { pending_booking_id?: unknown }).pending_booking_id);

  const availableProviders =
    normalizeProviders(rawPayload.available_providers) ||
    normalizeProviders((bookingData as { available_providers?: unknown }).available_providers);

  const appointmentStatus =
    coerceString(rawPayload.appointment_status) ||
    coerceString(rawPayload.status) ||
    coerceString(bookingData.status);

  const status = coerceString(rawPayload.status) || coerceString(bookingData.status);

  const agentDecisionAt =
    coerceString(rawPayload.agent_decision_at) ||
    coerceString(bookingData.agent_decision_at);

  const doctorDecisionAt =
    coerceString(rawPayload.doctor_decision_at) ||
    coerceString(bookingData.doctor_decision_at);

  const messageFallback =
    coerceString(rawPayload.message) ||
    coerceString(rawPayload.message_preview) ||
    coerceString(rawPayload.description) ||
    coerceString(rawPayload.reason) ||
    coerceString(rawPayload.summary) ||
    coerceString(rawPayload.last_user_text);

  return {
    ...rawPayload,
    booking_data: bookingData,
    customer_name: customerName ?? rawPayload.customer_name,
    client_name: coerceString(rawPayload.client_name) ?? coerceString(bookingData.client_name),
    patient_name: coerceString(rawPayload.patient_name) ?? customerName,
    contact_name: contactName ?? rawPayload.contact_name,
    customer_phone: customerPhone ?? rawPayload.customer_phone,
    service_name: serviceName ?? rawPayload.service_name,
    service_label:
      coerceString(rawPayload.service_label) ?? coerceString(bookingData.service_label),
    provider_name: providerName ?? rawPayload.provider_name,
    slot_time: slotTime ?? rawPayload.slot_time,
    start_time: coerceString(rawPayload.start_time) ?? slotTime,
    pending_booking_id: pendingBookingId ?? rawPayload.pending_booking_id,
    available_providers: availableProviders ?? rawPayload.available_providers,
    appointment_status: appointmentStatus ?? rawPayload.appointment_status,
    status: status ?? rawPayload.status,
    agent_decision_at: agentDecisionAt ?? rawPayload.agent_decision_at,
    doctor_decision_at: doctorDecisionAt ?? rawPayload.doctor_decision_at,
    message: messageFallback ?? rawPayload.message,
  };
};

// Generate notification title based on type and payload
function formatNotificationTitle(
  type: string | null | undefined,
  payload: SaraNotificationRecord['payload'],
): string {
  const bookingData = getBookingData(payload);
  const customerName =
    payload?.customer_name ||
    payload?.client_name ||
    bookingData?.customer_name ||
    bookingData?.client_name ||
    payload?.patient_name ||
    payload?.contact_name;
  const customerPhone = payload?.customer_phone || payload?.phone || payload?.customer_id;
  const subjectName = customerName || customerPhone || 'Paciente';
  const hasRealSubject = Boolean(customerName || customerPhone);
  const serviceName =
    payload?.service_name ||
    payload?.service_label ||
    bookingData?.service_name ||
    bookingData?.service_label ||
    'consulta';
  const daysSinceLastRaw = payload?.days_since_last;
  const daysSinceLast =
    typeof daysSinceLastRaw === 'number'
      ? daysSinceLastRaw
      : typeof daysSinceLastRaw === 'string'
        ? parseInt(daysSinceLastRaw, 10)
        : null;
  const reengagedSuffix =
    daysSinceLast && Number.isFinite(daysSinceLast) ? ` (${daysSinceLast}d)` : '';

  const titles: Record<string, string> = {
    'lead.new': `Novo lead: ${subjectName}`,
    'lead.reengaged': `Lead reengajado${reengagedSuffix}: ${subjectName}`,
    'lead.details_missing': `Lead com dados pendentes: ${subjectName}`,
    'conversation.handoff_requested': `Handoff solicitado: ${subjectName}`,
    'conversation.handoff_resolved': `Handoff resolvido: ${subjectName}`,
    'conversation.paused_expiring': `Pausa expirando: ${subjectName}`,
    'conversation.escalation_failed': `Falha no escalonamento: ${subjectName}`,
    'conversation.escalate_to_human': `Escalado para humano: ${subjectName}`,
    'conversation.first_message': `Novo contato: ${subjectName}`,
    'scheduling.link_created': `Link criado: ${subjectName}`,
    'scheduling.service_selected': `Serviço selecionado: ${subjectName}`,
    'scheduling.link_expired_without_booking': `Link expirado: ${subjectName}`,
    'doctor.decision_required': `Aprovação necessária: ${subjectName} - ${serviceName}`,
    'booking.confirmed': `Agendamento confirmado: ${subjectName} - ${serviceName}`,
    'booking.rescheduled': `Reagendamento: ${subjectName} - ${serviceName}`,
    'booking.cancelled_by_patient': `Cancelado pelo paciente: ${subjectName}`,
    'booking.cancelled_by_doctor': `Cancelado: ${subjectName}`,
    'booking.provider_assignment_required': `Atribuir profissional: ${subjectName}`,
    'booking.provider_assigned': `Profissional atribuído: ${subjectName}`,
    'booking.provider_assignment_expired': `Atribuição expirada: ${subjectName}`,
    'payment.awaiting': `Aguardando pagamento: ${subjectName} - ${serviceName}`,
  };

  if (type && titles[type]) {
    return titles[type];
  }

  // Fallback to payload title/message or generic
  if (payload?.title) return payload.title;
  if (payload?.message) return payload.message;
  if (payload?.description) return payload.description;
  if (payload?.message_preview) return payload.message_preview;
  if (payload?.summary) return payload.summary;
  if (payload?.last_user_text) return payload.last_user_text;
  if (hasRealSubject) return `Notificação: ${subjectName}`;
  return 'Notificação';
}

// Transform Sara notification to mobile app Notification type
function transformSaraNotification(record: SaraNotificationRecord): Notification {
  const payload = normalizeSaraPayload(record);
  const bookingData = payload.booking_data || {};
  const reservationId =
    record.reservation_id ||
    bookingData.reservation_id ||
    payload.pending_booking_id ||
    payload.reservation_id;

  // Convert to Unix seconds (not milliseconds) since formatRelativeTime uses fromUnixTime
  const createdAt =
    toEpochSeconds(record.created_at ?? (record as { createdAt?: string | number }).createdAt) ??
    Math.floor(Date.now() / 1000);

  return {
    id: getStableNotificationId(record),
    notifUlid: record.notif_ulid || record.id, // Preserve ULID for Sara API mark as read
    notificationType: (record.type || 'notification') as Notification['notificationType'],
    pushMessageTitle: formatNotificationTitle(record.type, payload),
    primaryActorType: 'Conversation',
    primaryActorId: reservationId ? parseInt(reservationId.replace(/\D/g, '')) || 0 : 0,
    primaryActor: {
      id: 0,
      priority: null,
      meta: { assignee: {} as Notification['user'], sender: {} as Notification['user'] },
      inboxId: 0,
      additionalAttributes: {},
      conversationId: 0,
    },
    readAt: record.read_at || '',
    user: {} as Notification['user'],
    snoozedUntil: '',
    createdAt,
    lastActivityAt: createdAt,
    meta: {},
    payload,
  };
}

export class SaraNotificationService {
  /**
   * Mark a notification as read via Sara API
   * @param notifUlid - The notification ULID
   */
  static async markAsRead(notifUlid: string): Promise<void> {
    await saraApiService.patch(`/notifications/${notifUlid}`, { status: 'read' });
  }

  /**
   * Mark all notifications as read via Sara API (fetch with visualized=true)
   */
  static async markAllAsRead(): Promise<void> {
    // The Sara API uses ?visualized=true to mark notifications as read on fetch
    // For bulk mark as read, we make a request with this parameter
    await saraApiService.get(
      '/notifications?visualized=true&range=[0,100]&filter={"status":"unread"}',
    );
  }

  static async getNotifications(
    page: number = 1,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<NotificationResponse> {
    // Calculate range for pagination (25 items per page)
    const perPage = 25;
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    const response = await saraApiService.get<SaraNotificationRecord[]>(
      `/notifications?sort=["created_at","${sortOrder.toUpperCase()}"]&range=[${start},${end}]&filter={}`,
    );

    const rawData = response.data as unknown;
    const records = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as { data?: SaraNotificationRecord[] })?.data)
        ? (rawData as { data: SaraNotificationRecord[] }).data
        : Array.isArray((rawData as { notifications?: SaraNotificationRecord[] })?.notifications)
          ? (rawData as { notifications: SaraNotificationRecord[] }).notifications
          : [];

    // Get total from Content-Range header if available
    const contentRange = response.headers?.['content-range'] || '';
    const totalMatch = contentRange.match(/\/(\d+)$/);
    const headerTotal =
      typeof response.headers?.['x-total-count'] === 'string'
        ? parseInt(response.headers['x-total-count'], 10)
        : null;
    const bodyTotal =
      typeof (rawData as { total?: number })?.total === 'number'
        ? (rawData as { total: number }).total
        : typeof (rawData as { count?: number })?.count === 'number'
          ? (rawData as { count: number }).count
          : null;
    const total =
      bodyTotal ??
      headerTotal ??
      (totalMatch ? parseInt(totalMatch[1], 10) : records.length);

    // Count unread
    const bodyUnread =
      typeof (rawData as { unread_count?: number })?.unread_count === 'number'
        ? (rawData as { unread_count: number }).unread_count
        : typeof (rawData as { unreadCount?: number })?.unreadCount === 'number'
          ? (rawData as { unreadCount: number }).unreadCount
          : null;
    const unreadCount =
      bodyUnread ?? records.filter(r => (r.status || '').toLowerCase() !== 'read').length;

    return {
      payload: records.map(transformSaraNotification),
      meta: {
        unreadCount,
        count: total,
        currentPage: String(page),
      },
    };
  }
}
