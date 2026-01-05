# Sara Mobile Architecture Overview

> Last updated: 5 Nov 2025  
> Audience: teammates & LLM agents bringing Sara branding to the Chatwoot mobile fork.

## 1. High-Level Layout

- **App shell** — `App.tsx` bootstraps Redux, restores persisted state, and calls `bootstrapInstallationUrl` so a default Chatwoot tenant is available before the UI renders. Wraps app in `ThemeProvider` for theme support.
- **Navigation** — `src/navigation` wraps React Navigation. `AppTabs` chooses between the logged-in tab navigator and the `AuthStack` (login/reset MFAs). Deep linking and SSO callbacks are handled in `src/navigation/index.tsx`.
- **State management** — Redux Toolkit + `redux-persist`. Feature slices live under `src/store/<domain>`; `src/store/reducers.ts` combines them. `settingsSlice` seeds URLs (installation/base/websocket), theme preference, and Redux thunks in `settingsActions.ts` talk to the Chatwoot API. The new `agent-settings` slice (`src/store/agent-settings/*`) talks to the Sara API (`/agents/{id}`) so the Settings screen mirrors CRM toggles (payment required, doctor confirmation, integrations) in real time. Persistence uses `persistStorage` (`AsyncStorage` with an in-memory fallback) so the app still boots if the native storage sandbox isn't writable on a dev client.
- **Theming** — `src/context/ThemeContext.tsx` manages light/dark/system theme preference. `src/hooks/useSaraColors.ts` provides theme-aware colors. Components should use `useSaraColors()` hook for dark mode support; see `docs/THEMING.md`.
- **Networking** — `src/services/APIService.ts` configures Axios per request, pulling the current `installationUrl` from state. ActionCable websockets are managed by `src/utils/actionCable.ts` when the user is logged in.
- **UI layer** — Components follow upstream Chatwoot conventions (`src/components-next`, `src/screens`). Tailwind via `twrnc` drives light-mode styling; use `useSaraColors()` for theme-aware components.
- **FAQ inspector** — Settings → FAQ counts entries from the inline instruction block and displays them through `src/screens/settings/FaqScreen.tsx`, which relies on `src/utils/faq.ts` to parse `### FAQ (GROUND TRUTH)`.

## 2. Directory Cheat Sheet

| Path | Purpose |
| ---- | ------- |
| `src/app.tsx` | Entry point, registers store + persistence, seeds tenant defaults. |
| `src/config/` | `chatwootConfig.ts` reads Expo `extra` → builds installation/base/websocket URLs; `appConfig.ts` exposes scheme/env accessors; `cognitoConfig.ts` resolves Cognito env values. |
| `src/context/ThemeContext.tsx` | Theme provider managing user preference (light/dark/system) and resolution. |
| `src/hooks/useSaraColors.ts` | Hook providing theme-aware Sara color tokens for components. |
| `src/store/settings/` | Installation URL bootstrap (`bootstrap.ts`), slice reducers, async thunks, selectors; includes theme preference persistence. |
| `src/navigation/` | Navigation containers, tab stack, onboarding vs. main app routing, deep-link logic. |
| `src/screens/auth/` | Login, configure URL (kept for support), MFA, reset password. |
| `src/utils/` | Helpers for SSO, push notifications, websocket connectors, etc. |
| `src/theme/` | Color definitions, Tailwind config, styling utilities. |
| `docs/SARA_MOBILE_NOTES.md` | Running log (env values, Firebase asset locations, setup checklist). |
| `docs/THEMING.md` | Complete guide to the theming system, dark mode, and `useSaraColors` hook. |
| `docs/SARA_MOBILE_ARCHITECTURE.md` (this file) | Architectural context for future maintainers. |

## 3. Runtime Configuration

- Expo dynamic config (`app.config.ts`) now exposes `extra.defaultInstallationUrl` sourced from `.env` (`EXPO_PUBLIC_CHATWOOT_BASE_URL`). `chatwootConfig.ts` prefers this value, giving us Option A (no Configure URL screen on first launch).
- `.env` controls bundle IDs, package names, intent filters, and SSO hosts. Expo only expands `EXPO_PUBLIC_*`, so secrets stay out of these variables.
- `EXPO_PUBLIC_SARA_API_BASE_URL` points the app at the Sara backend. `src/config/saraConfig.ts` reads this value (or the Expo extra) so we can call `/chatwoot/mobile-auth` before touching Chatwoot.
- `EXPO_PUBLIC_COGNITO_USER_POOL_ID` and `EXPO_PUBLIC_COGNITO_CLIENT_ID` configure the Cognito client used for operator sign-in.
- Firebase:
  - iOS plist expected at `firebase/GoogleService-Info.plist`.
  - Android `google-services.json` to be placed alongside when ready.
  - Use Firebase Console to generate files for bundle id `com.vfc.sara` / package `com.sara.conversations`. Placeholder plists crash (`FIRApp configure`).
- Patching:
  - `patches/expo-modules-core.patch` applies `NS_ASSUME_NONNULL` fixes so Xcode 16 builds succeed.
  - `patches/ffmpeg-kit-react-native.patch` aligns upstream Expo settings.

## 4. Login → Conversations Flow

1. **Bootstrap** — `PersistGate` restores state; if `installationUrl` is missing, `bootstrapInstallationUrl()` dispatches `ensureInstallationDefaults` so Redux copies the Expo-configured defaults.
2. **Auth stack** — With a seeded installation URL, `LoginScreen` jumps straight to email/password auth. If the URL is blank (support/debug), user is redirected to `ConfigURLScreen`.
3. **Authentication** — `authActions.login` signs the operator in with Cognito (ID token), then exchanges that token for `/chatwoot/mobile-auth` so we receive the agent's `api_access_token`, installation URL, and account metadata. The mobile client immediately fetches `/api/v1/profile` with that token to hydrate the Chatwoot `User` state.
   - `/chatwoot/mobile-auth` provisions the Chatwoot personal access token on the fly when the linked `AgentsCredentials` row already carries the Chatwoot connection fields (`chatwoot_api_base`, `chatwoot_account_id`, `chatwoot_inbox_id`, `chatwoot_api_token`, `chatwoot_agentbot_webhook_secret`). If those fields are missing the endpoint returns HTTP 409 and the client surfaces a login failure; populate them during onboarding before the first mobile sign-in.
4. **Post-login** — With the Chatwoot session cached in Redux, `AppTabs` loads inboxes, labels, and configures ActionCable using `settingsSelectors.selectWebSocketUrl`.
5. **Conversations** — `ChatScreen` consumes state from `conversation/...` slices. Deep links from notifications use the linking config buried in `AppNavigationContainer`.

## 5. Networking & Realtime

- **REST** — All API calls go through `APIService` (Axios). The interceptor pulls the Chatwoot installation URL + `api_access_token` from the Sara-backed session and rewrites routes to `api/v1/accounts/<account_id>/…`.
- **Sara CRM API** — `src/services/SaraAPIService.ts` now injects both the Sara bearer token and the active agent’s `X-Agent-Id` header on every request (unless a call overrides it). This keeps mobile CRM reads aligned with the React Admin surface when users manage multiple tenants.
- **ActionCable** — `src/utils/actionCable.ts` connects to `webSocketUrl` (derived as `wss://<install>/cable`). Credentials (`pubSubToken`, `accountId`) are sourced from Redux selectors.
- **Push notifications** — Firebase Cloud Messaging via `@react-native-firebase/messaging`. Device registration happens inside `settingsActions.saveDeviceDetails`.
- **SSO** — `SsoUtils` now only surfaces error toasts if the legacy `/app/login/sso` flow fires unexpectedly; the primary path is Sara-first login.

## 6. Build & Dev Workflow

- Package manager: **pnpm**. Enable via `corepack enable` before running `pnpm install`.
- Local dev: `pnpm exec expo start --dev-client --tunnel`.
- Native builds:
  ```bash
  pnpm exec expo prebuild -p ios
  cd ios && pod install
  pnpm exec expo run:ios -d   # or run from Xcode
  ```
  Repeat prebuild + pod install whenever `.env` or native config changes.
- Testing: upstream project still ships some failing storybook/spec TS checks (`pnpm exec tsc --noEmit` fails on known issues). No Sara-specific tests added yet.

## 7. Known Quirks / Gotchas

- **Agent onboarding prerequisite** — New tenants must have Chatwoot fields set on their `AgentsCredentials` item *before* first mobile login; otherwise `/chatwoot/mobile-auth` can’t mint the PAT and the app shows “username/password incorrect.” Seed the base URL, account id, inbox id, account PAT, and agent-bot secret during CRM onboarding.
- **Firebase config** — Always replace placeholders before running on device; otherwise the app crashes at launch with `com.firebase.core`.
- **TypeScript warnings** — `tsc` currently fails on storybook and spinner types; track upstream for fixes before enforcing.
- **Expo patching** — After pulling new dependencies, rerun `pnpm install` so patch packages apply.
- **URL reconfiguration** — “Configure URL” screen remains available in Settings for support, but first-run flow is hard-wired to Sara’s tenant.

## 8. Related References

- [Chatwoot Mobile README](https://github.com/chatwoot/chatwoot-mobile-app) — upstream instructions, SDK versions.
- [SARA_MOBILE_NOTES](./SARA_MOBILE_NOTES.md) — environment specifics & change log.
- `AGENTS.md` (repo root) — cross-repo coordination guide (backend + mobile).

Keep this document updated whenever we introduce new flows (e.g., push notification customizations, Expo EAS adoption, Android branding) so future assistants can reason about the project quickly.
