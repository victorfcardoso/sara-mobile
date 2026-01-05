import { NotificationPriority, NotificationType } from './types';

export type NotificationColors = {
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  muted: string;
  iconNavy: string;
  accent: string;
  contextRowBackground: string;
};

export const COLORS_LIGHT: NotificationColors = {
  background: '#F8F5F3',
  card: '#FFFFFF',
  border: '#E6E0D7',
  textPrimary: '#16273D',
  textSecondary: '#566273',
  muted: '#8D95A6',
  iconNavy: '#16273D',
  accent: '#4CB6AC',
  contextRowBackground: '#F3EEE7',
};

export const COLORS_DARK: NotificationColors = {
  background: '#1A1A1A',
  card: '#2D2D2D',
  border: '#3D3D3D',
  textPrimary: '#F5F5F5',
  textSecondary: '#B8C4CE',
  muted: '#8899A6',
  iconNavy: '#F5F5F5',
  accent: '#4CB6AC',
  contextRowBackground: '#2A2A2A',
};

// Legacy export for compatibility - use getNotificationColors() instead
export const COLORS = COLORS_LIGHT;

export const getNotificationColors = (isDark: boolean): NotificationColors =>
  isDark ? COLORS_DARK : COLORS_LIGHT;

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
