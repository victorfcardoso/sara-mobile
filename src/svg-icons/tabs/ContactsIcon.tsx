import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

const TAB_NAVY = '#16273D';

export const ContactsIconOutline = () => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <Circle cx="24" cy="14" r="6" stroke={TAB_NAVY} strokeWidth="1.5" />
      <Path
        d="M13 30C13.6698 25.0659 18.3561 22 24 22C29.6439 22 34.3302 25.0659 35 30"
        stroke={TAB_NAVY}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const ContactsIconFilled = () => {
  return (
    <Svg width="49" height="40" viewBox="0 0 49 40" fill="none">
      <Path
        d="M24 8C20.6863 8 18 10.6863 18 14C18 17.3137 20.6863 20 24 20C27.3137 20 30 17.3137 30 14C30 10.6863 27.3137 8 24 8Z"
        fill={TAB_NAVY}
      />
      <Path
        d="M24 22C18.1986 22 13.6431 25.5156 13 30H35C34.3569 25.5156 29.8014 22 24 22Z"
        fill={TAB_NAVY}
      />
    </Svg>
  );
};
