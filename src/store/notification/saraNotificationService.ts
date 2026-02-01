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
  payload?: {
    customer_name?: string;
    client_name?: string;
    patient_name?: string;
    service_name?: string;
    service_label?: string;
    provider_name?: string;
    slot_time?: string;
    booking_data?: {
      customer_name?: string;
      client_name?: string;
      service_name?: string;
      service_label?: string;
      provider_name?: string;
      start_time?: string;
      reservation_id?: string;
    };
    title?: string;
    message?: string;
  };
  created_at?: string;
  read_at?: string | null;
  reservation_id?: string | null;
}

// Generate notification title based on type and payload
function formatNotificationTitle(
  type: string | null | undefined,
  payload: SaraNotificationRecord['payload'],
): string {
  const bookingData = payload?.booking_data || {};
  const customerName =
    payload?.customer_name ||
    payload?.client_name ||
    bookingData?.customer_name ||
    bookingData?.client_name ||
    payload?.patient_name ||
    'Paciente';
  const serviceName =
    payload?.service_name ||
    payload?.service_label ||
    bookingData?.service_name ||
    bookingData?.service_label ||
    'consulta';

  const titles: Record<string, string> = {
    'doctor.decision_required': `Aprovação necessária: ${customerName} - ${serviceName}`,
    'booking.confirmed': `Agendamento confirmado: ${customerName} - ${serviceName}`,
    'booking.rescheduled': `Reagendamento: ${customerName} - ${serviceName}`,
    'booking.cancelled_by_patient': `Cancelado pelo paciente: ${customerName}`,
    'booking.cancelled_by_doctor': `Cancelado: ${customerName}`,
    'booking.provider_assignment_required': `Atribuir profissional: ${customerName}`,
    'booking.provider_assigned': `Profissional atribuído: ${customerName}`,
    'booking.provider_assignment_expired': `Atribuição expirada: ${customerName}`,
    'payment.awaiting': `Aguardando pagamento: ${customerName} - ${serviceName}`,
    'conversation.escalate_to_human': `Escalado para humano: ${customerName}`,
    'conversation.first_message': `Novo contato: ${customerName}`,
  };

  if (type && titles[type]) {
    return titles[type];
  }

  // Fallback to payload title/message or generic
  if (payload?.title) return payload.title;
  if (payload?.message) return payload.message;
  return `Notificação: ${customerName}`;
}

// Transform Sara notification to mobile app Notification type
function transformSaraNotification(record: SaraNotificationRecord): Notification {
  const bookingData = record.payload?.booking_data || {};

  const payload: NotificationPayload = {
    customer_name: record.payload?.customer_name || bookingData?.customer_name,
    patient_name:
      record.payload?.patient_name || record.payload?.customer_name || bookingData?.customer_name,
    service_name: record.payload?.service_name || bookingData?.service_name,
    service_label: record.payload?.service_label || bookingData?.service_label,
    provider_name: record.payload?.provider_name || bookingData?.provider_name,
    start_time: record.payload?.slot_time || bookingData?.start_time,
    slot_time: record.payload?.slot_time || bookingData?.start_time,
    booking_data: bookingData,
  };

  // Convert to Unix seconds (not milliseconds) since formatRelativeTime uses fromUnixTime
  const createdAt = record.created_at
    ? Math.floor(new Date(record.created_at).getTime() / 1000)
    : Math.floor(Date.now() / 1000);

  return {
    id:
      parseInt((record.id || record.notif_ulid || '').replace(/\D/g, '').slice(0, 10)) ||
      Date.now() + Math.random() * 1000,
    notifUlid: record.notif_ulid || record.id, // Preserve ULID for Sara API mark as read
    notificationType: (record.type || 'notification') as Notification['notificationType'],
    pushMessageTitle: formatNotificationTitle(record.type, record.payload),
    primaryActorType: 'Conversation',
    primaryActorId: record.reservation_id
      ? parseInt(record.reservation_id.replace(/\D/g, '')) || 0
      : 0,
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

    const records = Array.isArray(response.data) ? response.data : [];

    // Get total from Content-Range header if available
    const contentRange = response.headers?.['content-range'] || '';
    const totalMatch = contentRange.match(/\/(\d+)$/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : records.length;

    // Count unread
    const unreadCount = records.filter(r => (r.status || '').toLowerCase() !== 'read').length;

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
