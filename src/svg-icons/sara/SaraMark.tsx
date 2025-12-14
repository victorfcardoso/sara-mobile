import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface SaraMarkProps {
  /**
   * Fill color for the logo
   * @default '#4CB6AC' (sara-accent)
   */
  fill?: string;
  /**
   * Size of the logo (width and height)
   * @default 24
   */
  size?: number;
}

/**
 * Sara brand mark - stylized woman's face profile in a circular shape.
 * This is the primary brand icon for Sara.
 *
 * The logo depicts a circular teal shape with a woman's silhouette
 * (flowing hair curving from top, face profile on right side)
 * creating white/negative space.
 */
export const SaraMark = ({ fill = '#4CB6AC', size = 24 }: SaraMarkProps): JSX.Element => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/*
        Sara logo - The filled teal area forms most of the circle,
        while the woman's face profile creates a cutout/negative space.
        The hair flows from the top of the head around to form part of
        the circle's edge, and the face (forehead, nose, lips, chin)
        creates the inner cutout on the right side.
      */}
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 2C24.04 2 3 23.04 3 49c0 25.96 21.04 47 47 47s47-21.04 47-47C97 23.04 75.96 2 50 2zm15 8c8.5 2.5 15.5 7.5 20.5 14.5 5 7 7.5 15.5 7 24-.5 8.5-4 16.5-9.5 23-5.5 6.5-13 11-21.5 13-3 .7-6 1-9 1-4 0-8-.6-11.5-1.8-7-2.4-13-6.5-17.5-12.2-4.5-5.7-7.5-12.5-8.5-20-.4-3-.5-6-.3-9 .5-7.5 3-14.5 7.5-20.5 4.5-6 10.5-10.5 17.5-13.5 4-1.7 8.5-2.8 13-3.2 1.5-.1 3-.2 4.5-.2 2.8 0 5.5.3 8.3.9zM36 26c-3 1.5-5.5 3.5-7.5 6-3.5 4.5-5.5 10-5.5 16 0 3 .5 6 1.5 8.8 1.5 4 4 7.5 7 10.2 3 2.7 6.5 4.5 10.5 5.5 2 .5 4 .8 6 .8 1 0 2 0 3-.1.5 0 1-.1 1.5-.2-.5-1-1-2-1.3-3-.8-2-1.2-4-1.2-6 0-1 .1-2 .3-3 .5-2.5 1.5-5 3-7 .7-1 1.5-1.8 2.3-2.6.4-.4.8-.7 1.2-1.1.5-.4 1-.8 1.5-1.1.8-.5 1.6-1 2.5-1.4 1-.5 2-.8 3-1.1 1.3-.4 2.6-.6 4-.7.7 0 1.3-.1 2-.1h.5c-.5-2.5-1.5-5-2.8-7.2-2-3.5-5-6.5-8.5-8.5-3.5-2-7.5-3-11.5-3-4 0-8 1-11.5 3z"
        fill={fill}
      />
    </Svg>
  );
};
