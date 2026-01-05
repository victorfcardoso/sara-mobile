import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { NativeText } from './NText';

const meta = {
  title: 'Native Components/NText',
  component: NativeText,
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: '#F8F5F3',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof NativeText>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default native text
export const Default: Story = {
  render: () => <NativeText>This is native text component</NativeText>,
};

// Basic text rendering
export const BasicText: Story = {
  render: () => (
    <View>
      <NativeText>Hello, World!</NativeText>
    </View>
  ),
};

// Different font sizes
export const FontSizes: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText style={{ fontSize: 12 }}>Small text (12px)</NativeText>
      <NativeText style={{ fontSize: 14 }}>Regular text (14px)</NativeText>
      <NativeText style={{ fontSize: 16 }}>Medium text (16px)</NativeText>
      <NativeText style={{ fontSize: 20 }}>Large text (20px)</NativeText>
      <NativeText style={{ fontSize: 24 }}>Extra large text (24px)</NativeText>
    </View>
  ),
};

// Font weights
export const FontWeights: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText style={{ fontWeight: '300' }}>Light (300)</NativeText>
      <NativeText style={{ fontWeight: '400' }}>Regular (400)</NativeText>
      <NativeText style={{ fontWeight: '500' }}>Medium (500)</NativeText>
      <NativeText style={{ fontWeight: '600' }}>Semibold (600)</NativeText>
      <NativeText style={{ fontWeight: '700' }}>Bold (700)</NativeText>
    </View>
  ),
};

// Color variations
export const ColorVariations: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText style={{ color: '#16273D' }}>Primary text color</NativeText>
      <NativeText style={{ color: '#4B5D6E' }}>Secondary text color</NativeText>
      <NativeText style={{ color: '#6C778A' }}>Meta text color</NativeText>
      <NativeText style={{ color: '#4CB6AC' }}>Accent color</NativeText>
      <NativeText style={{ color: '#EF4444' }}>Error color</NativeText>
      <NativeText style={{ color: '#10B981' }}>Success color</NativeText>
    </View>
  ),
};

// Text alignment
export const TextAlignment: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText style={{ textAlign: 'left' }}>Left aligned text</NativeText>
      <NativeText style={{ textAlign: 'center' }}>Center aligned text</NativeText>
      <NativeText style={{ textAlign: 'right' }}>Right aligned text</NativeText>
    </View>
  ),
};

// Text decoration
export const TextDecoration: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText>Normal text</NativeText>
      <NativeText style={{ textDecorationLine: 'underline' }}>Underlined text</NativeText>
      <NativeText style={{ textDecorationLine: 'line-through' }}>Strikethrough text</NativeText>
      <NativeText style={{ fontStyle: 'italic' }}>Italic text</NativeText>
    </View>
  ),
};

// Multi-line text
export const MultiLineText: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NativeText>
        This is a longer paragraph of text that will wrap across multiple lines. It demonstrates how
        the native text component handles multi-line content and text wrapping behavior.
      </NativeText>
      <NativeText numberOfLines={2}>
        This text has a numberOfLines prop set to 2, so it will be truncated after two lines with an
        ellipsis. This is useful for preview text or when you want to limit the height of text
        content.
      </NativeText>
    </View>
  ),
};

// Combined styles
export const CombinedStyles: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NativeText
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#16273D',
          textAlign: 'center',
        }}>
        Heading Text
      </NativeText>
      <NativeText
        style={{
          fontSize: 14,
          color: '#4B5D6E',
          lineHeight: 20,
        }}>
        This is body text with custom line height. It demonstrates how multiple style properties can
        be combined to create different text appearances.
      </NativeText>
      <NativeText
        style={{
          fontSize: 12,
          color: '#6C778A',
          fontStyle: 'italic',
        }}>
        Caption or metadata text
      </NativeText>
    </View>
  ),
};

// With background
export const WithBackground: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeText
        style={{
          backgroundColor: '#E6F5F4',
          color: '#4CB6AC',
          padding: 8,
          borderRadius: 4,
        }}>
        Text with background
      </NativeText>
      <NativeText
        style={{
          backgroundColor: '#16273D',
          color: '#FFFFFF',
          padding: 12,
          borderRadius: 8,
          fontWeight: '600',
        }}>
        Dark background text
      </NativeText>
    </View>
  ),
};

// Info about NText
export const Info: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>About NativeText</Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        NativeText is a direct reference to React Native's native text component. It provides
        low-level access to the text rendering system.
      </Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        This component is typically used when you need direct access to the native text component,
        such as when creating custom animated text components or when you need specific performance
        optimizations.
      </Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        For most use cases, the standard React Native Text component is recommended.
      </Text>
      <View style={{ marginTop: 8, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#92400E' }}>
          Note: This is a low-level component wrapper around React Native's TextNativeComponent
        </Text>
      </View>
    </View>
  ),
};
