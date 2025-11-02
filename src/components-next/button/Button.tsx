import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useHaptic, useScaleAnimation } from '@/utils';

type ButtonProps = {
  isDestructive?: boolean;
  text: string;
  handlePress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  tone?: 'default' | 'brand';
};
const getButtonStyles = (isPrimary: boolean, pressed: boolean, tone: ButtonProps['tone']) => {
  const baseStyles = 'py-[11px] flex items-center justify-center rounded-[13px]';

  if (isPrimary) {
    if (tone === 'brand') {
      return [
        tailwind.style(baseStyles, pressed ? 'opacity-95' : ''),
        { backgroundColor: '#4CB6AC' },
      ];
    }

    return tailwind.style(baseStyles, 'bg-blue-800', pressed ? 'opacity-95' : '');
  }

  return tailwind.style(baseStyles, 'bg-gray-50', pressed ? 'bg-gray-100' : '');
};

const getTextStyles = (isPrimary: boolean, isDestructive: boolean, tone: ButtonProps['tone']) => {
  const baseStyles = 'text-base font-medium tracking-[0.16px] leading-[22px]';
  const colorStyles = isPrimary
    ? isDestructive
      ? 'text-tomato-800'
      : 'text-white'
    : isDestructive
      ? 'text-ruby-800'
      : 'text-gray-950';

  if (isPrimary && !isDestructive && tone === 'brand') {
    return [tailwind.style(baseStyles), { color: '#16273D' }];
  }

  return tailwind.style(baseStyles, colorStyles);
};

export const Button = ({
  text,
  isDestructive = false,
  handlePress,
  variant = 'primary',
  disabled = false,
  tone = 'default',
}: ButtonProps) => {
  const { handlers, animatedStyle } = useScaleAnimation();
  const haptic = useHaptic(isDestructive ? 'medium' : 'selection');

  const handleButtonPress = useCallback(() => {
    if (!disabled) {
      haptic?.();
      handlePress?.();
    }
  }, [disabled, handlePress, haptic]);

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handleButtonPress}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        style={({ pressed }) => getButtonStyles(isPrimary, pressed, tone)}
        {...handlers}>
        <Animated.Text style={getTextStyles(isPrimary, isDestructive, tone)}>{text}</Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
