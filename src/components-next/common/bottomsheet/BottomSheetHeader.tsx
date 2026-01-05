import React from 'react';
import Animated from 'react-native-reanimated';

import { useSaraColors } from '@/hooks/useSaraColors';
import { tailwind } from '@/theme';

type BottomSheetHeaderProps = {
  headerText: string;
};

export const BottomSheetHeader = (props: BottomSheetHeaderProps) => {
  const { headerText } = props;
  const colors = useSaraColors();

  return (
    <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
      <Animated.Text
        style={[
          tailwind.style('text-md font-inter-medium-24 leading-[17px] tracking-[0.32px]'),
          { color: colors.textPrimary },
        ]}>
        {headerText}
      </Animated.Text>
    </Animated.View>
  );
};
