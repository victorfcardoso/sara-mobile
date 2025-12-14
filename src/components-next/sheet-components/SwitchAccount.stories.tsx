import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { SwitchAccount } from './SwitchAccount';
import { Account } from '@/types';
import { tailwind } from '@/theme';

// Mock accounts for stories
const mockAccounts: Account[] = [
  {
    id: 1,
    name: 'Dr. Maria Silva',
    role: 'administrator',
    availability: 'online',
    availability_status: 'online',
    status: 'active',
    active_at: '2025-12-14T10:00:00Z',
    auto_offline: false,
    permissions: ['admin'],
  },
  {
    id: 2,
    name: 'Dr. João Santos',
    role: 'agent',
    availability: 'busy',
    availability_status: 'busy',
    status: 'active',
    active_at: '2025-12-14T09:30:00Z',
    auto_offline: false,
    permissions: ['agent'],
  },
  {
    id: 3,
    name: 'Clínica São Paulo',
    role: 'administrator',
    availability: 'offline',
    availability_status: 'offline',
    status: 'active',
    active_at: '2025-12-13T18:00:00Z',
    auto_offline: true,
    permissions: ['admin'],
  },
];

const meta = {
  title: 'Sheet Components/SwitchAccount',
  component: SwitchAccount,
  args: {
    accounts: mockAccounts,
    currentAccountId: 1,
    changeAccount: (accountId: number) => console.log('Switching to account:', accountId),
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
} satisfies Meta<typeof SwitchAccount>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default state with first account selected
export const Default: Story = {
  args: {
    accounts: mockAccounts,
    currentAccountId: 1,
  },
};

// Second account selected
export const SecondAccountSelected: Story = {
  args: {
    accounts: mockAccounts,
    currentAccountId: 2,
  },
};

// Third account selected
export const ThirdAccountSelected: Story = {
  args: {
    accounts: mockAccounts,
    currentAccountId: 3,
  },
};

// Single account (no switching needed)
export const SingleAccount: Story = {
  args: {
    accounts: [mockAccounts[0]],
    currentAccountId: 1,
  },
};

// Two accounts
export const TwoAccounts: Story = {
  args: {
    accounts: mockAccounts.slice(0, 2),
    currentAccountId: 1,
  },
};

// Many accounts
export const ManyAccounts: Story = {
  args: {
    accounts: [
      ...mockAccounts,
      {
        id: 4,
        name: 'Clínica Rio de Janeiro',
        role: 'administrator',
        availability: 'online',
        availability_status: 'online',
        status: 'active',
        active_at: '2025-12-14T10:15:00Z',
        auto_offline: false,
        permissions: ['admin'],
      },
      {
        id: 5,
        name: 'Dr. Ana Costa',
        role: 'agent',
        availability: 'busy',
        availability_status: 'busy',
        status: 'active',
        active_at: '2025-12-14T09:45:00Z',
        auto_offline: false,
        permissions: ['agent'],
      },
      {
        id: 6,
        name: 'Dr. Carlos Mendes',
        role: 'agent',
        availability: 'online',
        availability_status: 'online',
        status: 'active',
        active_at: '2025-12-14T08:30:00Z',
        auto_offline: false,
        permissions: ['agent'],
      },
    ],
    currentAccountId: 4,
  },
};

// No selection (edge case)
export const NoSelection: Story = {
  args: {
    accounts: mockAccounts,
    currentAccountId: undefined,
  },
};

// Interactive example
export const InteractiveExample: Story = {
  render: () => {
    const [selectedId, setSelectedId] = React.useState<number | undefined>(1);

    return (
      <View>
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: tailwind.color('sara-text-primary') }}>
            Switch Account
          </Text>
          <Text style={{ fontSize: 14, color: tailwind.color('sara-text-secondary') }}>
            Current account ID: {selectedId ?? 'None'}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: tailwind.color('sara-background-light'),
            borderTopWidth: 1,
            borderTopColor: tailwind.color('sara-border'),
          }}>
          <SwitchAccount
            accounts={mockAccounts}
            currentAccountId={selectedId}
            changeAccount={setSelectedId}
          />
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
            Switch Account
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: tailwind.color('sara-text-secondary'),
              marginTop: 4,
            }}>
            Choose which account to use
          </Text>
        </View>
        <SwitchAccount accounts={mockAccounts} currentAccountId={1} changeAccount={() => {}} />
      </View>
    </View>
  ),
};
