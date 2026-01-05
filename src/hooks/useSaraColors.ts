import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { selectTheme } from '@/store/settings/settingsSelectors';
import type { RootState } from '@/store';
import type { Theme } from '@/types/common/Theme';

/**
 * Interface representing Sara color token values.
 */
export interface SaraColors {
  background: string;
  backgroundLight: string;
  accent: string;
  accentLight: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMeta: string;
  border: string;
  borderStrong: string;
  chip: string;
}

/**
 * Sara color tokens for light and dark themes.
 * These match the values defined in tailwind.config.ts.
 */
export const SARA_COLORS: Record<'light' | 'dark', SaraColors> = {
  light: {
    background: '#F8F5F3',
    backgroundLight: '#FFFFFF',
    accent: '#4CB6AC',
    accentLight: '#E6F5F4',
    accentMuted: 'rgba(76, 182, 172, 0.25)',
    textPrimary: '#16273D',
    textSecondary: '#4B5D6E',
    textMeta: '#6C778A',
    border: '#E6E2DD',
    borderStrong: '#D1CCC6',
    chip: '#F5F3F0',
  },
  dark: {
    background: '#1A1A1A',
    backgroundLight: '#2D2D2D',
    accent: '#4CB6AC',
    accentLight: '#1E3A38',
    accentMuted: 'rgba(76, 182, 172, 0.20)',
    textPrimary: '#F5F5F5',
    textSecondary: '#B8C4CE',
    textMeta: '#8899A6',
    border: '#3D3D3D',
    borderStrong: '#4D4D4D',
    chip: '#2A2A2A',
  },
};

export type SaraColorScheme = 'light' | 'dark';

/**
 * Resolves the effective color scheme based on user preference and system setting.
 * @param themeSetting - User's theme preference from settings ('system' | 'light' | 'dark')
 * @param systemColorScheme - System color scheme from useColorScheme()
 * @returns 'light' or 'dark'
 */
export function resolveColorScheme(
  themeSetting: Theme,
  systemColorScheme: 'light' | 'dark' | null | undefined,
): SaraColorScheme {
  if (themeSetting === 'light' || themeSetting === 'dark') {
    return themeSetting;
  }
  // 'system' setting - use system preference, default to light if unavailable
  return systemColorScheme ?? 'light';
}

/**
 * Hook that returns theme-aware Sara color values.
 *
 * Uses the user's theme preference from settings, falling back to system preference
 * when set to 'system'.
 *
 * @returns Object containing all Sara color values for the current theme
 *
 * @example
 * ```tsx
 * const colors = useSaraColors();
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.textPrimary }}>Hello</Text>
 * </View>
 * ```
 */
export function useSaraColors(): SaraColors {
  const themeSetting = useSelector((state: RootState) => selectTheme(state));
  const systemColorScheme = useColorScheme();

  const colorScheme = resolveColorScheme(themeSetting, systemColorScheme);

  return SARA_COLORS[colorScheme];
}

/**
 * Hook that returns the current effective color scheme.
 *
 * @returns 'light' or 'dark'
 */
export function useSaraColorScheme(): SaraColorScheme {
  const themeSetting = useSelector((state: RootState) => selectTheme(state));
  const systemColorScheme = useColorScheme();

  return resolveColorScheme(themeSetting, systemColorScheme);
}

/**
 * Hook that returns whether dark mode is currently active.
 *
 * @returns true if dark mode is active
 */
export function useIsDarkMode(): boolean {
  const colorScheme = useSaraColorScheme();
  return colorScheme === 'dark';
}
