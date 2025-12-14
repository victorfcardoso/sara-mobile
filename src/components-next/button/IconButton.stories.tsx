import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';

const meta = {
  title: 'IconButton',
  component: IconButton,
  args: {
    text: 'Call',
    handlePress: () => console.log('IconButton pressed'),
    variant: 'primary',
    isDestructive: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          gap: 16,
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// Primary variant
export const Primary: Story = {
  args: {
    text: 'Call Now',
    variant: 'primary',
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    text: 'Call Now',
    variant: 'secondary',
  },
};

// Destructive primary
export const DestructivePrimary: Story = {
  args: {
    text: 'End Call',
    variant: 'primary',
    isDestructive: true,
  },
};

// Destructive secondary
export const DestructiveSecondary: Story = {
  args: {
    text: 'Cancel Call',
    variant: 'secondary',
    isDestructive: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    text: 'Call',
    variant: 'primary',
    disabled: true,
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Primary:</Text>
        <IconButton text="Call Now" variant="primary" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Secondary:</Text>
        <IconButton text="Call Now" variant="secondary" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>
          Destructive Primary:
        </Text>
        <IconButton text="End Call" variant="primary" isDestructive />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>
          Destructive Secondary:
        </Text>
        <IconButton text="Cancel Call" variant="secondary" isDestructive />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Disabled:</Text>
        <IconButton text="Call" variant="primary" disabled />
      </View>
    </View>
  ),
};
