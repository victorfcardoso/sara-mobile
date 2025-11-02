# Sara Mobile Integration Log

This log tracks the Sara-branded fork of the Chatwoot mobile client. Update it whenever we tweak branding, environment variables, or native assets so future contributors can retrace the steps.

## Current State (November 2025)

- **Display Name & Bundle IDs**
  - `EXPO_PUBLIC_APP_NAME` → `Sara`
  - iOS bundle identifier: `com.vfc.sara`
  - Android package name mirrors the iOS ID (see `.env.example`).

- **Chatwoot Tenant**
  - Base URL: `https://chat.sara-ai.com.br`
  - `EXPO_PUBLIC_CHATWOOT_SSO_HOSTS` includes `chat.sara-ai.com.br` so the SSO button appears when pointed at our tenant.

- **Firebase**
  - The tenant-specific `GoogleService-Info.plist` lives in `firebase/`. Keep the Android `google-services.json` beside it when ready.

- **Expo / Metro**
  - Local dev server: `pnpm exec expo start --dev-client --tunnel`
  - Native builds: `pnpm exec expo run:ios -d` or open `ios/Chatwoot.xcworkspace` in Xcode.
  - We have **not** linked an Expo EAS project yet; leave `EXPO_PUBLIC_PROJECT_ID` blank until cloud builds are needed.

## Setup Checklist

1. Copy `.env.example` → `.env` and verify the Sara values above.
2. Run `pnpm install` (Corepack + pnpm already configured in the repo).
3. Whenever `.env` changes, regenerate native assets:
   ```bash
   pnpm exec expo prebuild -p ios
   cd ios && pod install
   ```
4. Launch the app, tap **Configure URL**, and enter `chat.sara-ai.com.br` before logging in with Chatwoot credentials.

## Open Items

- Add Android `google-services.json` once push notifications are configured.
- Decide if/when to register an Expo EAS project and populate `EXPO_PUBLIC_PROJECT_ID`.
- Capture updated screenshots/video after swapping final branding assets (icons, splash).
