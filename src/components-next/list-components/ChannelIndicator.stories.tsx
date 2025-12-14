import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';

import { ChannelIndicator } from './ChannelIndicator';
import { Inbox } from '@/types/Inbox';
import { InboxTypes } from '@/types/common/Channel';

const meta = {
  title: 'ChannelIndicator',
  component: ChannelIndicator,
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backgroundColor: '#F8F5F3',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof ChannelIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

// WhatsApp channel
export const WhatsApp: Story = {
  args: {
    inbox: {
      id: 1,
      name: 'WhatsApp Business',
      channelType: InboxTypes.WHATSAPP,
      medium: '',
      channelId: 1,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Web Widget channel
export const WebWidget: Story = {
  args: {
    inbox: {
      id: 2,
      name: 'Website Chat',
      channelType: InboxTypes.WEB,
      medium: '',
      channelId: 2,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Facebook channel
export const Facebook: Story = {
  args: {
    inbox: {
      id: 3,
      name: 'Facebook Page',
      channelType: InboxTypes.FB,
      medium: '',
      channelId: 3,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Twitter channel
export const Twitter: Story = {
  args: {
    inbox: {
      id: 4,
      name: 'Twitter Profile',
      channelType: InboxTypes.TWITTER,
      medium: '',
      channelId: 4,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Email channel
export const Email: Story = {
  args: {
    inbox: {
      id: 5,
      name: 'Support Email',
      channelType: InboxTypes.EMAIL,
      medium: '',
      channelId: 5,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Telegram channel
export const Telegram: Story = {
  args: {
    inbox: {
      id: 6,
      name: 'Telegram Bot',
      channelType: InboxTypes.TELEGRAM,
      medium: '',
      channelId: 6,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// SMS channel
export const SMS: Story = {
  args: {
    inbox: {
      id: 7,
      name: 'SMS Inbox',
      channelType: InboxTypes.SMS,
      medium: '',
      channelId: 7,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Twilio SMS channel
export const TwilioSMS: Story = {
  args: {
    inbox: {
      id: 8,
      name: 'Twilio SMS',
      channelType: InboxTypes.TWILIO,
      medium: '',
      channelId: 8,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// API channel
export const API: Story = {
  args: {
    inbox: {
      id: 9,
      name: 'API Inbox',
      channelType: InboxTypes.API,
      medium: '',
      channelId: 9,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// Line channel
export const Line: Story = {
  args: {
    inbox: {
      id: 10,
      name: 'Line Messenger',
      channelType: InboxTypes.LINE,
      medium: '',
      channelId: 10,
      avatarUrl: '',
      phoneNumber: '',
      provider: '',
    } as Inbox,
  },
};

// All channels showcase
export const AllChannels: Story = {
  render: () => (
    <View style={{ gap: 16, width: '100%', maxWidth: 400 }}>
      {[
        { type: InboxTypes.WHATSAPP, name: 'WhatsApp' },
        { type: InboxTypes.WEB, name: 'Web Widget' },
        { type: InboxTypes.FB, name: 'Facebook' },
        { type: InboxTypes.TWITTER, name: 'Twitter' },
        { type: InboxTypes.EMAIL, name: 'Email' },
        { type: InboxTypes.TELEGRAM, name: 'Telegram' },
        { type: InboxTypes.SMS, name: 'SMS' },
        { type: InboxTypes.TWILIO, name: 'Twilio' },
        { type: InboxTypes.API, name: 'API' },
        { type: InboxTypes.LINE, name: 'Line' },
      ].map((channel, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            gap: 12,
          }}>
          <ChannelIndicator
            inbox={
              {
                id: index,
                name: channel.name,
                channelType: channel.type,
                medium: '',
                channelId: index,
                avatarUrl: '',
                phoneNumber: '',
                provider: '',
              } as Inbox
            }
          />
          <Text style={{ color: '#16273D', fontSize: 14, fontWeight: '500' }}>{channel.name}</Text>
        </View>
      ))}
    </View>
  ),
};

// In conversation list context
export const InConversationList: Story = {
  render: () => (
    <View style={{ gap: 8, width: '100%' }}>
      {[
        { type: InboxTypes.WHATSAPP, name: 'Patient Inquiry', time: '10:30 AM' },
        { type: InboxTypes.EMAIL, name: 'Appointment Request', time: '9:15 AM' },
        { type: InboxTypes.WEB, name: 'Website Chat', time: 'Yesterday' },
      ].map((conv, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            gap: 12,
          }}>
          <ChannelIndicator
            inbox={
              {
                id: index,
                name: `${conv.type} Inbox`,
                channelType: conv.type,
                medium: '',
                channelId: index,
                avatarUrl: '',
                phoneNumber: '',
                provider: '',
              } as Inbox
            }
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#16273D', fontSize: 14, fontWeight: '500' }}>{conv.name}</Text>
            <Text style={{ color: '#6C778A', fontSize: 12 }}>{conv.time}</Text>
          </View>
        </View>
      ))}
    </View>
  ),
};
