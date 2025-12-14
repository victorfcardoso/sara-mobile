import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { AttributeList } from './AttributeList';
import { AttributeListType } from '@/types';
import { UserIcon, MailIcon, PhoneIcon } from '@/svg-icons/list-icons';

const meta = {
  title: 'AttributeList',
  component: AttributeList,
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
} satisfies Meta<typeof AttributeList>;

export default meta;

type Story = StoryObj<typeof meta>;

// Basic text attributes
export const TextAttributes: Story = {
  args: {
    sectionTitle: 'Contact Information',
    list: [
      {
        title: 'Name',
        subtitle: 'John Doe',
        type: 'text',
        icon: <UserIcon />,
      },
      {
        title: 'Email',
        subtitle: 'john.doe@example.com',
        type: 'text',
        icon: <MailIcon />,
      },
      {
        title: 'Phone',
        subtitle: '+1 234 567 8900',
        type: 'text',
        icon: <PhoneIcon />,
      },
    ] as AttributeListType[],
  },
};

// Date attributes
export const DateAttributes: Story = {
  args: {
    sectionTitle: 'Important Dates',
    list: [
      {
        title: 'Created At',
        subtitle: '2024-01-15T10:30:00Z',
        type: 'date',
      },
      {
        title: 'Last Updated',
        subtitle: '2024-03-20T14:45:00Z',
        type: 'date',
      },
      {
        title: 'Next Appointment',
        subtitle: '2024-04-05T09:00:00Z',
        type: 'date',
        hasChevron: true,
      },
    ] as AttributeListType[],
  },
};

// Checkbox attributes
export const CheckboxAttributes: Story = {
  args: {
    sectionTitle: 'Preferences',
    list: [
      {
        title: 'Email Notifications',
        subtitle: 'true',
        type: 'checkbox',
      },
      {
        title: 'SMS Notifications',
        subtitle: '',
        type: 'checkbox',
      },
      {
        title: 'Marketing Emails',
        subtitle: 'true',
        type: 'checkbox',
      },
    ] as AttributeListType[],
  },
};

// Link attributes
export const LinkAttributes: Story = {
  args: {
    list: [
      {
        title: 'Website',
        subtitle: 'https://example.com',
        type: 'link',
        hasChevron: true,
      },
      {
        title: 'LinkedIn',
        subtitle: 'linkedin.com/in/johndoe',
        type: 'link',
        hasChevron: true,
      },
    ] as AttributeListType[],
  },
};

// Mixed types
export const MixedAttributes: Story = {
  args: {
    sectionTitle: 'Patient Details',
    list: [
      {
        title: 'Full Name',
        subtitle: 'Maria Silva',
        type: 'text',
        icon: <UserIcon />,
      },
      {
        title: 'Email',
        subtitle: 'maria.silva@email.com',
        type: 'text',
        icon: <MailIcon />,
      },
      {
        title: 'Phone',
        subtitle: '+55 11 98765-4321',
        type: 'text',
        icon: <PhoneIcon />,
      },
      {
        title: 'Registration Date',
        subtitle: '2024-01-10T08:00:00Z',
        type: 'date',
      },
      {
        title: 'Active Patient',
        subtitle: 'true',
        type: 'checkbox',
      },
      {
        title: 'Medical Records',
        subtitle: 'View Records',
        type: 'link',
        hasChevron: true,
      },
    ] as AttributeListType[],
  },
};

// Without section title
export const NoSectionTitle: Story = {
  args: {
    list: [
      {
        title: 'Name',
        subtitle: 'John Smith',
        type: 'text',
      },
      {
        title: 'Email',
        subtitle: 'john.smith@example.com',
        type: 'text',
      },
    ] as AttributeListType[],
  },
};

// With disabled items (they should not appear)
export const WithDisabledItems: Story = {
  args: {
    sectionTitle: 'Visible Items Only',
    list: [
      {
        title: 'Visible Item 1',
        subtitle: 'This will show',
        type: 'text',
      },
      {
        title: 'Hidden Item',
        subtitle: 'This will not show',
        type: 'text',
        disabled: true,
      },
      {
        title: 'Visible Item 2',
        subtitle: 'This will show',
        type: 'text',
      },
    ] as AttributeListType[],
  },
};

// With null/undefined values (they should not appear)
export const WithNullValues: Story = {
  args: {
    sectionTitle: 'Only Items With Values',
    list: [
      {
        title: 'Has Value',
        subtitle: 'Visible',
        type: 'text',
      },
      {
        title: 'Null Value',
        subtitle: null as any,
        type: 'text',
      },
      {
        title: 'Undefined Value',
        subtitle: undefined,
        type: 'text',
      },
      {
        title: 'Another Valid',
        subtitle: 'Also Visible',
        type: 'text',
      },
    ] as AttributeListType[],
  },
};

// Light vs dark subtitle types
export const SubtitleTypes: Story = {
  args: {
    sectionTitle: 'Subtitle Styling',
    list: [
      {
        title: 'Default Subtitle',
        subtitle: 'Dark text',
        type: 'text',
      },
      {
        title: 'Light Subtitle',
        subtitle: 'Lighter text',
        subtitleType: 'light',
        type: 'text',
      },
      {
        title: 'Dark Subtitle',
        subtitle: 'Darker text',
        subtitleType: 'dark',
        type: 'text',
      },
    ] as AttributeListType[],
  },
};
