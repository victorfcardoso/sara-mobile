import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NotificationPreferences } from './NotificationPreferences';
import { tailwind } from '@/theme';

// Mock Redux store for stories
const createMockStore = (
  allPushFlags: string[] = [
    'push_conversation_creation',
    'push_conversation_assignment',
    'push_assigned_conversation_new_message',
    'push_conversation_mention',
    'push_participating_conversation_new_message',
    'push_sla_missed_first_response',
    'push_sla_missed_next_response',
    'push_sla_missed_resolution',
  ],
  selectedPushFlags: string[] = [
    'push_conversation_creation',
    'push_conversation_assignment',
    'push_assigned_conversation_new_message',
  ],
  selectedEmailFlags: string[] = [],
) => {
  return configureStore({
    reducer: {
      settings: (
        state = {
          notificationSettings: {
            all_push_flags: allPushFlags,
            selected_push_flags: selectedPushFlags,
            selected_email_flags: selectedEmailFlags,
          },
        },
      ) => state,
    },
  });
};

const meta = {
  title: 'Sheet Components/NotificationPreferences',
  component: NotificationPreferences,
  decorators: [
    (Story, context) => {
      const store = context.args.store || createMockStore();
      return (
        <Provider store={store}>
          <View
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: tailwind.color('sara-background'),
            }}>
            <View
              style={{
                backgroundColor: tailwind.color('sara-background-light'),
                borderRadius: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: tailwind.color('sara-border'),
              }}>
              <Story />
            </View>
          </View>
        </Provider>
      );
    },
  ],
} satisfies Meta<typeof NotificationPreferences>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default state with some notifications enabled
export const Default: Story = {
  args: {
    store: createMockStore(),
  },
};

// All notifications enabled
export const AllEnabled: Story = {
  args: {
    store: createMockStore(
      [
        'push_conversation_creation',
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
        'push_conversation_mention',
        'push_participating_conversation_new_message',
        'push_sla_missed_first_response',
        'push_sla_missed_next_response',
        'push_sla_missed_resolution',
      ],
      [
        'push_conversation_creation',
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
        'push_conversation_mention',
        'push_participating_conversation_new_message',
        'push_sla_missed_first_response',
        'push_sla_missed_next_response',
        'push_sla_missed_resolution',
      ],
    ),
  },
};

// All notifications disabled
export const AllDisabled: Story = {
  args: {
    store: createMockStore(
      [
        'push_conversation_creation',
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
        'push_conversation_mention',
        'push_participating_conversation_new_message',
        'push_sla_missed_first_response',
        'push_sla_missed_next_response',
        'push_sla_missed_resolution',
      ],
      [],
    ),
  },
};

// Only critical notifications enabled
export const CriticalOnly: Story = {
  args: {
    store: createMockStore(
      [
        'push_conversation_creation',
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
        'push_conversation_mention',
        'push_participating_conversation_new_message',
        'push_sla_missed_first_response',
        'push_sla_missed_next_response',
        'push_sla_missed_resolution',
      ],
      [
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
        'push_sla_missed_first_response',
      ],
    ),
  },
};

// Few notification types (minimal setup)
export const MinimalSetup: Story = {
  args: {
    store: createMockStore(
      [
        'push_conversation_creation',
        'push_conversation_assignment',
        'push_assigned_conversation_new_message',
      ],
      ['push_conversation_creation'],
    ),
  },
};

// Sheet modal example
export const SheetModalExample: Story = {
  render: () => {
    const store = createMockStore();
    return (
      <Provider store={store}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: tailwind.color('sara-background-light'),
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingBottom: 32,
            }}>
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: tailwind.color('sara-border'),
              }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: tailwind.color('sara-border'),
                  borderRadius: 2,
                }}
              />
            </View>
            <View style={{ padding: 16, paddingBottom: 8 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: tailwind.color('sara-text-primary'),
                }}>
                Notification Preferences
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: tailwind.color('sara-text-secondary'),
                  marginTop: 4,
                }}>
                Choose which notifications you want to receive
              </Text>
            </View>
            <NotificationPreferences />
          </View>
        </View>
      </Provider>
    );
  },
};

// Settings screen example
export const SettingsScreenExample: Story = {
  render: () => {
    const store = createMockStore();
    return (
      <Provider store={store}>
        <View style={{ flex: 1, backgroundColor: tailwind.color('sara-background') }}>
          <View style={{ padding: 16, gap: 8 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: tailwind.color('sara-text-primary'),
              }}>
              Settings
            </Text>
          </View>
          <View
            style={{
              backgroundColor: tailwind.color('sara-background-light'),
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: tailwind.color('sara-border'),
            }}>
            <View style={{ padding: 16, paddingBottom: 8 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: tailwind.color('sara-text-primary'),
                }}>
                Push Notifications
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: tailwind.color('sara-text-secondary'),
                  marginTop: 4,
                }}>
                Manage which push notifications you receive
              </Text>
            </View>
            <NotificationPreferences />
          </View>
        </View>
      </Provider>
    );
  },
};
