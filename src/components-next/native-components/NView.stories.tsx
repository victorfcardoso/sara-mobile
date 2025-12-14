import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { NativeView } from './NView';

const meta = {
  title: 'Native Components/NView',
  component: NativeView,
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
} satisfies Meta<typeof NativeView>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default native view
export const Default: Story = {
  render: () => (
    <NativeView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8 }}>
      <Text>This is a native view component</Text>
    </NativeView>
  ),
};

// Basic container
export const BasicContainer: Story = {
  render: () => (
    <NativeView style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
      <Text>Content inside NativeView</Text>
    </NativeView>
  ),
};

// Different background colors
export const BackgroundColors: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <NativeView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8 }}>
        <Text>White background</Text>
      </NativeView>
      <NativeView style={{ padding: 16, backgroundColor: '#F8F5F3', borderRadius: 8 }}>
        <Text>Sara background</Text>
      </NativeView>
      <NativeView style={{ padding: 16, backgroundColor: '#E6F5F4', borderRadius: 8 }}>
        <Text>Accent light background</Text>
      </NativeView>
      <NativeView style={{ padding: 16, backgroundColor: '#4CB6AC', borderRadius: 8 }}>
        <Text style={{ color: '#FFFFFF' }}>Accent background</Text>
      </NativeView>
    </View>
  ),
};

// Layout variations
export const LayoutVariations: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Flex Row:</Text>
      <NativeView
        style={{
          flexDirection: 'row',
          gap: 8,
          padding: 12,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
        }}>
        <View style={{ flex: 1, backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 1</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 2</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 3</Text>
        </View>
      </NativeView>

      <Text style={{ fontWeight: 'bold', marginBottom: 4, marginTop: 8 }}>Flex Column:</Text>
      <NativeView
        style={{
          flexDirection: 'column',
          gap: 8,
          padding: 12,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
        }}>
        <View style={{ backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 1</Text>
        </View>
        <View style={{ backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 2</Text>
        </View>
        <View style={{ backgroundColor: '#E6F5F4', padding: 8, borderRadius: 4 }}>
          <Text style={{ fontSize: 12 }}>Item 3</Text>
        </View>
      </NativeView>
    </View>
  ),
};

// Border and shadow styles
export const BorderAndShadow: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NativeView
        style={{
          padding: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E6E2DD',
        }}>
        <Text>With border</Text>
      </NativeView>

      <NativeView
        style={{
          padding: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <Text>With shadow</Text>
      </NativeView>

      <NativeView
        style={{
          padding: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#4CB6AC',
        }}>
        <Text>With accent border</Text>
      </NativeView>
    </View>
  ),
};

// Padding and margin variations
export const SpacingVariations: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NativeView style={{ padding: 8, backgroundColor: '#FFFFFF', borderRadius: 8 }}>
        <Text>Small padding (8px)</Text>
      </NativeView>
      <NativeView style={{ padding: 16, backgroundColor: '#FFFFFF', borderRadius: 8 }}>
        <Text>Medium padding (16px)</Text>
      </NativeView>
      <NativeView style={{ padding: 24, backgroundColor: '#FFFFFF', borderRadius: 8 }}>
        <Text>Large padding (24px)</Text>
      </NativeView>
      <NativeView
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
        }}>
        <Text>Custom padding (vertical: 8, horizontal: 16)</Text>
      </NativeView>
    </View>
  ),
};

// Nested views
export const NestedViews: Story = {
  render: () => (
    <NativeView
      style={{
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 12 }}>Card Container</Text>
      <NativeView
        style={{
          padding: 12,
          backgroundColor: '#F8F5F3',
          borderRadius: 8,
          marginBottom: 8,
        }}>
        <Text>Nested view 1</Text>
      </NativeView>
      <NativeView
        style={{
          padding: 12,
          backgroundColor: '#F8F5F3',
          borderRadius: 8,
        }}>
        <Text>Nested view 2</Text>
      </NativeView>
    </NativeView>
  ),
};

// Card-style layouts
export const CardLayouts: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <NativeView
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          overflow: 'hidden',
        }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#E6E2DD' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Card Header</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text>Card content goes here</Text>
        </View>
      </NativeView>

      <NativeView
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E6E2DD',
          overflow: 'hidden',
        }}>
        <View style={{ padding: 12, backgroundColor: '#F8F5F3' }}>
          <Text style={{ fontSize: 12, color: '#6C778A' }}>Label</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '600' }}>Value</Text>
        </View>
      </NativeView>
    </View>
  ),
};

// Absolute positioning
export const AbsolutePositioning: Story = {
  render: () => (
    <NativeView
      style={{
        height: 200,
        backgroundColor: '#F8F5F3',
        borderRadius: 12,
        position: 'relative',
      }}>
      <NativeView
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          padding: 8,
          backgroundColor: '#4CB6AC',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Top Left</Text>
      </NativeView>
      <NativeView
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: 8,
          backgroundColor: '#4CB6AC',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Top Right</Text>
      </NativeView>
      <NativeView
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          padding: 8,
          backgroundColor: '#4CB6AC',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Bottom Left</Text>
      </NativeView>
      <NativeView
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: 8,
          backgroundColor: '#4CB6AC',
          borderRadius: 8,
        }}>
        <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Bottom Right</Text>
      </NativeView>
    </NativeView>
  ),
};

// Info about NView
export const Info: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>About NativeView</Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        NativeView is a direct reference to React Native's native view component. It provides
        low-level access to the view rendering system.
      </Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        This component is typically used when you need direct access to the native view component,
        such as when creating custom animated views or when you need specific performance
        optimizations.
      </Text>
      <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
        For most use cases, the standard React Native View component is recommended.
      </Text>
      <View style={{ marginTop: 8, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#92400E' }}>
          Note: This is a low-level component wrapper around React Native's ViewNativeComponent. It
          also exports an AnimatedNativeView variant for use with Reanimated.
        </Text>
      </View>
    </View>
  ),
};
