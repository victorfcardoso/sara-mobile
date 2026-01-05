import React from 'react';
import { Text } from 'react-native';

import { tailwind } from '@/theme';
import { NativeView } from '@/components-next/native-components';
import { useSaraColors } from '@/hooks/useSaraColors';

type UnreadIndicatorProps = {
  count: number;
};

export const UnreadIndicator = (props: UnreadIndicatorProps) => {
  const { count } = props;
  const colors = useSaraColors();
  return (
    <NativeView
      style={[
        tailwind.style('h-5 w-5 flex justify-center items-center rounded-full'),
        { backgroundColor: colors.accent },
      ]}>
      <Text
        style={tailwind.style(
          'text-xs font-inter-semibold-20 leading-[15px] text-center text-white',
        )}>
        {count > 9 ? '9+' : count}
      </Text>
    </NativeView>
  );
};
