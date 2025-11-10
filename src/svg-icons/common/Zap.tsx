import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { IconProps } from '../../types';

export const ZapIcon = ({ stroke = '#858585', strokeWidth = 1.5 }: IconProps) => {
  return (
    <Svg width="100%" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M13 2.75L5.75 13.25H11.5L11 21.25L18.25 10.75H12.5L13 2.75Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
