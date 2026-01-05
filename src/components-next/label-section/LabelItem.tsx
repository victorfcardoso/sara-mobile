import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Animated from 'react-native-reanimated';

import { tailwind } from '@/theme';
import { useIsDarkMode, useSaraColors } from '@/hooks/useSaraColors';
import { Label } from '@/types';

type LabelItemProps = {
  item: Label;
  index: number;
};

export const LabelItem = (props: LabelItemProps) => {
  const { item } = props;
  const colors = useSaraColors();
  const isDark = useIsDarkMode();

  // In dark mode, use a subtle border instead of shadow for better visibility
  const labelStyle = isDark
    ? [
        tailwind.style('flex flex-row items-center px-3 py-[7px] rounded-lg mr-2 mt-3 border'),
        { backgroundColor: colors.backgroundLight, borderColor: colors.border },
      ]
    : [
        styles.labelShadow,
        tailwind.style('flex flex-row items-center px-3 py-[7px] rounded-lg mr-2 mt-3'),
        { backgroundColor: colors.backgroundLight },
      ];

  return (
    <Animated.View style={labelStyle}>
      <Animated.View style={tailwind.style('h-2 w-2 rounded-full', `bg-[${item.color}]`)} />
      <Animated.Text
        style={[
          tailwind.style('text-md font-inter-normal-20 leading-[17px] tracking-[0.32px] pl-1.5'),
          { color: colors.textPrimary },
        ]}>
        {item.title}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  labelShadow:
    Platform.select({
      ios: {
        shadowColor: '#00000040',
        shadowOffset: { width: 0, height: 0.15 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
        elevation: 2,
      },
      android: {
        elevation: 4,
      },
    }) || {}, // Add fallback empty object
});
