import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

export const PencilIcon = ({
  stroke = '#4B5D6E',
  strokeWidth = 1.5,
}: IconProps): JSX.Element => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 21h4.75c.53 0 1.04-.21 1.41-.59l11-11a2 2 0 0 0 0-2.83l-1.74-1.74a2 2 0 0 0-2.83 0l-11 11C4.21 16.71 4 17.22 4 17.75V21"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.5 5.5 18.5 9.5"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x={3} y={21} width={5} height={1} rx={0.5} fill={stroke} opacity={0.35} />
    </Svg>
  );
};
