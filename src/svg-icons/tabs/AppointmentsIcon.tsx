import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

// Default to sara-text-primary (#16273D)
const DEFAULT_COLOR = '#16273D';

interface TabIconProps {
  color?: string;
}

export const AppointmentsIconOutline = ({ color = DEFAULT_COLOR }: TabIconProps) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <G transform="translate(0,-1.5)">
        <Rect x="12" y="9" width="24" height="22" rx="4" stroke={color} strokeWidth="1.5" />
        <Path d="M12 16.5H36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M18 6.5V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Path d="M30 6.5V11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <Path
          d="M20.75 21.75L23 24L27.25 19.75"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export const AppointmentsIconFilled = ({ color = DEFAULT_COLOR }: TabIconProps) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <G transform="translate(0,-1.5)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M18 6C18 5.58579 18.3358 5.25 18.75 5.25C19.1642 5.25 19.5 5.58579 19.5 6V8H28.5V6C28.5 5.58579 28.8358 5.25 29.25 5.25C29.6642 5.25 30 5.58579 30 6V8H32C34.2091 8 36 9.79086 36 12V27C36 29.2091 34.2091 31 32 31H16C13.7909 31 12 29.2091 12 27V12C12 9.79086 13.7909 8 16 8H18V6ZM16 9.5C14.6193 9.5 13.5 10.6193 13.5 12V15.5H34.5V12C34.5 10.6193 33.3807 9.5 32 9.5H16ZM13.5 27C13.5 28.3807 14.6193 29.5 16 29.5H32C33.3807 29.5 34.5 28.3807 34.5 27V17H13.5V27Z"
          fill={color}
        />
        <Path
          d="M20.5 22.25L23 24.75L27.5 20.25"
          stroke="#F8F5F3"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};
