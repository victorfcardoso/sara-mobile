import { differenceInHours, format } from 'date-fns';

import I18n from '@/i18n';
import type { Appointment } from '@/store/appointments/appointmentsTypes';
import type { CrmCustomer } from '@/store/crm-customers/crmCustomersTypes';
import type { Conversation } from '@/types';

export const normalizePhone = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  const digits = value.replace(/[^0-9+]/g, '');
  return digits.length ? digits : null;
};

export const getContactDisplayName = (contact: CrmCustomer): string => {
  return contact.fullName || contact.whatsappPhone || I18n.t('CONTACTS.UNKNOWN_NAME');
};

export const formatPhoneForDisplay = (value?: string | null): string => {
  if (!value) {
    return I18n.t('CONTACTS.UNKNOWN_PHONE');
  }
  return value;
};

export const isTemplateRequired = (contact: CrmCustomer): boolean => {
  if (!contact.threadId) {
    return false;
  }
  if (!contact.latestSeen) {
    return true;
  }
  const lastSeen = new Date(contact.latestSeen);
  if (Number.isNaN(lastSeen.getTime())) {
    return false;
  }
  return differenceInHours(new Date(), lastSeen) >= 24;
};

export const toDateOrNull = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatUpcomingLabel = (appointment: Appointment): string => {
  if (!appointment.startAt) {
    return I18n.t('CONTACTS.UPCOMING_PLACEHOLDER');
  }
  const date = new Date(appointment.startAt);
  if (Number.isNaN(date.getTime())) {
    return I18n.t('CONTACTS.UPCOMING_PLACEHOLDER');
  }
  const timeLabel = format(date, 'HH:mm');
  const service = appointment.serviceName || I18n.t('CONTACTS.SERVICE_PLACEHOLDER');
  return `${timeLabel} • ${service}`;
};

export const buildAppointmentIndex = (appointments: Appointment[]): Map<string, Appointment> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const index = new Map<string, Appointment>();

  appointments.forEach(appointment => {
    if (!appointment.startAt) {
      return;
    }
    const date = new Date(appointment.startAt);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    if (date < startOfDay || date > endOfDay) {
      return;
    }
    const phone = normalizePhone(appointment.customerPhone);
    if (!phone) {
      return;
    }
    const existing = index.get(phone);
    if (!existing) {
      index.set(phone, appointment);
      return;
    }
    const existingDate = new Date(existing.startAt ?? '');
    if (Number.isNaN(existingDate.getTime()) || date < existingDate) {
      index.set(phone, appointment);
    }
  });

  return index;
};

export const buildConversationByPhoneMap = (
  conversations: Conversation[],
): Map<string, Conversation> => {
  const map = new Map<string, Conversation>();
  conversations.forEach(conversation => {
    const sender = conversation.meta?.sender;
    if (!sender) {
      return;
    }

    const customPhone =
      sender.customAttributes && typeof sender.customAttributes === 'object'
        ? normalizePhone((sender.customAttributes['phone_number'] as string) ?? null)
        : null;

    const candidates = [
      normalizePhone(sender.phoneNumber ?? null),
      normalizePhone((sender.identifier as string | null) ?? null),
      customPhone,
    ].filter(Boolean) as string[];

    candidates.forEach(candidate => {
      if (candidate && !map.has(candidate)) {
        map.set(candidate, conversation);
      }
    });
  });
  return map;
};
