import { View, Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react';
import { useSharedValue } from 'react-native-reanimated';

import { VerificationCode, StatusType } from './index';

// Wrapper component that creates the shared value for status
const VerificationCodeWrapper = ({
  code,
  maxLength = 5,
  status = 'inProgress',
  isCodeWrong = false,
}: {
  code: string[];
  maxLength?: number;
  status?: StatusType;
  isCodeWrong?: boolean;
}) => {
  const statusValue = useSharedValue<StatusType>(status);

  return (
    <View style={{ height: 80 }}>
      <VerificationCode
        code={code}
        maxLength={maxLength}
        status={statusValue}
        isCodeWrong={isCodeWrong}
      />
    </View>
  );
};

const meta = {
  title: 'VerificationCode',
  component: VerificationCodeWrapper,
  args: {
    code: ['1', '2', '3'],
    maxLength: 5,
    status: 'inProgress',
    isCodeWrong: false,
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['inProgress', 'correct', 'wrong'],
    },
  },
  decorators: [
    Story => (
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: 'center',
        }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof VerificationCodeWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty code input
export const Empty: Story = {
  args: {
    code: [],
    maxLength: 5,
    status: 'inProgress',
    isCodeWrong: false,
  },
};

// Partially filled code
export const PartiallyFilled: Story = {
  args: {
    code: ['1', '2', '3'],
    maxLength: 5,
    status: 'inProgress',
    isCodeWrong: false,
  },
};

// Fully filled code
export const FullyFilled: Story = {
  args: {
    code: ['1', '2', '3', '4', '5'],
    maxLength: 5,
    status: 'inProgress',
    isCodeWrong: false,
  },
};

// Correct code (green border)
export const CorrectCode: Story = {
  args: {
    code: ['1', '2', '3', '4', '5'],
    maxLength: 5,
    status: 'correct',
    isCodeWrong: false,
  },
};

// Wrong code
export const WrongCode: Story = {
  args: {
    code: ['1', '2', '3', '4', '5'],
    maxLength: 5,
    status: 'wrong',
    isCodeWrong: true,
  },
};

// 4-digit code
export const FourDigitCode: Story = {
  args: {
    code: ['1', '2'],
    maxLength: 4,
    status: 'inProgress',
    isCodeWrong: false,
  },
};

// 6-digit code
export const SixDigitCode: Story = {
  args: {
    code: ['1', '2', '3', '4'],
    maxLength: 6,
    status: 'inProgress',
    isCodeWrong: false,
  },
};

// All states demo
export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 32 }}>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>In Progress:</Text>
        <VerificationCodeWrapper code={['1', '2', '3']} maxLength={5} status="inProgress" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Correct:</Text>
        <VerificationCodeWrapper code={['1', '2', '3', '4', '5']} maxLength={5} status="correct" />
      </View>
      <View>
        <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Wrong:</Text>
        <VerificationCodeWrapper
          code={['1', '2', '3', '4', '5']}
          maxLength={5}
          status="wrong"
          isCodeWrong={true}
        />
      </View>
    </View>
  ),
};
