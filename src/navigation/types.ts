/**
 * Navigation Types for Sara Mobile
 *
 * This file consolidates all navigation types to ensure type safety
 * and consistency across the app. Route names are aligned with CRM patterns
 * where applicable.
 *
 * CRM Route Mapping:
 * | CRM Route          | Mobile Route          | Tab/Stack          |
 * |--------------------|-----------------------|--------------------|
 * | /                  | Dashboard             | -                  |
 * | /threads           | Conversations         | ConversationStack  |
 * | /threads/:id       | ChatScreen            | Root Stack         |
 * | /appointments      | Appointments          | AppointmentsStack  |
 * | /notifications     | Notifications         | NotificationsStack |
 * | /customers         | Contacts              | ContactsStack      |
 * | /customers/:id     | ContactDetailsScreen  | ContactsStack      |
 * | /office-hours      | OfficeHoursScreen     | SettingsStack      |
 * | /agents/:id/faq    | FaqScreen             | SettingsStack      |
 * | /services          | ServiceCatalogScreen  | SettingsStack      |
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// ============================================================================
// Auth Stack Routes
// ============================================================================
export type AuthStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  ConfigureURL: undefined;
  MFAScreen: undefined;
};

// ============================================================================
// Tab-level Stack Routes
// ============================================================================

export type ConversationStackParamList = {
  ConversationScreen: undefined;
};

export type NotificationsStackParamList = {
  NotificationsScreen: undefined;
  NotificationDetail: { notificationId: number };
};

export type AppointmentsStackParamList = {
  AppointmentsScreen: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type ContactsStackParamList = {
  ContactsScreen: undefined;
  ContactDetailsScreen: { contactId: string };
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
  OfficeHoursScreen: undefined;
  AgentProfileScreen: undefined;
  ServiceCatalogScreen: undefined;
  FaqScreen: undefined;
  FaqEditorScreen: { faqId?: string } | undefined;
};

// ============================================================================
// Tab Navigator Routes
// ============================================================================
export type TabParamList = {
  Conversations: NavigatorScreenParams<ConversationStackParamList>;
  Notifications: NavigatorScreenParams<NotificationsStackParamList>;
  Contacts: NavigatorScreenParams<ContactsStackParamList>;
  Appointments: NavigatorScreenParams<AppointmentsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

// ============================================================================
// Root Stack Routes (screens outside tab bar)
// ============================================================================
export type RootStackParamList = {
  Tab: NavigatorScreenParams<TabParamList>;
  ChatScreen: {
    conversationId: number;
    primaryActorId?: number;
    primaryActorType?: string;
  };
  ContactDetails: { conversationId: number };
  Dashboard: { url: string };
};

// ============================================================================
// Deep Link Route Names
// Routes available via deep links (sara://...)
// ============================================================================
export const DEEP_LINK_ROUTES = {
  // Tab routes
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  APPOINTMENTS: 'appointments',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',

  // Detail routes
  CONVERSATION: 'conversation', // sara://conversation/:id
  NOTIFICATION: 'notification', // sara://notification/:id
  APPOINTMENT: 'appointment', // sara://appointment/:id
  CONTACT: 'contact', // sara://contact/:id

  // Settings sub-routes
  OFFICE_HOURS: 'office-hours', // sara://office-hours
  FAQ: 'faq', // sara://faq
  SERVICES: 'services', // sara://services
} as const;

// ============================================================================
// Screen Names (for navigation.navigate calls)
// ============================================================================
export const SCREEN_NAMES = {
  // Auth
  LOGIN: 'Login',
  RESET_PASSWORD: 'ResetPassword',
  CONFIGURE_URL: 'ConfigureURL',
  MFA: 'MFAScreen',

  // Tabs
  CONVERSATIONS_TAB: 'Conversations',
  NOTIFICATIONS_TAB: 'Notifications',
  APPOINTMENTS_TAB: 'Appointments',
  CONTACTS_TAB: 'Contacts',
  SETTINGS_TAB: 'Settings',

  // Conversation Stack
  CONVERSATION_LIST: 'ConversationScreen',

  // Notifications Stack
  NOTIFICATIONS_LIST: 'NotificationsScreen',
  NOTIFICATION_DETAIL: 'NotificationDetail',

  // Appointments Stack
  APPOINTMENTS_LIST: 'AppointmentsScreen',
  APPOINTMENT_DETAIL: 'AppointmentDetail',

  // Contacts Stack
  CONTACTS_LIST: 'ContactsScreen',
  CONTACT_DETAILS: 'ContactDetailsScreen',

  // Settings Stack
  SETTINGS_MAIN: 'SettingsScreen',
  OFFICE_HOURS: 'OfficeHoursScreen',
  AGENT_PROFILE: 'AgentProfileScreen',
  SERVICE_CATALOG: 'ServiceCatalogScreen',
  FAQ: 'FaqScreen',
  FAQ_EDITOR: 'FaqEditorScreen',

  // Root Stack (outside tabs)
  TAB: 'Tab',
  CHAT: 'ChatScreen',
  CONTACT_FROM_CHAT: 'ContactDetails',
  DASHBOARD: 'Dashboard',
} as const;

// Type for screen names
export type ScreenName = (typeof SCREEN_NAMES)[keyof typeof SCREEN_NAMES];
