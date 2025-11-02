import React from 'react';
import Animated from 'react-native-reanimated';

import i18n from 'i18n';
import { tailwind } from '@/theme';

const SARA_COLORS = {
  background: '#F8F5F3',
  text: '#16273D',
  border: '#E6E0D7',
};

export const SettingsHeader = () => {
  return (
    <Animated.View
      style={[
        tailwind.style('flex flex-row px-4 pt-2 pb-[12px] border-b-[1px]'),
        {
          backgroundColor: SARA_COLORS.background,
          borderBottomColor: SARA_COLORS.border,
        },
      ]}>
      <Animated.View style={tailwind.style('flex-1 justify-center items-center')}>
        <Animated.Text
          style={[
            tailwind.style('text-[17px] font-medium text-center'),
            { color: SARA_COLORS.text },
          ]}>
          {i18n.t('SETTINGS.HEADER_TITLE')}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};
