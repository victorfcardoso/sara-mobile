# Sara Mobile Splash Screen Configuration

## Overview

The Sara Mobile splash screen is a two-layer system:
1. **Native splash screen** (Expo) - shown immediately when app launches
2. **Custom React splash overlay** - displayed while fonts load, then fades out

## Sara Brand Colors

All splash screen colors use Sara theme tokens (defined in `src/theme/tailwind.config.ts`):

| Token | Value | Usage |
|-------|-------|-------|
| `sara-background` | `#F8F5F3` | Splash background (cream) |
| `sara-accent` | `#4CB6AC` | Logo mark color (teal) |
| `sara-text-primary` | `#16273D` | Logo text color (dark blue) |

## Configuration Files

### 1. app.config.ts (Native Splash Configuration)

**Location:** `/app.config.ts`

```typescript
splash: {
  image: './assets/splash.png',      // Splash screen image
  resizeMode: 'contain',              // Image scaling mode
  backgroundColor: '#F8F5F3',         // Sara cream background
  enableFullScreenImage_legacy: true, // Legacy full screen support
}
```

**Key Settings:**
- **resizeMode**: `contain` ensures the image scales proportionally without cropping
- **backgroundColor**: Sara cream (#F8F5F3) matches the custom splash overlay
- **image**: Points to PNG asset at `./assets/splash.png`

**Platform-Specific:**
- **Android**: Adaptive icon also uses Sara background (#F8F5F3)
  ```typescript
  adaptiveIcon: {
    foregroundImage: './assets/adaptive-icon.png',
    backgroundColor: '#F8F5F3'
  }
  ```
- **iOS**: No additional splash config needed, uses main config

### 2. src/navigation/index.tsx (Custom React Splash Overlay)

**Location:** `src/navigation/index.tsx`

The custom splash overlay displays after native splash:

```typescript
// Color values from Sara theme tokens
const saraBackgroundColor = tailwind.color('sara-background');

// Splash overlay (z-index: 999, covers entire screen)
<Animated.View style={[styles.splashOverlay, { opacity: splashOpacity }]}>
  <View style={styles.splashContent}>
    <SaraWordmark
      height={56}
      markColor={tailwind.color('sara-accent')}
      textColor={tailwind.color('sara-text-primary')}
    />
  </View>
</Animated.View>
```

**Styling:**
```typescript
splashOverlay: {
  ...StyleSheet.absoluteFillObject,  // Full screen
  zIndex: 999,                       // On top
  backgroundColor: saraBackgroundColor, // Sara cream
}
```

**Fade Animation:**
- Shows for ~800ms while fonts load
- 300ms fade-out transition when fonts ready
- `opacity: splashOpacity` (Animated.Value)

### 3. src/screens/auth/LoginScreen.tsx (Login Screen Background)

**Location:** `src/screens/auth/LoginScreen.tsx`

The login screen also uses Sara background colors for visual continuity:

```typescript
<StatusBar
  translucent
  backgroundColor={tailwind.color('sara-background')}
  barStyle="dark-content"
/>
```

**StyleSheet:**
```typescript
container: {
  backgroundColor: saraBackgroundColor,
}
heroTitle: {
  color: saraTextPrimary,
}
heroSubtitle: {
  color: saraTextSecondary,
}
inputField: {
  backgroundColor: saraBackgroundLightColor, // White
}
forgotPassword: {
  color: saraAccent, // Teal accent
}
```

## Splash Screen Image Asset

**Location:** `./assets/splash.png`

**Specifications:**
- Format: PNG with transparency
- Aspect Ratio: ~4:1 (width:height) - 1080x270 recommended for Android
- Content: Sara logo mark (teal circle with woman's profile silhouette) centered on white area
- Background: Transparent or white - the app background color fills the rest

**Design Notes:**
- The image displays on a cream background (#F8F5F3)
- For best quality, use high DPI versions for different screen densities
- Expo handles platform-specific scaling via `resizeMode: 'contain'`

## Transition Timeline

```
1. App Launch (0ms)
   ↓
2. Expo Native Splash (visible during bridge boot)
   ├─ Background: #F8F5F3 (sara-background)
   └─ Image: assets/splash.png (Sara logo)
   ↓
3. React App Loads (~200-400ms)
   ├─ AppNavigationContainer mounts
   └─ Font loading begins
   ↓
4. Custom Splash Overlay (0-800ms)
   ├─ SaraWordmark + white background
   └─ While fonts load
   ↓
5. Fonts Loaded (200-800ms)
   ├─ Hide ExpoSplashScreen (native)
   ├─ 800ms delay
   └─ Fade out custom overlay (300ms)
   ↓
6. App Ready (1100-1400ms)
   └─ Main navigation visible
```

## Device Scaling

### Android
- Splash uses `resizeMode: 'contain'` for proportional scaling
- Adaptive icon background (#F8F5F3) displays on edges
- Supports multiple DPI buckets (ldpi, mdpi, hdpi, xhdpi, etc.)

### iOS
- Full screen image scaled to device dimensions
- Safe area respected (notch, home indicator)
- Retina (2x, 3x) assets auto-selected

### Responsive Behavior
- Landscape & Portrait: Both orientations supported
- Tablets: Content scales proportionally
- Notches/Safe Areas: Respected via Expo configuration

## Best Practices

1. **Always use Sara theme tokens**
   ```typescript
   // Good
   backgroundColor: tailwind.color('sara-background')

   // Bad
   backgroundColor: '#F8F5F3'
   ```

2. **Keep splash loading fast**
   - Minimize font loading time
   - Pre-load critical assets
   - Use small PNG images (compress with `optipng` or similar)

3. **Ensure visual continuity**
   - Native splash → Custom overlay → Login screen should have seamless background color
   - All use #F8F5F3 (sara-background)

4. **Test on real devices**
   - Different screen sizes & safe areas
   - Orientation changes
   - Background transitions

## Testing Checklist

- [ ] Native splash displays with correct background (#F8F5F3)
- [ ] Custom overlay fades in smoothly
- [ ] Logo displays with correct colors (teal mark, dark text)
- [ ] Fonts load within 1-2 seconds
- [ ] Overlay fades out before app appears
- [ ] Login screen background matches splash (no color jump)
- [ ] iOS: Notch/safe area respected
- [ ] Android: Adaptive icon shows correctly on edges
- [ ] Landscape orientation works without distortion
- [ ] No flash or flicker between splash layers

## Configuration References

- **Expo Splash Docs**: https://docs.expo.dev/develop/user-interface/splash-screen/
- **Expo SplashScreen API**: https://docs.expo.dev/versions/latest/sdk/splash-screen/
- **App Config**: `/app.config.ts` (lines 42-47)
- **Navigation Splash Logic**: `src/navigation/index.tsx` (lines 46-205)
- **Theme Tokens**: `src/theme/tailwind.config.ts` (lines 14-29)
