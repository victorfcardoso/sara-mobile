export type NotificationType = 'handoff' | 'confirmation' | 'payment' | 'booking';

export type NotificationPriority = 'low' | 'medium' | 'high';

export type NotificationSummary = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  customerName: string;
};

export type NotificationRelatedAction = {
  id: string;
  label: string;
  timestamp: string;
};

export type NotificationContext = Record<string, unknown>;

export type NotificationDetail = NotificationSummary & {
  timestamp: string;
  customerPhone?: string;
  priority: NotificationPriority;
  context?: NotificationContext;
  relatedActions?: NotificationRelatedAction[];
};
