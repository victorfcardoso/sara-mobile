import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Since NoNetworkBar depends on NetInfo which is hard to mock in Storybook,
// we create a presentational version that shows the offline state
const NoNetworkBarPreview = ({ isOffline = true }: { isOffline?: boolean }) => {
  if (!isOffline) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>Network connected - bar is hidden</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#7f1d1d' }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center', fontSize: 14 }}>
          You are offline! Please check your internet connection
        </Text>
      </View>
    </View>
  );
};

const meta = {
  title: 'NoNetwork',
  component: NoNetworkBarPreview,
  args: {
    isOffline: true,
  },
  decorators: [
    Story => (
      <SafeAreaProvider>
        <View style={{ flex: 1 }}>
          <Story />
        </View>
      </SafeAreaProvider>
    ),
  ],
} satisfies Meta<typeof NoNetworkBarPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

// Shows the offline state (red bar with message)
export const OfflineState: Story = {
  args: {
    isOffline: true,
  },
};

// Shows what happens when network is connected (bar is hidden)
export const OnlineState: Story = {
  args: {
    isOffline: false,
  },
};

// Demo showing both states
export const BothStates: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View>
        <Text style={{ padding: 8, fontWeight: 'bold' }}>Offline State:</Text>
        <NoNetworkBarPreview isOffline={true} />
      </View>
      <View>
        <Text style={{ padding: 8, fontWeight: 'bold' }}>Online State:</Text>
        <NoNetworkBarPreview isOffline={false} />
      </View>
    </View>
  ),
};
