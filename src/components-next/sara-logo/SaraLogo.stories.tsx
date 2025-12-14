import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { SaraLogo } from './SaraLogo';
import { tailwind } from '@/theme';

const meta = {
  title: 'SaraLogo',
  component: SaraLogo,
  args: {
    size: 32,
    variant: 'mark',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['mark', 'wordmark'],
    },
    size: {
      control: { type: 'number', min: 16, max: 128, step: 8 },
    },
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          gap: 16,
          backgroundColor: tailwind.color('sara-background'),
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SaraLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default mark (small)
export const Mark: Story = {
  args: {
    variant: 'mark',
    size: 32,
  },
};

// Large mark
export const LargeMark: Story = {
  args: {
    variant: 'mark',
    size: 64,
  },
};

// Extra large mark
export const ExtraLargeMark: Story = {
  args: {
    variant: 'mark',
    size: 96,
  },
};

// Wordmark (default size)
export const Wordmark: Story = {
  args: {
    variant: 'wordmark',
    size: 40,
  },
};

// Large wordmark
export const LargeWordmark: Story = {
  args: {
    variant: 'wordmark',
    size: 64,
  },
};

// Custom colors
export const CustomColors: Story = {
  args: {
    variant: 'wordmark',
    size: 48,
    color: '#FF6B6B',
    textColor: '#2C3E50',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 32 }}>
      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Mark - Small (32px):
        </Text>
        <SaraLogo variant="mark" size={32} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Mark - Medium (48px):
        </Text>
        <SaraLogo variant="mark" size={48} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Mark - Large (64px):
        </Text>
        <SaraLogo variant="mark" size={64} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Wordmark - Small (32px):
        </Text>
        <SaraLogo variant="wordmark" size={32} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Wordmark - Medium (48px):
        </Text>
        <SaraLogo variant="wordmark" size={48} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Wordmark - Large (64px):
        </Text>
        <SaraLogo variant="wordmark" size={64} />
      </View>
    </View>
  ),
};

// Login screen example
export const LoginScreenExample: Story = {
  render: () => (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingVertical: 40,
      }}>
      <SaraLogo variant="wordmark" size={56} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: tailwind.color('sara-text-primary'),
          textAlign: 'center',
        }}>
        Welcome to Sara
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: tailwind.color('sara-text-secondary'),
          textAlign: 'center',
          maxWidth: 280,
        }}>
        Your AI-powered assistant for managing patient conversations
      </Text>
    </View>
  ),
};

// App header example
export const AppHeaderExample: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        backgroundColor: tailwind.color('sara-background-light'),
        borderBottomWidth: 1,
        borderBottomColor: tailwind.color('sara-border'),
      }}>
      <SaraLogo variant="mark" size={40} />
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: tailwind.color('sara-text-primary'),
        }}>
        Sara
      </Text>
    </View>
  ),
};

// Color variations
export const ColorVariations: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Default Sara Colors:
        </Text>
        <SaraLogo variant="wordmark" size={48} />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Custom Red/Dark:
        </Text>
        <SaraLogo variant="wordmark" size={48} color="#E74C3C" textColor="#2C3E50" />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Custom Purple/Dark:
        </Text>
        <SaraLogo variant="wordmark" size={48} color="#9B59B6" textColor="#34495E" />
      </View>

      <View>
        <Text style={{ marginBottom: 12, fontWeight: 'bold', color: '#666' }}>
          Custom Blue/Navy:
        </Text>
        <SaraLogo variant="wordmark" size={48} color="#3498DB" textColor="#16273D" />
      </View>
    </View>
  ),
};
