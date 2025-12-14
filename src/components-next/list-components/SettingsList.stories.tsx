import { View, Switch, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SettingsList } from './SettingsList';
import { GenericListType } from '@/types';
import { UserIcon, InfoIcon, NotificationIcon } from '@/svg-icons/list-icons';
import { MailIcon, PhoneIcon, LockIcon } from '@/svg-icons/common';

const meta = {
  title: 'SettingsList',
  component: SettingsList,
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
} satisfies Meta<typeof SettingsList>;

export default meta;

type Story = StoryObj<typeof meta>;

// Basic settings list
export const BasicSettings: Story = {
  args: {
    sectionTitle: 'Account',
    list: [
      {
        title: 'Profile',
        subtitle: 'Edit profile',
        hasChevron: true,
        icon: <UserIcon />,
        onPressListItem: () => console.log('Profile pressed'),
      },
      {
        title: 'Email',
        subtitle: 'user@example.com',
        hasChevron: true,
        icon: <MailIcon />,
        onPressListItem: () => console.log('Email pressed'),
      },
      {
        title: 'Privacy',
        subtitle: 'Security settings',
        hasChevron: true,
        icon: <LockIcon />,
        onPressListItem: () => console.log('Privacy pressed'),
      },
    ] as GenericListType[],
  },
};

// Settings with light subtitles
export const WithLightSubtitles: Story = {
  args: {
    sectionTitle: 'Preferences',
    list: [
      {
        title: 'Language',
        subtitle: 'English',
        subtitleType: 'light',
        hasChevron: true,
        onPressListItem: () => console.log('Language pressed'),
      },
      {
        title: 'Theme',
        subtitle: 'Light Mode',
        subtitleType: 'light',
        hasChevron: true,
        onPressListItem: () => console.log('Theme pressed'),
      },
      {
        title: 'Notifications',
        subtitle: 'Enabled',
        subtitleType: 'light',
        hasChevron: true,
        icon: <NotificationIcon />,
        onPressListItem: () => console.log('Notifications pressed'),
      },
    ] as GenericListType[],
  },
};

// Settings without section title
export const NoSectionTitle: Story = {
  args: {
    list: [
      {
        title: 'Help Center',
        hasChevron: true,
        icon: <InfoIcon />,
        onPressListItem: () => console.log('Help Center pressed'),
      },
      {
        title: 'About',
        subtitle: 'Version 1.0.0',
        hasChevron: true,
        onPressListItem: () => console.log('About pressed'),
      },
    ] as GenericListType[],
  },
};

// Settings with custom accessories
export const WithAccessories: Story = {
  render: () => {
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    return (
      <SettingsList
        sectionTitle="Notifications"
        list={[
          {
            title: 'Push Notifications',
            renderAccessory: (
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#E6E2DD', true: '#4CB6AC' }}
                thumbColor="#FFFFFF"
              />
            ),
            onPressListItem: () => setPushEnabled(!pushEnabled),
          },
          {
            title: 'Email Notifications',
            renderAccessory: (
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: '#E6E2DD', true: '#4CB6AC' }}
                thumbColor="#FFFFFF"
              />
            ),
            onPressListItem: () => setEmailEnabled(!emailEnabled),
          },
        ]}
      />
    );
  },
};

// Settings with badge accessory
export const WithBadges: Story = {
  args: {
    sectionTitle: 'Updates',
    list: [
      {
        title: 'Messages',
        renderAccessory: (
          <View
            style={{
              backgroundColor: '#4CB6AC',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
              minWidth: 24,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>5</Text>
          </View>
        ),
        hasChevron: true,
        onPressListItem: () => console.log('Messages pressed'),
      },
      {
        title: 'Notifications',
        renderAccessory: (
          <View
            style={{
              backgroundColor: '#FF6B6B',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 2,
              minWidth: 24,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>12</Text>
          </View>
        ),
        hasChevron: true,
        onPressListItem: () => console.log('Notifications pressed'),
      },
    ] as GenericListType[],
  },
};

// Mixed settings (with and without chevrons)
export const MixedSettings: Story = {
  args: {
    sectionTitle: 'General',
    list: [
      {
        title: 'Profile Settings',
        subtitle: 'Dr. Silva',
        hasChevron: true,
        icon: <UserIcon />,
        onPressListItem: () => console.log('Profile pressed'),
      },
      {
        title: 'Email',
        subtitle: 'doctor@clinic.com',
        subtitleType: 'light',
        icon: <MailIcon />,
      },
      {
        title: 'Change Password',
        hasChevron: true,
        icon: <LockIcon />,
        onPressListItem: () => console.log('Change Password pressed'),
      },
      {
        title: 'App Version',
        subtitle: '2.0.1',
        subtitleType: 'light',
      },
    ] as GenericListType[],
  },
};

// With disabled items (should not appear)
export const WithDisabledItems: Story = {
  args: {
    sectionTitle: 'Visible Items Only',
    list: [
      {
        title: 'Visible Setting 1',
        hasChevron: true,
        onPressListItem: () => console.log('Setting 1 pressed'),
      },
      {
        title: 'Disabled Setting',
        disabled: true,
        hasChevron: true,
        onPressListItem: () => console.log('This should not show'),
      },
      {
        title: 'Visible Setting 2',
        hasChevron: true,
        onPressListItem: () => console.log('Setting 2 pressed'),
      },
    ] as GenericListType[],
  },
};

// Sara app settings example
export const SaraAppSettings: Story = {
  args: {
    sectionTitle: 'Sara Settings',
    list: [
      {
        title: 'Clinic Profile',
        subtitle: 'Clínica Dr. Silva',
        hasChevron: true,
        icon: <UserIcon />,
        onPressListItem: () => console.log('Clinic Profile pressed'),
      },
      {
        title: 'Office Hours',
        subtitle: 'Configure availability',
        hasChevron: true,
        subtitleType: 'light',
        onPressListItem: () => console.log('Office Hours pressed'),
      },
      {
        title: 'Service Catalog',
        subtitle: 'Manage services',
        hasChevron: true,
        subtitleType: 'light',
        onPressListItem: () => console.log('Service Catalog pressed'),
      },
      {
        title: 'Notifications',
        subtitle: 'Customize alerts',
        hasChevron: true,
        icon: <NotificationIcon />,
        subtitleType: 'light',
        onPressListItem: () => console.log('Notifications pressed'),
      },
    ] as GenericListType[],
  },
};

// Multiple sections showcase
export const MultipleSections: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <SettingsList
        sectionTitle="Account"
        list={[
          {
            title: 'Profile',
            subtitle: 'Edit your profile',
            hasChevron: true,
            icon: <UserIcon />,
          },
          {
            title: 'Email',
            subtitle: 'user@example.com',
            subtitleType: 'light',
            icon: <MailIcon />,
          },
        ]}
      />
      <SettingsList
        sectionTitle="Security"
        list={[
          {
            title: 'Change Password',
            hasChevron: true,
            icon: <LockIcon />,
          },
          {
            title: 'Privacy Settings',
            hasChevron: true,
          },
        ]}
      />
      <SettingsList
        sectionTitle="About"
        list={[
          {
            title: 'Version',
            subtitle: '2.0.1',
            subtitleType: 'light',
          },
          {
            title: 'Help Center',
            hasChevron: true,
            icon: <InfoIcon />,
          },
        ]}
      />
    </View>
  ),
};
