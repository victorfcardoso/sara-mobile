import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { TYPE_STYLES } from './constants';
import { NotificationType } from './types';

type NotificationGlyphProps = {
  type: NotificationType;
};

export const NotificationGlyph = ({ type }: NotificationGlyphProps) => {
  const color = TYPE_STYLES[type].iconColor;

  switch (type) {
    case 'handoff':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Circle cx={6.2} cy={6.5} r={3.2} stroke={color} strokeWidth={1.4} />
          <Circle cx={14} cy={5.6} r={2.6} stroke={color} strokeWidth={1.4} />
          <Path
            d="M3.5 14.2C4.4 12.7 6.4 11.7 8 11.7C9.6 11.7 11.6 12.7 12.5 14.2"
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <Path
            d="M11.4 12.8L14.9 16.3L17.3 13.7"
            stroke={color}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'confirmation':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Circle cx={10} cy={10} r={7.6} stroke={color} strokeWidth={1.6} />
          <Path
            d="M6.7 10.1L8.9 12.5L13.3 7.9"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'payment':
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Rect
            x={2.5}
            y={4.2}
            width={15}
            height={10.8}
            rx={2.4}
            stroke={color}
            strokeWidth={1.4}
          />
          <Rect x={2.5} y={7.2} width={15} height={2.6} fill={color} opacity={0.12} />
          <Rect x={4.6} y={12.2} width={4} height={1.4} rx={0.7} fill={color} />
          <Rect x={11.4} y={12.2} width={2.6} height={1.4} rx={0.7} fill={color} />
        </Svg>
      );
    case 'booking':
    default:
      return (
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Rect x={3} y={4.4} width={14} height={12} rx={2.4} stroke={color} strokeWidth={1.4} />
          <Path d="M3 8.3H17" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
          <Rect x={6.2} y={2} width={1.6} height={3.4} rx={0.8} fill={color} />
          <Rect x={12.2} y={2} width={1.6} height={3.4} rx={0.8} fill={color} />
          <Circle cx={8.8} cy={11.6} r={1.4} fill={color} opacity={0.18} />
          <Circle cx={8.8} cy={11.6} r={0.9} fill={color} />
        </Svg>
      );
  }
};
