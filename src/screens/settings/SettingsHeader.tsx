import React from 'react';
import Animated from 'react-native-reanimated';

import i18n from 'i18n';
import { tailwind } from '@/theme';
import { useSaraColors } from '@/hooks/useSaraColors';

export const SettingsHeader = () => {
  const colors = useSaraColors();

  return (
    <Animated.View
      style={[
        tailwind.style('flex flex-row px-4 pt-2 pb-[12px] border-b-[1px]'),
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}>
      <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
        <Animated.Text
          style={[
            tailwind.style('text-[17px] font-medium text-center'),
            { color: colors.textPrimary },
          ]}>
          {i18n.t('SETTINGS.HEADER_TITLE')}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};
