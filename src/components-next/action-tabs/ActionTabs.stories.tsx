import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { ActionTabs } from './ActionTabs';
import conversationHeaderReducer from '@/store/conversation/conversationHeaderSlice';
import conversationActionReducer from '@/store/conversation/conversationActionSlice';
import { RefsProvider } from '@/context';

// Mock store for Storybook
const mockStore = configureStore({
  reducer: {
    conversationHeader: conversationHeaderReducer,
    conversationAction: conversationActionReducer,
  },
});

const meta = {
  title: 'ActionTabs',
  component: ActionTabs,
  decorators: [
    Story => (
      <Provider store={mockStore}>
        <RefsProvider>
          <View
            style={{
              flex: 1,
              backgroundColor: '#F5F5F5',
              justifyContent: 'flex-end',
              minHeight: 400,
            }}>
            <Story />
          </View>
        </RefsProvider>
      </Provider>
    ),
  ],
} satisfies Meta<typeof ActionTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default state - tabs visible when in Select mode
export const Default: Story = {};

// With description
export const WithDescription: Story = {
  render: () => (
    <View style={{ flex: 1, justifyContent: 'space-between', minHeight: 400 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          Action Tabs Example
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
          These tabs appear at the bottom of the screen when conversations are in Select mode.
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Available actions:</Text>
        <Text style={{ fontSize: 14, color: '#666', marginLeft: 16 }}>
          • Set Labels (tag icon)
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginLeft: 16 }}>
          • Assign Agent (user icon)
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginLeft: 16 }}>
          • Change Status (filter icon)
        </Text>
      </View>
      <ActionTabs />
    </View>
  ),
};

// In context of a conversation list
export const InConversationContext: Story = {
  render: () => (
    <View style={{ flex: 1, justifyContent: 'space-between', minHeight: 400 }}>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Conversations (3 selected)</Text>
        </View>
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={{
                padding: 16,
                backgroundColor: '#E8F5F4',
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 2,
                borderColor: '#4CB6AC',
              }}>
              <Text style={{ fontWeight: 'bold' }}>Conversation {i}</Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>Selected for bulk action</Text>
            </View>
          ))}
        </View>
      </View>
      <ActionTabs />
    </View>
  ),
};

// iOS style
export const IOSStyle: Story = {
  render: () => (
    <View style={{ flex: 1, justifyContent: 'flex-end', minHeight: 400 }}>
      <View style={{ padding: 16, marginBottom: 100 }}>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          On iOS, the tabs use a blurred background effect
        </Text>
      </View>
      <ActionTabs />
    </View>
  ),
};

// Android style
export const AndroidStyle: Story = {
  render: () => (
    <View style={{ flex: 1, justifyContent: 'flex-end', minHeight: 400 }}>
      <View style={{ padding: 16, marginBottom: 100 }}>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          On Android, the tabs use a solid white background with elevation
        </Text>
      </View>
      <ActionTabs />
    </View>
  ),
};
