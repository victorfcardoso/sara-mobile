import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const CalendarIcon = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps) => {
  return (
    <Svg width="100%" height="24" viewBox="0 0 24 24" fill="none">
      <Rect
        x={3.75}
        y={4.75}
        width={16.5}
        height={15.5}
        rx={2}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      <Path d="M8 2.75V5.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M16 2.75V5.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M3.75 9.25H20.25" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path
        d="M8.25 12.75H9.25"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.75 12.75H12.75"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.25 12.75H16.25"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
