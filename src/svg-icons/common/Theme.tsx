import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

import { IconProps } from '../../types';

// Sun icon for light mode - default to sara-text-meta (#6C778A)
export const SunIcon = ({ stroke = '#6C778A' }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth="2" />
      <Path d="M12 2V4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 20V22" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M4.93 4.93L6.34 6.34" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M17.66 17.66L19.07 19.07" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M2 12H4" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M20 12H22" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6.34 17.66L4.93 19.07" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M19.07 4.93L17.66 6.34" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};

// Moon icon for dark mode - default to sara-text-meta (#6C778A)
export const MoonIcon = ({ stroke = '#6C778A' }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

// Monitor/System icon for system theme - default to sara-text-meta (#6C778A)
export const MonitorIcon = ({ stroke = '#6C778A' }: IconProps) => {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H6C4.89543 16 4 15.1046 4 14V6Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 16V20" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 20H16" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
};
