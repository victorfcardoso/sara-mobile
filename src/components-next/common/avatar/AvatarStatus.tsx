import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { avatarTheme, tailwind } from '@/theme';
import { cx } from '@/utils';

import { AvatarProps, AvatarSizes } from './Avatar';

interface TypingStatusProps {
  size: Partial<AvatarSizes>;
  /** Background color (hex string or tailwind class) for status ring */
  parentsBackground: string;
}

/**
 * Resolves background color - accepts either hex color or tailwind class
 */
const resolveBackgroundColor = (parentsBackground: string): string => {
  // If it starts with #, it's already a hex color
  if (parentsBackground.startsWith('#')) {
    return parentsBackground;
  }
  // Otherwise, try to resolve it as a tailwind class
  return tailwind.color(parentsBackground) ?? '#FFFFFF';
};

interface AnimatedDotProps {
  size: AvatarSizes;
  delay: number;
}

const AnimatedDot: React.FC<AnimatedDotProps> = ({ size, delay }) => {
  const dotAnimation = useSharedValue(0);
  React.useEffect(() => {
    dotAnimation.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        -1,
        true,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotAnimation]);
  const dotAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(dotAnimation.value, [0, 0.5, 1], [1, 0.5, 1]),
    };
  });
  return (
    <Animated.View
      style={[
        tailwind.style(
          cx(
            avatarTheme.status.typing.innerDots.base,
            avatarTheme.status.typing.innerDots.size[size],
          ),
        ),
        dotAnimatedStyle,
      ]}
    />
  );
};

const TypingComponent: React.FC<TypingStatusProps> = ({ size, parentsBackground }) => {
  const delays = ['xl', '2xl', '3xl', '4xl'].includes(size) ? [0, 333, 667] : [0, 500];
  const bgColor = resolveBackgroundColor(parentsBackground);

  return (
    <View
      style={[
        tailwind.style(cx(avatarTheme.status.typing.container)),
        {
          bottom: avatarTheme.status.position[size],
          right: avatarTheme.status.position[size],
          borderColor: bgColor,
          backgroundColor: bgColor,
        },
      ]}>
      <View
        style={tailwind.style(
          cx(avatarTheme.status.typing.base, avatarTheme.status.typing.size[size]),
        )}>
        {delays.map(value => (
          <AnimatedDot key={value} size={size} delay={value} />
        ))}
      </View>
    </View>
  );
};

export const AvatarStatus: React.FC<Pick<AvatarProps, 'status' | 'size' | 'parentsBackground'>> = ({
  status,
  size,
  parentsBackground = '#FFFFFF',
}) => {
  const bgColor = resolveBackgroundColor(parentsBackground);

  switch (status) {
    case 'online': {
      return (
        <View
          style={[
            tailwind.style(cx(avatarTheme.status.active.container)),
            {
              bottom: avatarTheme.status.position[size],
              right: avatarTheme.status.position[size],
              borderColor: bgColor,
            },
          ]}>
          <View
            style={tailwind.style(
              cx(avatarTheme.status.active.base, avatarTheme.status.active.size[size]),
            )}
          />
        </View>
      );
    }
    case 'typing': {
      return <TypingComponent size={size} parentsBackground={parentsBackground} />;
    }
    default: {
      return null;
    }
  }
};
