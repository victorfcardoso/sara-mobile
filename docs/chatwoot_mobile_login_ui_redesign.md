# Chatwoot Mobile Login – Sara Branding Refresh

## Overview
- Date: November 2, 2025
- Scope: `sara-mobile` fork, login flow (`src/screens/auth/LoginScreen.tsx`) and shared CTA button (`src/components-next/button/Button.tsx`).
- Goal: align the mobile login with Sara AI’s brand system (beige canvas, navy typography, teal actions) while keeping the Sara-first authentication flow intact.

## Key Updates
- **Hero copy & layout**: replaced the upstream Chatwoot title with Sara messaging – headline now reads “WhatsApp assistant for scheduling” (Portuguese: “Assistente WhatsApp para agendamentos”) using the brand navy `#16273D`. The secondary paragraph keeps the existing bilingual scheduling blurb.
- **Removed info callout**: dropped the teal informational card and embedded mark to keep the screen minimal and avoid redundant copy about Chatwoot bridging.
- **Brand assets**: swapped the generic Chatwoot wordmark for `src/assets/images/sara_wordmark.png`; removed the supplementary mark from the page chrome.
- **Palette & surfaces**: set the background to the Sara off-white `#F8F5F3`, fields to white with mint border `#CCE6DE`, and helper links to muted slate `#566273`.
- **Primary CTA**: extended the shared `Button` component with `tone="brand"` to render the teal fill `#4CB6AC` and dark text, then applied it to the login button.
- **State helpers**: centralized style arrays/handlers (password toggle, helper links, bottom sheet props) to keep JSX tidy after the visual tweaks.

## 2 Nov 2025 – Follow-up polish
- Headline sub-copy now uses a sentence break instead of an em dash (`payments. All with Sara AI.`) to mirror the marketing tone; Portuguese copy was updated to match.
- Removed the in-form “Change URL” link so the screen stays focused on Sara-first auth; base URL can still be adjusted via the Configure URL route that auto-opens when unset.
- Increased the Sara wordmark footprint (216×64) so the hero lockup reads cleanly on modern devices.
- Refreshed app chrome: `assets/icon.png` now ships the new Sara mark from `workspace/assets/icon.icon`, the splash screen (`assets/splash.png`, beige `#F8F5F3` background) displays the same logo instead of the legacy Chatwoot art, and the iOS native assets (`ios/Chatwoot/Images.xcassets/{AppIcon.appiconset,SplashScreenLogo.imageset}`) mirror the same branding.
- iOS launch screen storyboard (`ios/Chatwoot/SplashScreen.storyboard`) and named color now share the Sara beige (`#F8F5F3`), so the native splash no longer flashes the Chatwoot palette before React loads.
- 2nd pass: splash artwork now centers the circular Sara mark (`assets/splash.png`, `ios/Chatwoot/Images.xcassets/SplashScreenLogo.imageset`) for brand consistency with the home screen icon.
- Latest tweak: increased the splash mark scaling (≈44% of canvas width on iOS, 50% on Expo) so the Sara profile disk reads larger on launch.

## Assets Referenced
- `src/assets/images/sara_wordmark.png` – rectangular wordmark added for the hero.
- `src/assets/images/sara_mark.png` – still available but no longer rendered on the login screen.

## Implementation Notes
- Sara-first auth flow and localization remain untouched; only presentation changed.
- New helper styles wrap Tailwind presets with Sara colors to simplify future brand updates.
- `Button` tone extension is backward compatible (defaults to existing variants).
- For brand-new tenants, make sure their `AgentsCredentials` row already contains the Chatwoot base URL, account id, inbox id, account PAT, and agent-bot secret before testing the screen—the backend only auto-mints the operator’s personal token when those fields are present.

## Testing / Validation
- Lint: `pnpm eslint src/screens/auth/LoginScreen.tsx` (passes).
- Visual: run a development build (`pnpm expo run:ios` or `pnpm expo run:android`). Expo Go will fail due to missing native Firebase modules; use a dev client instead.

## Follow-ups
- Capture fresh screenshots for internal docs / release notes once QA approves.
- If other screens need the teal CTA, reuse `tone="brand"` instead of duplicating styles.
- Consider migrating helper styles into a shared theme file if more Sara-specific layouts ship.

## 2 Nov 2025 – Settings screen palette refresh
- Brought the Settings shell (`SettingsScreen.tsx`) onto the Sara beige canvas `#F8F5F3`, aligned the status bar, and swapped the avatar block for a typography-first header with an availability pill.
- Restyled the header chrome (`SettingsHeader.tsx`) with navy text `#16273D` and a neutral divider `#E6E0D7` so the top bar stays beige without teal accents.
- Re-themed list rows (`components-next/list-components/SettingsList.tsx`) with beige dividers, navy primary copy, slate secondary copy, and a neutral press state so no cyan accents leak through the card surfaces.
- Footer string now reads `Sara <version>` to keep branding consistent across environments.
- Updated bottom tab icons (`src/svg-icons/tabs/*.tsx`) to render in Sara navy `#16273D` so the navigation buttons match the rest of the palette.

## 5 Nov 2025 – Settings info architecture update
- Settings data now hydrates from the Sara agent settings endpoint via `src/store/agent-settings`, so toggles reflect live CRM state.
- Trimmed the "Agent Profile" card to remove the redundant name/email block; plan tier now appears as a badge inside Preferences alongside the manager WhatsApp number for quicker editing.
- Rearranged Workflow, Scheduling, and Bot Configuration sections to show only actionable rows (WhatsApp Business, Stripe, Office hours, Availability blocks, Service catalog, Instructions), each styled with chevrons/badges that match the new list accessory API.
- Footer copy now shows `Sara 0.1`, giving operators a lightweight build indicator without the old CRM prefix.

## 2 Nov 2025 – Appointments tab MVP
- Replaced the placeholder view with a live feed of upcoming visits powered by the new backend endpoint (`GET /chatwoot/mobile/appointments`).  
  - The Redux slice (`src/store/appointments/*`) hydrates appointments, tracks pagination cursors, and dedupes records by `reservation_id`.  
  - Networking runs through the new Sara API client (`src/services/SaraAPIService.ts`) so every request attaches the Sara bearer token automatically.
- The screen (`src/screens/appointments/AppointmentsScreen.tsx`) now renders Sara-branded cards with status pills, patient info, location metadata, and badges for payment-required bookings.  
  - The status pill handles payment states, so the old “Payment required” chip was removed to avoid duplicate warnings.  
  - Supports pull-to-refresh, infinite scroll (cursor-based), error banners with retry, and localized empty states.  
  - Date strings use `date-fns` to format “Weekday, Month Day • HH:mm”, matching the CRM tone.
- Service names coming from the backend now fall back to the agent’s EasyAppointments catalog: `/chatwoot/mobile/appointments` enriches each record with the label stored on `AgentsCredentials.services`, so cards no longer show “Service not specified” when EA didn’t persist `service_name` in the appointment metadata.
- Translations for the new copy live under the `APPOINTMENTS` namespace in `src/i18n/{en,pt,pt_BR}.json`; other locales fall back to English.
- Backend dependency: deploy the FastAPI patch on `fix/template-delivery` (mobile appointments endpoint + Dynamo scan fallback when `AgentStartAtIndex` is missing) before shipping mobile builds, otherwise the client receives HTTP 500s.
- Data flow recap: mobile signs into Sara via `POST /auth/login`, bootstraps Chatwoot with `POST /chatwoot/mobile-auth`, then fetches appointments from `GET /chatwoot/mobile/appointments`. The backend resolves the active agent using `resolve_agent_id`, queries Dynamo through `AppointmentsDB.list_appointments_for_agent`, and returns a slim JSON (id, service, customer, ISO start/end, payment flags, pagination hints); if the Dynamo GSI is missing we fall back to a filtered scan so the call still succeeds.
- QA checklist:  
  1. Sign in with an operator that has appointments seeded.  
  2. Verify cards appear in chronological order and status colors match CRM.  
  3. Trigger pull-to-refresh and scroll to the end to validate pagination spinners.  
  4. Temporarily revoke the Chatwoot token to ensure the 401 flow logs the user out as expected.

## 3 Nov 2025 – Conversations tab palette refresh
- Updated the conversations shell (`src/screens/conversations/ConversationScreen.tsx`) to sit on the Sara beige canvas `#F8F5F3`, align the status bar tint, and recolor loaders/empty states with the teal accent `#4CB6AC`.
- Conversation header (`conversation-header/*`) now renders navy primary text, teal filter badges, a teal filter icon/handle accent, and a neutral divider `#E6E0D7` so the top bar matches the new Inbox and Settings treatments.
- Row chrome (`conversation-item/*`) adopts Sara typography colors: sender names in navy `#16273D`, message previews and timestamps in slate `#566273`, unread badges in teal, and dividers toned down to the neutral beige line.
- Supporting primitives (`LastActivityTime`, `ConversationId`, `UnreadIndicator`) use the same palette, eliminating the legacy cyan dividers and blue badges that previously broke the brand language.
