# Sara Mobile Theming Guide

This document describes the theming system for Sara Mobile, including light/dark mode support and the `useSaraColors` hook.

## Overview

Sara Mobile supports three theme modes:
- **Light** — Warm cream backgrounds with teal accents (default)
- **Dark** — Dark backgrounds with adjusted text/border colors
- **System** — Follows device preference

The theme system consists of:
1. **Theme Context** (`src/context/ThemeContext.tsx`) — Manages theme preference and resolution
2. **Color Hook** (`src/hooks/useSaraColors.ts`) — Provides theme-aware colors
3. **Persistence** — Theme preference stored in Redux (`store/settings/settingsSlice`)

---

## Using the Theme System

### 1. Access Theme Settings

Use `useTheme()` from `ThemeContext` to get/set the user's theme preference:

```tsx
import { useTheme } from '@/context/ThemeContext';

function SettingsScreen() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  return (
    <View>
      {/* Current theme mode */}
      <Text>Theme: {theme}</Text>

      {/* Whether the current effective theme is dark */}
      <Text>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>

      {/* Set to a specific mode */}
      <Button onPress={() => setTheme('dark')} title="Dark" />
      <Button onPress={() => setTheme('light')} title="Light" />
      <Button onPress={() => setTheme('system')} title="System" />

      {/* Toggle between light/dark */}
      <Button onPress={() => toggleTheme()} title="Toggle" />
    </View>
  );
}
```

**Return values:**
- `theme: 'light' | 'dark' | 'system'` — User's explicit preference from settings
- `isDark: boolean` — The resolved effective theme (considers system setting)
- `setTheme(theme)` — Set user preference
- `toggleTheme()` — Switch between light/dark (ignores system mode)

### 2. Apply Theme-Aware Colors

Use `useSaraColors()` in components to get colors that adapt to the current theme:

```tsx
import { useSaraColors } from '@/hooks/useSaraColors';

function MyComponent() {
  const colors = useSaraColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Hello</Text>
    </View>
  );
}
```

**Available colors:**
```typescript
interface SaraColors {
  background: string;           // Main background (#F8F5F3 light / #1A1A1A dark)
  backgroundLight: string;      // Elevated surfaces (#FFFFFF / #2D2D2D)
  accent: string;               // Primary action color (#4CB6AC both modes)
  accentLight: string;          // Accent backgrounds (#E6F5F4 / #1E3A38)
  accentMuted: string;          // Subtle accent overlays
  textPrimary: string;          // Primary text (#16273D / #F5F5F5)
  textSecondary: string;        // Secondary text (#4B5D6E / #B8C4CE)
  textMeta: string;             // Meta/timestamp text (#6C778A / #8899A6)
  border: string;               // Dividers (#E6E2DD / #3D3D3D)
  borderStrong: string;         // Strong borders (#D1CCC6 / #4D4D4D)
  chip: string;                 // Chip backgrounds (#F5F3F0 / #2A2A2A)
}
```

### 3. Check Dark Mode Status

Use helper hooks to check if dark mode is active:

```tsx
import { useIsDarkMode, useSaraColorScheme } from '@/hooks/useSaraColors';

function MyComponent() {
  const isDark = useIsDarkMode();            // boolean
  const colorScheme = useSaraColorScheme();  // 'light' | 'dark'

  if (isDark) {
    // Dark-specific logic
  }

  return null;
}
```

---

## Color Tokens

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#F8F5F3` | Main screen backgrounds (warm cream) |
| `backgroundLight` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `accent` | `#4CB6AC` | Primary actions, icons, links (soft teal) |
| `accentLight` | `#E6F5F4` | Accent backgrounds, badges, highlights |
| `accentMuted` | `rgba(76, 182, 172, 0.25)` | Subtle teal overlays |
| `textPrimary` | `#16273D` | Headings, important text (navy) |
| `textSecondary` | `#4B5D6E` | Body text, descriptions |
| `textMeta` | `#6C778A` | Timestamps, metadata, captions |
| `border` | `#E6E2DD` | Dividers, card borders |
| `borderStrong` | `#D1CCC6` | Stronger separators |
| `chip` | `#F5F3F0` | Tag/chip backgrounds |

### Dark Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#1A1A1A` | Main screen backgrounds |
| `backgroundLight` | `#2D2D2D` | Cards, modals, elevated surfaces |
| `accent` | `#4CB6AC` | Primary actions (unchanged for brand consistency) |
| `accentLight` | `#1E3A38` | Darker accent backgrounds |
| `accentMuted` | `rgba(76, 182, 172, 0.20)` | Subtle teal overlays (lower opacity) |
| `textPrimary` | `#F5F5F5` | Headings, bright text |
| `textSecondary` | `#B8C4CE` | Body text |
| `textMeta` | `#8899A6` | Timestamps, metadata |
| `border` | `#3D3D3D` | Dividers |
| `borderStrong` | `#4D4D4D` | Stronger separators |
| `chip` | `#2A2A2A` | Chip backgrounds |

---

## Common Patterns

### Card Component

```tsx
import { useSaraColors } from '@/hooks/useSaraColors';
import { View, Text } from 'react-native';

export function Card({ title, children }) {
  const colors = useSaraColors();

  return (
    <View
      style={{
        backgroundColor: colors.backgroundLight,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
      }}
    >
      {title && (
        <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
```

### Button with Accent

```tsx
import { useSaraColors } from '@/hooks/useSaraColors';
import { TouchableOpacity, Text } from 'react-native';

export function AccentButton({ label, onPress }) {
  const colors = useSaraColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: colors.backgroundLight, fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
```

### Conditional Styling Based on Dark Mode

```tsx
import { useIsDarkMode } from '@/hooks/useSaraColors';
import { View, Text } from 'react-native';

export function AdaptiveComponent() {
  const isDark = useIsDarkMode();

  return (
    <View
      style={{
        opacity: isDark ? 0.8 : 1,
        // Other theme-specific adjustments
      }}
    >
      <Text>{isDark ? 'Dark mode active' : 'Light mode active'}</Text>
    </View>
  );
}
```

---

## Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
<View style={{ backgroundColor: '#F8F5F3' }}>
  <Text style={{ color: '#16273D' }}>Text</Text>
</View>
```

**After:**
```tsx
import { useSaraColors } from '@/hooks/useSaraColors';

function MyComponent() {
  const colors = useSaraColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Text</Text>
    </View>
  );
}
```

### From `tailwind.style()` (Light Mode Only)

**Before:**
```tsx
<View style={tailwind.style('bg-sara-background')}>
  {/* Only works in light mode */}
</View>
```

**After:**
```tsx
import { useSaraColors } from '@/hooks/useSaraColors';

function MyComponent() {
  const colors = useSaraColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      {/* Works in all modes */}
    </View>
  );
}
```

---

## Implementation Details

### ThemeContext

Located at `src/context/ThemeContext.tsx`:
- Provides `ThemeProvider` wrapper for the app
- Exposes `useTheme()` hook to access/modify theme preference
- Resolves effective theme (system mode considers device preference)
- Persists preference to Redux

### useSaraColors Hook

Located at `src/hooks/useSaraColors.ts`:
- `useSaraColors()` — Returns current theme's color values
- `useSaraColorScheme()` — Returns resolved color scheme ('light' | 'dark')
- `useIsDarkMode()` — Returns boolean indicating if dark mode is active
- `resolveColorScheme()` — Helper function to determine effective color scheme

### SARA_COLORS Constant

Defined in `src/hooks/useSaraColors.ts`:
- Maps theme ('light' | 'dark') to complete color palette
- Source of truth for all color values
- Can be imported directly if needed

### Redux Integration

Theme preference stored in `store/settings/settingsSlice`:
- `theme` field holds user's explicit preference
- Persisted via `redux-persist` (survives app restart)
- Updated via `setTheme` action

---

## Best Practices

1. **Always use `useSaraColors` for new components** — Ensures dark mode support from day one
2. **Never hardcode hex values** — Use color tokens
3. **Keep theme logic centralized** — Use hooks instead of duplicating color logic
4. **Prefer color hooks over Tailwind for dynamic styling** — Tailwind classes only work for light mode
5. **Test both themes** — Verify appearance in light and dark modes
6. **Use accent sparingly** — Accent color should draw attention to primary actions
7. **Maintain contrast** — Ensure text is readable in both modes (use `textPrimary` for headings, `textSecondary` for body)

---

## Known Limitations

- **Tailwind classes** (`bg-sara-*`) only work in light mode. For dark mode support, use `useSaraColors()`.
- **System mode detection** relies on `react-native`'s `useColorScheme()`. May not update in real-time on some devices.
- **Existing screens** using hardcoded colors or Tailwind-only styling won't automatically support dark mode. Gradual migration recommended.

---

## Testing

When testing theme-aware components:
1. Render with different theme settings
2. Use `useTheme()` to programmatically switch themes
3. Verify visual appearance in both light and dark modes
4. Check contrast and readability

Example:
```tsx
// In Jest test
const { getByText } = render(
  <Provider store={store}>
    <ThemeProvider>
      <MyComponent />
    </ThemeProvider>
  </Provider>
);

// Simulate theme change via Redux dispatch
store.dispatch(setTheme('dark'));
```

---

## Related Files

- `src/context/ThemeContext.tsx` — Theme provider and hook
- `src/hooks/useSaraColors.ts` — Color hooks and constants
- `src/types/common/Theme.ts` — Theme type definition
- `src/theme/tailwind.config.ts` — Light mode color definitions
- `src/store/settings/settingsSlice.ts` — Theme preference persistence
