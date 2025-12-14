import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

// Default to sara-text-primary (#16273D)
const DEFAULT_COLOR = '#16273D';

interface TabIconProps {
  color?: string;
}

export const NotificationsIconOutline = ({ color = DEFAULT_COLOR }: TabIconProps) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <G transform="translate(0,-1.5)">
        <Path
          d="M30 18.75V14C30 10.688 27.312 8 24 8C20.688 8 18 10.688 18 14V18.75C18 19.632 17.648 20.48 17.008 21.12L16 22.128V23.25H32V22.128L30.992 21.12C30.352 20.48 30 19.632 30 18.75Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M22.25 26C22.25 27.5188 23.4812 28.75 25 28.75C26.5188 28.75 27.75 27.5188 27.75 26"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
};

export const NotificationsIconFilled = ({ color = DEFAULT_COLOR }: TabIconProps) => {
  return (
    <Svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      <G transform="translate(0,-1.5)">
        <Path
          d="M24 8C20.6863 8 18 10.6863 18 14V18.764C18 19.5872 17.6717 20.3762 17.0888 20.959L16 22.0478V23.25H32V22.0478L30.9112 20.959C30.3283 20.3762 30 19.5872 30 18.764V14C30 10.6863 27.3137 8 24 8Z"
          fill={color}
        />
        <Path
          d="M22.5 25.75C22.5 27.5449 23.9551 29 25.75 29C27.5449 29 29 27.5449 29 25.75V25.25H22.5V25.75Z"
          fill={color}
        />
      </G>
    </Svg>
  );
};
