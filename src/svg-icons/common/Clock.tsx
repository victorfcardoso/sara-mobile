import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const ClockIcon = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps) => {
  return (
    <Svg width="100%" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.25} stroke={stroke} strokeWidth={strokeWidth} />
      <Path
        d="M12 7.75V12L15 13.75"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
