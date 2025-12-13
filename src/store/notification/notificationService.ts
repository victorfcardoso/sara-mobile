import { apiService } from '@/services/APIService';
import type {
  NotificationResponse,
  MarkAsReadPayload,
  NotificationAPIResponse,
  InboxSortTypes,
} from './notificationTypes';
import { transformNotification, transformNotificationMeta } from '@/utils/camelCaseKeys';
import { SaraNotificationService } from './saraNotificationService';

export class NotificationService {
  static async getNotifications(
    page: number = 1,
    sort_order: InboxSortTypes,
  ): Promise<NotificationResponse> {
    // Fetch Sara notifications (includes all booking/payment/escalation types)
    try {
      return await SaraNotificationService.getNotifications(page, sort_order);
    } catch (error) {
      console.warn('[NotificationService] Sara API failed, falling back to Chatwoot:', error);
      // Fallback to Chatwoot notifications if Sara API fails
      const response = await apiService.get<NotificationAPIResponse>(
        `notifications?sort_order=${sort_order}&includes[]=snoozed&includes[]=read&page=${page}`,
      );
      const { payload, meta } = response.data.data;
      return {
        payload: payload.map(transformNotification),
        meta: transformNotificationMeta(meta),
      };
    }
  }

  static async markAllAsRead(): Promise<void> {
    await apiService.post(`notifications/read_all`);
  }

  static async markAsRead(payload: MarkAsReadPayload): Promise<void> {
    await apiService.post(`notifications/read_all`, {
      primary_actor_id: payload.primaryActorId,
      primary_actor_type: payload.primaryActorType,
    });
  }

  static async markAsUnread(notificationId: number): Promise<void> {
    await apiService.post(`notifications/${notificationId}/unread`);
  }

  static async delete(notificationId: number): Promise<void> {
    await apiService.delete(`notifications/${notificationId}`);
  }
}
