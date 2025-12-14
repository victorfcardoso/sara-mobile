import Svg, { Mask, G, Rect } from 'react-native-svg';

interface MediumIconProps {
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const MediumIcon = ({ size = 20, activeColor = '#FFC53D', inactiveColor = '#DDDDE3' }: MediumIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Mask
        id="mask0_2323_83954"
        maskType="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24">
        <Rect width="24" height="24" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_2323_83954)">
        <Rect x="4" y="12" width="4" height="8" rx="2" fill={activeColor} />
        <Rect x="10" y="8" width="4" height="12" rx="2" fill={activeColor} />
        <Rect x="16" y="4" width="4" height="16" rx="2" fill={inactiveColor} />
      </G>
    </Svg>
  );
};
