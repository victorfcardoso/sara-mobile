import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { AvailabilityStatusList } from './AvailabilityStatusList';
import { tailwind } from '@/theme';

const meta = {
  title: 'Sheet Components/AvailabilityStatusList',
  component: AvailabilityStatusList,
  args: {
    availabilityStatus: 'online',
    changeAvailabilityStatus: (status: string) => console.log('Status changed to:', status),
  },
  decorators: [
    Story => (
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
    ),
  ],
} satisfies Meta<typeof AvailabilityStatusList>;

export default meta;

type Story = StoryObj<typeof meta>;

// Online status selected
export const Online: Story = {
  args: {
    availabilityStatus: 'online',
  },
};

// Busy status selected
export const Busy: Story = {
  args: {
    availabilityStatus: 'busy',
  },
};

// Offline status selected
export const Offline: Story = {
  args: {
    availabilityStatus: 'offline',
  },
};

// Interactive example
export const InteractiveExample: Story = {
  render: () => {
    const [status, setStatus] = React.useState('online');

    return (
      <View>
        <View style={{ padding: 16, gap: 8 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: tailwind.color('sara-text-primary'),
            }}>
            Set Availability
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: tailwind.color('sara-text-secondary'),
            }}>
            Current status:{' '}
            <Text style={{ fontWeight: '600', textTransform: 'capitalize' }}>{status}</Text>
          </Text>
        </View>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderTopWidth: 1,
            borderTopColor: tailwind.color('sara-border'),
          }}>
          <AvailabilityStatusList availabilityStatus={status} changeAvailabilityStatus={setStatus} />
        </View>
      </View>
    );
  },
};

// Sheet modal example
export const SheetModalExample: Story = {
  render: () => (
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
            Change Availability
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: tailwind.color('sara-text-secondary'),
              marginTop: 4,
            }}>
            Let your team know your current status
          </Text>
        </View>
        <AvailabilityStatusList
          availabilityStatus="online"
          changeAvailabilityStatus={() => {}}
        />
      </View>
    </View>
  ),
};

// Settings screen example with status indicator
export const SettingsScreenExample: Story = {
  render: () => {
    const [status, setStatus] = React.useState('busy');

    const getStatusColor = (currentStatus: string) => {
      switch (currentStatus) {
        case 'online':
          return '#44ce4b';
        case 'busy':
          return '#ffc532';
        case 'offline':
          return '#779bbb';
        default:
          return '#779bbb';
      }
    };

    return (
      <View style={{ flex: 1, backgroundColor: tailwind.color('sara-background') }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: tailwind.color('sara-text-primary'),
            }}>
            Profile Settings
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: getStatusColor(status),
              }}
            />
            <Text
              style={{
                fontSize: 16,
                color: tailwind.color('sara-text-secondary'),
                textTransform: 'capitalize',
              }}>
              {status}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: tailwind.color('sara-border'),
            marginTop: 8,
          }}>
          <View style={{ padding: 16, paddingBottom: 8 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: tailwind.color('sara-text-primary'),
              }}>
              Availability Status
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: tailwind.color('sara-text-secondary'),
                marginTop: 4,
              }}>
              Choose your current availability
            </Text>
          </View>
          <AvailabilityStatusList
            availabilityStatus={status}
            changeAvailabilityStatus={setStatus}
          />
        </View>
      </View>
    );
  },
};

// All status states showcase
export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 32 }}>
      <View>
        <Text
          style={{
            marginBottom: 12,
            fontWeight: 'bold',
            color: '#666',
            fontSize: 16,
          }}>
          Online Selected:
        </Text>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: tailwind.color('sara-border'),
            overflow: 'hidden',
          }}>
          <AvailabilityStatusList
            availabilityStatus="online"
            changeAvailabilityStatus={() => {}}
          />
        </View>
      </View>

      <View>
        <Text
          style={{
            marginBottom: 12,
            fontWeight: 'bold',
            color: '#666',
            fontSize: 16,
          }}>
          Busy Selected:
        </Text>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: tailwind.color('sara-border'),
            overflow: 'hidden',
          }}>
          <AvailabilityStatusList
            availabilityStatus="busy"
            changeAvailabilityStatus={() => {}}
          />
        </View>
      </View>

      <View>
        <Text
          style={{
            marginBottom: 12,
            fontWeight: 'bold',
            color: '#666',
            fontSize: 16,
          }}>
          Offline Selected:
        </Text>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: tailwind.color('sara-border'),
            overflow: 'hidden',
          }}>
          <AvailabilityStatusList
            availabilityStatus="offline"
            changeAvailabilityStatus={() => {}}
          />
        </View>
      </View>
    </View>
  ),
};
