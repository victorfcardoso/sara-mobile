import React from 'react';
import Svg, { G, Mask, Rect } from 'react-native-svg';

import { IconProps } from '../../types';

interface PriorityIconProps extends IconProps {
  maskFill?: string;
}

export const PriorityIcon = ({ fill = '#FFC53D', maskFill = '#ED8A5C' }: PriorityIconProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Mask id="mask0_2222_48128" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <Rect width="24" height="24" fill={maskFill} />
      </Mask>
      <G mask="url(#mask0_2222_48128)">
        <Rect x="4" y="12" width="4" height="8" rx="2" fill={fill} />
        <Rect x="10" y="8" width="4" height="12" rx="2" fill={fill} />
        <Rect x="16" y="4" width="4" height="16" rx="2" fill={fill} />
      </G>
    </Svg>
  );
};
