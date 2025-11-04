import { NotificationPriority, NotificationType } from './types';

export const COLORS = {
  background: '#F8F5F3',
  card: '#FFFFFF',
  border: '#E6E0D7',
  textPrimary: '#16273D',
  textSecondary: '#566273',
  muted: '#8D95A6',
  iconNavy: '#16273D',
  accent: '#4CB6AC',
};

export const TYPE_STYLES: Record<
  NotificationType,
  { badgeBackground: string; badgeText: string; iconColor: string }
> = {
  handoff: {
    badgeBackground: '#FDEED7',
    badgeText: '#8A5A2E',
    iconColor: '#8A5A2E',
  },
  confirmation: {
    badgeBackground: '#CCE6DE',
    badgeText: '#0F4D49',
    iconColor: '#0F4D49',
  },
  payment: {
    badgeBackground: '#FFE6E0',
    badgeText: '#9F4E2F',
    iconColor: '#9F4E2F',
  },
  booking: {
    badgeBackground: '#E4EDFC',
    badgeText: '#2A4E96',
    iconColor: '#2A4E96',
  },
};

export const PRIORITY_STYLES: Record<
  NotificationPriority,
  { label: string; backgroundColor: string; textColor: string }
> = {
  high: {
    label: 'High priority',
    backgroundColor: '#FFE0DB',
    textColor: '#8F2D1E',
  },
  medium: {
    label: 'Medium priority',
    backgroundColor: '#FFF4DB',
    textColor: '#8A5A2E',
  },
  low: {
    label: 'Low priority',
    backgroundColor: '#E6F2EE',
    textColor: '#1F5B52',
  },
};
