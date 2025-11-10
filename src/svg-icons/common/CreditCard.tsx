import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const CreditCardIcon = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps) => {
  return (
    <Svg width="100%" height="24" viewBox="0 0 24 24" fill="none">
      <Rect
        x={3.75}
        y={5.75}
        width={16.5}
        height={12.5}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Path d="M3.75 10.25H20.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M7.25 14.75H10.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14.75 14.75H16.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};
