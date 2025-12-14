import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { PriorityIndicator } from './PriorityIndicator';
import { ConversationPriority } from '@/types';

const meta = {
  title: 'PriorityIndicator',
  component: PriorityIndicator,
  args: {
    priority: 'medium',
  },
  argTypes: {
    priority: {
      control: { type: 'select' },
      options: ['urgent', 'high', 'medium', 'low', null],
    },
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof PriorityIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

// Urgent priority
export const Urgent: Story = {
  args: {
    priority: 'urgent',
  },
};

// High priority
export const High: Story = {
  args: {
    priority: 'high',
  },
};

// Medium priority
export const Medium: Story = {
  args: {
    priority: 'medium',
  },
};

// Low priority
export const Low: Story = {
  args: {
    priority: 'low',
  },
};

// No priority (null)
export const NoPriority: Story = {
  args: {
    priority: null as unknown as ConversationPriority,
  },
};

// All priorities showcase
export const AllPriorities: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PriorityIndicator priority="urgent" />
        <Text style={{ color: '#666' }}>Urgent</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PriorityIndicator priority="high" />
        <Text style={{ color: '#666' }}>High</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PriorityIndicator priority="medium" />
        <Text style={{ color: '#666' }}>Medium</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <PriorityIndicator priority="low" />
        <Text style={{ color: '#666' }}>Low</Text>
      </View>
    </View>
  ),
};

// In a list context
export const InListContext: Story = {
  render: () => (
    <View style={{ gap: 8, width: '100%' }}>
      {(['urgent', 'high', 'medium', 'low'] as const).map(priority => (
        <View
          key={priority}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#F5F5F5',
            borderRadius: 8,
            gap: 12,
          }}>
          <PriorityIndicator priority={priority} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500' }}>Conversation #{priority}</Text>
            <Text style={{ color: '#666', fontSize: 12 }}>Priority: {priority}</Text>
          </View>
        </View>
      ))}
    </View>
  ),
};
