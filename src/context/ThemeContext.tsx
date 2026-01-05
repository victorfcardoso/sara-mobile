import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

import { Theme } from '@/types/common/Theme';
import { selectTheme } from '@/store/settings/settingsSelectors';
import { setTheme as setThemeAction } from '@/store/settings/settingsSlice';
import { useAppDispatch } from '@/hooks';

interface ThemeContextValue {
  /** Current theme setting: 'light', 'dark', or 'system' */
  theme: Theme;
  /** Whether the resolved theme is dark mode */
  isDark: boolean;
  /** Set theme to a specific value */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const storedTheme = useSelector(selectTheme);

  // Resolve the effective theme based on setting and system preference
  const isDark = useMemo(() => {
    if (storedTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return storedTheme === 'dark';
  }, [storedTheme, systemColorScheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      dispatch(setThemeAction(newTheme));
    },
    [dispatch],
  );

  const toggleTheme = useCallback(() => {
    // When toggling, we switch between light and dark directly
    // If currently on system, we resolve to the opposite of current appearance
    const newTheme = isDark ? 'light' : 'dark';
    dispatch(setThemeAction(newTheme));
  }, [dispatch, isDark]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: storedTheme,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [storedTheme, isDark, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access theme context.
 * @returns ThemeContextValue with theme, isDark, setTheme, and toggleTheme
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      'useTheme: ThemeContext is undefined. Ensure the component is wrapped in ThemeProvider.',
    );
  }
  return context;
};
