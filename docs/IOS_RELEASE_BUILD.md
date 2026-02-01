# iOS Release Build (Standalone, No Metro)

This document describes how to build the Sara app for iOS as a standalone release that runs without Metro bundler.

## Prerequisites

- Apple Developer account (VFC Tecnologia)
- Xcode installed
- Physical iPhone connected via USB
- EAS CLI installed (`eas --version`)

## Quick Build Commands

```bash
cd /Users/victorfcardoso/Documents/sara/workspace/sara-mobile/ios

# Build for connected iPhone (Release mode, with Sentry upload disabled)
SENTRY_DISABLE_AUTO_UPLOAD=true xcodebuild \
  -workspace Sara.xcworkspace \
  -scheme Sara \
  -configuration Release \
  -destination "id=00008140-001E2D480A84801C" \
  build

# Install on device
xcrun devicectl device install app \
  --device 00008140-001E2D480A84801C \
  ~/Library/Developer/Xcode/DerivedData/Sara-*/Build/Products/Release-iphoneos/Sara.app

# Launch app (phone must be unlocked)
xcrun devicectl device process launch \
  --device 00008140-001E2D480A84801C \
  br.com.saraai.app
```

## Finding Your Device ID

```bash
# List connected devices
xcrun xctrace list devices 2>&1 | grep -E "(iPhone|iPad)"

# Check USB-connected iPhones
system_profiler SPUSBDataType 2>/dev/null | grep -A5 "iPhone"
```

## Key Findings

### 1. Sentry Upload Breaks Bundling

The Sentry CLI tries to upload source maps during Release builds. If Sentry org/project isn't configured, **the JS bundle won't be created** and the app will crash on launch with:

```
No bundle URL present.
Make sure you're running a packager server or have included a .jsbundle file in your application bundle.
```

**Solution:** Set `SENTRY_DISABLE_AUTO_UPLOAD=true` when building.

### 2. Debug vs Release Configuration

| Configuration | JS Bundle | Metro Required |
|---------------|-----------|----------------|
| Debug | Not embedded | Yes (localhost:8081) |
| Release | Embedded in app | No |

The `AppDelegate.mm` controls this behavior:
```objc
- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}
```

### 3. Verify Bundle Is Included

After building, verify the bundle exists in the app:

```bash
ls -la ~/Library/Developer/Xcode/DerivedData/Sara-*/Build/Products/Release-iphoneos/Sara.app/main.jsbundle
```

Should show ~7-8MB file. If missing, check build logs for bundling errors.

### 4. Clear Derived Data If Issues

```bash
# Quit Xcode first, then:
rm -rf ~/Library/Developer/Xcode/DerivedData/Sara-*
```

## Troubleshooting

### App crashes immediately after launch

1. Check if `main.jsbundle` exists in the app bundle
2. Look for Sentry errors in build log: `grep -E "sentry|error" /tmp/build.log`
3. Rebuild with `SENTRY_DISABLE_AUTO_UPLOAD=true`

### "Database is locked" error

Xcode has the project open. Quit Xcode (`pkill -9 Xcode`) before running xcodebuild.

### Device not found

1. Ensure iPhone is connected via USB
2. Trust the computer on the iPhone
3. Get correct device ID with `xcrun xctrace list devices`

## Alternative: Using Xcode UI

1. Open `ios/Sara.xcworkspace` in Xcode
2. Select Sara target → Signing & Capabilities → Team: VFC Tecnologia
3. Product → Scheme → Edit Scheme → Run → Build Configuration: **Release**
4. Select your iPhone as destination
5. Build & Run (⌘R)

Note: Xcode UI builds may still fail due to Sentry. Use command line with env var for reliable builds.
