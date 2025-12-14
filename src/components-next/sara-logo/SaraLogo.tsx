import React from 'react';
import { View, ViewStyle } from 'react-native';

import { tailwind } from '@/theme';
import { SaraMark, SaraWordmark } from '@/svg-icons';

export interface SaraLogoProps {
  /**
   * Size of the logo.
   * - For 'mark' variant: this is the width and height
   * - For 'wordmark' variant: this is the height (width scales proportionally)
   * @default 32
   */
  size?: number;
  /**
   * Primary color for the logo (teal accent color)
   * @default sara-accent (#4CB6AC)
   */
  color?: string;
  /**
   * Text color for wordmark variant
   * @default sara-text-primary (#16273D)
   */
  textColor?: string;
  /**
   * Logo variant
   * - 'mark': Just the circular logo icon (woman's profile silhouette)
   * - 'wordmark': Logo icon with "Sara" text
   * @default 'mark'
   */
  variant?: 'mark' | 'wordmark';
  /**
   * Optional container style
   */
  style?: ViewStyle;
}

/**
 * Sara Logo component with configurable size, color, and variant.
 *
 * Usage:
 * ```tsx
 * // Default mark (32x32)
 * <SaraLogo />
 *
 * // Larger mark with custom color
 * <SaraLogo size={48} color="#4CB6AC" />
 *
 * // Full wordmark
 * <SaraLogo variant="wordmark" size={40} />
 *
 * // Using theme colors
 * <SaraLogo color={tailwind.color('sara-accent')} />
 * ```
 */
export const SaraLogo: React.FC<SaraLogoProps> = ({
  size = 32,
  color,
  textColor,
  variant = 'mark',
  style,
}) => {
  // Default to Sara theme colors
  const markColor = color ?? tailwind.color('sara-accent') ?? '#4CB6AC';
  const wordmarkTextColor = textColor ?? tailwind.color('sara-text-primary') ?? '#16273D';

  return (
    <View style={style}>
      {variant === 'mark' ? (
        <SaraMark size={size} fill={markColor} />
      ) : (
        <SaraWordmark height={size} markColor={markColor} textColor={wordmarkTextColor} />
      )}
    </View>
  );
};
