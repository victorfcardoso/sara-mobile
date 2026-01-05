import React from 'react';
import { View, Text } from 'react-native';

import { tailwind } from '@/theme';
import { Image } from 'expo-image';
import { useSaraColors } from '@/hooks/useSaraColors';

type TypingIndicatorProps = {
  typingText: string;
};

export const TypingIndicator = ({ typingText }: TypingIndicatorProps) => {
  const colors = useSaraColors();

  return (
    <View style={tailwind.style('absolute w-full items-center -top-14')}>
      <View
        style={[
          tailwind.style('flex-row items-center py-1 px-4 shadow-md rounded-full my-1 mx-auto'),
          { backgroundColor: colors.accentLight },
        ]}>
        <Text
          style={[
            tailwind.style('text-cxs font-inter-medium-24 tracking-[0.32px] leading-[18px] text-center'),
            { color: colors.textPrimary },
          ]}>
          {typingText}
        </Text>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../../../assets/local/typing.gif')}
          style={tailwind.style('w-8 h-8 ml-2')}
          contentFit="contain"
        />
      </View>
    </View>
  );
};
