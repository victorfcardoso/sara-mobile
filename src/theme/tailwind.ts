import { create } from 'twrnc';

import { twConfig } from './tailwind.config';

export const tailwind = create(twConfig);

/**
 * Sara color token keys that can be used with getSaraColor().
 */
export type SaraColorToken =
  | 'background'
  | 'background-light'
  | 'accent'
  | 'accent-light'
  | 'accent-muted'
  | 'text-primary'
  | 'text-secondary'
  | 'text-meta'
  | 'border'
  | 'border-strong'
  | 'chip';

/**
 * Get a Sara color value for the specified theme.
 *
 * @param token - Sara color token (e.g., 'background', 'accent', 'text-primary')
 * @param isDark - Whether to use dark mode colors
 * @returns Hex color string or undefined if token not found
 *
 * @example
 * ```tsx
 * // In a component using useSaraColorScheme() hook
 * const isDark = useSaraColorScheme() === 'dark';
 * const bgColor = getSaraColor('background', isDark);
 * ```
 */
export function getSaraColor(token: SaraColorToken, isDark: boolean): string | undefined {
  const prefix = isDark ? 'sara-dark' : 'sara';
  return tailwind.color(`${prefix}-${token}`);
}

/**
 * Get the Tailwind class name for a Sara color token.
 *
 * @param token - Sara color token (e.g., 'background', 'accent', 'text-primary')
 * @param isDark - Whether to use dark mode colors
 * @returns Tailwind class name without utility prefix (e.g., 'sara-background' or 'sara-dark-background')
 *
 * @example
 * ```tsx
 * // Usage with tailwind.style()
 * const isDark = useSaraColorScheme() === 'dark';
 * const bgClass = getSaraColorClass('background', isDark);
 * tailwind.style(`bg-${bgClass}`) // bg-sara-background or bg-sara-dark-background
 * ```
 */
export function getSaraColorClass(token: SaraColorToken, isDark: boolean): string {
  const prefix = isDark ? 'sara-dark' : 'sara';
  return `${prefix}-${token}`;
}
