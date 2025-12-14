import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import Svg, { Path } from 'react-native-svg';

import { AuthButton } from './AuthButton';

// Simple icons for the stories
const EmailIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      fill="#838383"
      d="M5.25 4h13.5a3.25 3.25 0 0 1 3.245 3.066L22 7.25v9.5a3.25 3.25 0 0 1-3.066 3.245L18.75 20H5.25a3.25 3.25 0 0 1-3.245-3.066L2 16.75v-9.5a3.25 3.25 0 0 1 3.066-3.245zh13.5zM20.5 9.373l-8.15 4.29a.75.75 0 0 1-.603.043l-.096-.042L3.5 9.374v7.376a1.75 1.75 0 0 0 1.606 1.744l.144.006h13.5a1.75 1.75 0 0 0 1.744-1.607l.006-.143zM18.75 5.5H5.25a1.75 1.75 0 0 0-1.744 1.606L3.5 7.25v.429l8.5 4.474l8.5-4.475V7.25a1.75 1.75 0 0 0-1.607-1.744z"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.55.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.24 1.01l-2.21 2.23Z"
      stroke="#838383"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM7 11V7a5 5 0 0 1 10 0v4"
      stroke="#838383"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const meta = {
  title: 'AuthButton',
  component: AuthButton,
  args: {
    text: 'Continue with Email',
    icon: <EmailIcon />,
    handlePress: () => console.log('AuthButton pressed'),
    variant: 'outline',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['outline', 'filled'],
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
} satisfies Meta<typeof AuthButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// Outline variant (default)
export const Outline: Story = {
  args: {
    text: 'Continue with Email',
    icon: <EmailIcon />,
    variant: 'outline',
  },
};

// Filled variant
export const Filled: Story = {
  args: {
    text: 'Sign In',
    icon: <LockIcon />,
    variant: 'filled',
  },
};

// Disabled outline
export const DisabledOutline: Story = {
  args: {
    text: 'Continue with Email',
    icon: <EmailIcon />,
    variant: 'outline',
    disabled: true,
  },
};

// Disabled filled
export const DisabledFilled: Story = {
  args: {
    text: 'Sign In',
    icon: <LockIcon />,
    variant: 'filled',
    disabled: true,
  },
};

// Phone auth button
export const PhoneAuth: Story = {
  args: {
    text: 'Continue with Phone',
    icon: <PhoneIcon />,
    variant: 'outline',
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Outline:</Text>
        <AuthButton text="Continue with Email" icon={<EmailIcon />} variant="outline" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Filled:</Text>
        <AuthButton text="Sign In" icon={<LockIcon />} variant="filled" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>
          Disabled Outline:
        </Text>
        <AuthButton text="Continue with Email" icon={<EmailIcon />} variant="outline" disabled />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#666' }}>Disabled Filled:</Text>
        <AuthButton text="Sign In" icon={<LockIcon />} variant="filled" disabled />
      </View>
    </View>
  ),
};

// Auth screen simulation
export const AuthScreenExample: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>
        Welcome
      </Text>
      <AuthButton text="Continue with Email" icon={<EmailIcon />} variant="outline" />
      <AuthButton text="Continue with Phone" icon={<PhoneIcon />} variant="outline" />
      <View style={{ marginTop: 8 }}>
        <AuthButton text="Sign In" icon={<LockIcon />} variant="filled" />
      </View>
    </View>
  ),
};
