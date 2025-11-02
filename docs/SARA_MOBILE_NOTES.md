# Sara Mobile Integration Log

This log tracks the Sara-branded fork of the Chatwoot mobile client. Update it whenever we tweak branding, environment variables, or native assets so future contributors can retrace the steps.

## Current State (November 2025)

- **Display Name & Bundle IDs**
  - `EXPO_PUBLIC_APP_NAME` → `Sara`
  - iOS bundle identifier: `com.vfc.sara`
  - Android package name mirrors the iOS ID (see `.env.example`).

- **Chatwoot Tenant**
  - Base URL: `https://chat.sara-ai.com.br`
  - Expo config seeds this URL into the Redux store on first launch, so users land directly on the login screen.
  - SSO buttons are hidden by default; Sara-first login handles authentication via `/auth/login` + `/chatwoot/mobile-auth`.
- **Sara API**
  - Set `EXPO_PUBLIC_SARA_API_BASE_URL` to the FastAPI base (e.g., `https://app.sara-ai.com`).
  - Each operator needs a `chatwoot_api_access_token` stored on their user record so the mobile client can pull `/api/v1/profile`.

- **Firebase**
  - The tenant-specific `GoogleService-Info.plist` lives in `firebase/`. Keep the Android `google-services.json` beside it when ready.
  - Always download the plist from Firebase using the Sara bundle id (`com.vfc.sara`). Placeholder values will crash at launch (`FIRApp configure`).

- **Expo / Metro**
  - Local dev server: `pnpm exec expo start --dev-client --tunnel`
  - Native builds: `pnpm exec expo run:ios -d` or open `ios/Chatwoot.xcworkspace` in Xcode.
  - We have **not** linked an Expo EAS project yet; leave `EXPO_PUBLIC_PROJECT_ID` blank until cloud builds are needed.

## Setup Checklist

1. Copy `.env.example` → `.env` and verify the Sara values above (including `EXPO_PUBLIC_SARA_API_BASE_URL`).
2. Run `pnpm install` (Corepack + pnpm already configured in the repo).
3. Whenever `.env` changes, regenerate native assets:
   ```bash
   pnpm exec expo prebuild -p ios
   cd ios && pod install
   ```
4. Drop the real `firebase/GoogleService-Info.plist` (and, when ready, Android’s `google-services.json`). Never commit the production plist to git—share via the secrets vault.
5. Launch the app; the Sara tenant URL is already pre-filled. Use the **Change server** option in Settings only when debugging.

## Open Items

- Add Android `google-services.json` once push notifications are configured.
- Decide if/when to register an Expo EAS project and populate `EXPO_PUBLIC_PROJECT_ID`.
- Capture updated screenshots/video after swapping final branding assets (icons, splash).
