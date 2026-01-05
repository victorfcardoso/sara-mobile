import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { SaraColors, useSaraColors } from '@/hooks/useSaraColors';
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

const getButtonStyles = (
  isPrimary: boolean,
  pressed: boolean,
  tone: ButtonProps['tone'],
  colors: SaraColors,
) => {
  const baseStyles = 'py-[11px] flex items-center justify-center rounded-[13px]';

  if (isPrimary) {
    if (tone === 'brand') {
      return [
        tailwind.style(baseStyles, pressed ? 'opacity-95' : ''),
        { backgroundColor: colors.accent },
      ];
    }

    return tailwind.style(baseStyles, 'bg-blue-800', pressed ? 'opacity-95' : '');
  }

  // Secondary button - use chip background in dark mode
  return [
    tailwind.style(baseStyles, pressed ? 'opacity-90' : ''),
    { backgroundColor: colors.chip },
  ];
};

const getTextStyles = (
  isPrimary: boolean,
  isDestructive: boolean,
  tone: ButtonProps['tone'],
  colors: SaraColors,
) => {
  const baseStyles = 'text-base font-medium tracking-[0.16px] leading-[22px]';

  if (isPrimary) {
    if (isDestructive) {
      return tailwind.style(baseStyles, 'text-tomato-800');
    }
    if (tone === 'brand') {
      return [tailwind.style(baseStyles), { color: colors.textPrimary }];
    }
    return tailwind.style(baseStyles, 'text-white');
  }

  // Secondary button text
  if (isDestructive) {
    return tailwind.style(baseStyles, 'text-ruby-800');
  }
  return [tailwind.style(baseStyles), { color: colors.textPrimary }];
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
  const colors = useSaraColors();

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
        style={({ pressed }) => getButtonStyles(isPrimary, pressed, tone, colors)}
        {...handlers}>
        <Animated.Text style={getTextStyles(isPrimary, isDestructive, tone, colors)}>
          {text}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};
