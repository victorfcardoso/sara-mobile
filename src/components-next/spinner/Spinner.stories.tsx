import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner';

const meta = {
  title: 'Spinner',
  component: Spinner,
  args: {
    size: 32,
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
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default spinner
export const Default: Story = {
  args: {
    size: 32,
  },
};

// Small spinner
export const Small: Story = {
  args: {
    size: 16,
  },
};

// Medium spinner
export const Medium: Story = {
  args: {
    size: 32,
  },
};

// Large spinner
export const Large: Story = {
  args: {
    size: 48,
  },
};

// Extra large spinner
export const ExtraLarge: Story = {
  args: {
    size: 64,
  },
};

// Custom stroke color
export const CustomColor: Story = {
  args: {
    size: 32,
    stroke: '#4CB6AC', // sara-accent color
  },
};

// Blue stroke
export const BlueSpinner: Story = {
  args: {
    size: 32,
    stroke: '#3B82F6',
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 24, alignItems: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={16} />
        <Text style={{ marginTop: 8, color: '#666' }}>16px</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={24} />
        <Text style={{ marginTop: 8, color: '#666' }}>24px</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={32} />
        <Text style={{ marginTop: 8, color: '#666' }}>32px</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={48} />
        <Text style={{ marginTop: 8, color: '#666' }}>48px</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={64} />
        <Text style={{ marginTop: 8, color: '#666' }}>64px</Text>
      </View>
    </View>
  ),
};

// Color variations
export const ColorVariations: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 24, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={32} />
        <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Default</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={32} stroke="#4CB6AC" />
        <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Teal</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={32} stroke="#3B82F6" />
        <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Blue</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Spinner size={32} stroke="#EF4444" />
        <Text style={{ marginTop: 8, color: '#666', fontSize: 12 }}>Red</Text>
      </View>
    </View>
  ),
};

// With background context
export const OnDarkBackground: Story = {
  render: () => (
    <View
      style={{
        backgroundColor: '#1F2937',
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
      }}>
      <Spinner size={32} stroke="#FFFFFF" />
      <Text style={{ marginTop: 12, color: '#FFFFFF' }}>Loading...</Text>
    </View>
  ),
};
