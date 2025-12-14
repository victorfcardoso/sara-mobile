import Svg, { Mask, G, Rect } from 'react-native-svg';

interface HighIconProps {
  size?: number;
  color?: string;
}

export const HighIcon = ({ size = 20, color = '#FFC53D' }: HighIconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Mask
        id="mask0_2323_83934"
        maskType="alpha"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24">
        <Rect width="24" height="24" fill="#ED8A5C" />
      </Mask>
      <G mask="url(#mask0_2323_83934)">
        <Rect x="4" y="12" width="4" height="8" rx="2" fill={color} />
        <Rect x="10" y="8" width="4" height="12" rx="2" fill={color} />
        <Rect x="16" y="4" width="4" height="16" rx="2" fill={color} />
      </G>
    </Svg>
  );
};
