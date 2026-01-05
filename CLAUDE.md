# Claude Code Guidelines for Sara Mobile

This is the Sara-branded fork of the Chatwoot mobile client (React Native/Expo).

## Sara Ecosystem

Sara Mobile is part of the Sara platform. See `../cb2/CLAUDE.md` for backend details.

| Term | Meaning |
|------|---------|
| **Customer** | Patient/client booking appointments |
| **User** | Doctor/clinic owner using the mobile app |
| **Agent** | Tenant configuration (one doctor/clinic) |

### URLs
- **Sara API (dev)**: `https://api-dev.sara-ai.com.br`
- **Chatwoot**: `https://chat.sara-ai.com.br`
- **CRM**: `https://crm.sara-ai.com.br`

## Key Documentation

- **[AGENTS.md](./AGENTS.md)** - Repository guidelines, build commands, coding conventions
- **[docs/SARA_MOBILE_ARCHITECTURE.md](./docs/SARA_MOBILE_ARCHITECTURE.md)** - Architecture overview, auth flow, networking
- **[docs/SARA_MOBILE_NOTES.md](./docs/SARA_MOBILE_NOTES.md)** - Integration log, environment setup, open items
- **[docs/E2E_TESTING.md](./docs/E2E_TESTING.md)** - Maestro E2E testing setup and usage

## API Integration

### Sara API Endpoints (via `SaraAPIService`)
| Endpoint | Purpose |
|----------|---------|
| `/chatwoot/mobile-auth` | SSO authentication |
| `/chatwoot/mobile/appointments` | Appointments list |
| `/notifications` | Notification center |

### Notification Types
```typescript
// From Sara API /notifications endpoint
type NotificationType =
  | 'doctor.decision_required'      // Needs doctor approval
  | 'booking.confirmed'             // Booking confirmed
  | 'booking.cancelled_by_patient'  // Patient cancelled
  | 'booking.cancelled_by_doctor'   // Doctor cancelled
  | 'booking.rescheduled'           // Rescheduled
  | 'payment.awaiting'              // Payment pending
  | 'conversation.escalate_to_human'// Bot escalated
  | 'conversation.first_message';   // New contact
```

### Services
- `src/services/SaraAPIService.ts` - Sara backend API client
- `src/services/APIService.ts` - Chatwoot API client
- `src/store/notification/saraNotificationService.ts` - Sara notifications

## Design System

Sara uses a **warm, approachable color palette** with **dark mode support**. Colors are defined in `src/theme/tailwind.config.ts` for light mode and managed dynamically via the `useSaraColors` hook for theme-aware components.

### Light Mode Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `sara-background` | `#F8F5F3` | Main screen backgrounds |
| `sara-background-light` | `#FFFFFF` | Cards, modals |
| `sara-accent` | `#4CB6AC` | Primary actions, icons |
| `sara-accent-light` | `#E6F5F4` | Accent backgrounds, badges |
| `sara-text-primary` | `#16273D` | Headings, important text |
| `sara-text-secondary` | `#4B5D6E` | Body text, descriptions |
| `sara-text-meta` | `#6C778A` | Timestamps, metadata |
| `sara-border` | `#E6E2DD` | Dividers, card borders |
| `sara-chip` | `#F5F3F0` | Tag/chip backgrounds |

### Dark Mode Tokens

Dark mode includes adjusted colors for better contrast while maintaining the Sara aesthetic:
- `background`: `#1A1A1A`, `backgroundLight`: `#2D2D2D`
- `textPrimary`: `#F5F5F5`, `textSecondary`: `#B8C4CE`
- `accentLight`: `#1E3A38` (darker tint)
- Accent stays the same: `#4CB6AC`

### Usage

#### For static Tailwind classes (light mode only):
```tsx
tailwind.style('bg-sara-background text-sara-text-primary')
tailwind.color('sara-accent')  // returns '#4CB6AC'
```

#### For theme-aware components (preferred):
```tsx
import { useSaraColors } from '@/hooks/useSaraColors';

function MyComponent() {
  const colors = useSaraColors();
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textPrimary }}>Theme-aware text</Text>
    </View>
  );
}
```

#### Check if dark mode is active:
```tsx
import { useIsDarkMode, useSaraColorScheme } from '@/hooks/useSaraColors';

const isDark = useIsDarkMode();           // boolean
const scheme = useSaraColorScheme();      // 'light' | 'dark'
```

### Theme Context & Settings

The app provides a `ThemeProvider` context (in `src/context/ThemeContext.tsx`) that manages theme preference and resolution:

```tsx
import { useTheme } from '@/context/ThemeContext';

function SettingsScreen() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  // theme: 'system' | 'light' | 'dark' (user preference)
  // isDark: boolean (resolved theme)

  setTheme('dark');              // Set theme explicitly
  toggleTheme();                 // Toggle between light/dark
}
```

The theme preference is persisted in Redux (`store/settings/settingsSlice`).

### Design Principles

1. **Use `useSaraColors` for new components** - Use theme-aware hook instead of hardcoded hex values
2. **Centralize colors** - Never hardcode hex values; use either `useSaraColors` hook or `sara-*` Tailwind tokens
3. **Warm aesthetic** - Cream backgrounds, soft teal accents (spa/wellness vibe)
4. **Follow upstream patterns** - Reuse Chatwoot component conventions from `src/components-next`
5. **Dark mode ready** - Existing Tailwind classes only work in light mode; new UI should use `useSaraColors` for dark mode support

## Quick Commands

```bash
pnpm install          # Install dependencies
pnpm start            # Start Metro bundler
pnpm run:ios          # Run on iOS simulator
pnpm run:android      # Run on Android emulator
pnpm lint             # Check code style
pnpm test             # Run unit tests (Jest)
pnpm e2e              # Run all E2E tests (Maestro)
pnpm e2e:smoke        # Run login smoke test
```

## iOS Simulator Skill

Installed at `~/.claude/skills/ios-simulator-skill`. Provides semantic UI navigation using accessibility APIs.

**Requires Python 3.12** (fb-idb incompatible with 3.14):
```bash
# Wrapper script (uses Python 3.12)
~/.claude/skills/ios-simulator-skill/sim <script> [args]

# Map screen elements
~/.claude/skills/ios-simulator-skill/sim screen_mapper --verbose

# Tap by text
~/.claude/skills/ios-simulator-skill/sim navigator --find-text "Login" --tap

# Enter text in field
~/.claude/skills/ios-simulator-skill/sim navigator --find-type TextField --enter-text "user@test.com"

# Screenshot (use simctl directly)
xcrun simctl io booted screenshot /tmp/screenshot.png
```

Available scripts: `screen_mapper`, `navigator`, `app_launcher`, `build_and_test`, `log_monitor`, `accessibility_audit`, `visual_diff`, `permission_manager`, `sim_lifecycle`

## Project Structure

```
src/
├── screens/          # Route-level views
│   ├── inbox/        # Notifications screen (booking/payment/escalation)
│   ├── appointments/ # Appointments list
│   └── ...
├── components-next/  # Shared UI components
├── store/            # Redux slices
│   ├── notification/ # Notification state + Sara API service
│   ├── appointments/ # Appointments state
│   └── ...
├── services/         # API clients (Chatwoot, Sara)
├── theme/            # Tailwind config + Sara colors
├── hooks/            # Custom React hooks
└── utils/            # Helper functions
```

## Development Principles

1. **Read before editing** - Always read and understand relevant files before proposing code edits. Do not speculate about code you have not inspected. If the user references a specific file/path, you MUST open and inspect it before explaining or proposing fixes. Be rigorous and persistent in searching code for key facts. Thoroughly review the style, conventions, and abstractions of the codebase before implementing new features or abstractions.
2. **Keep it simple** - Avoid over-engineering. Only make changes that are directly requested or clearly necessary. Keep solutions simple and focused.
3. **No scope creep** - Don't add features, refactor code, or make "improvements" beyond what was asked. A bug fix doesn't need surrounding code cleaned up. A simple feature doesn't need extra configurability.
4. **Trust internal code** - Don't add error handling, fallbacks, or validation for scenarios that can't happen. Trust internal code and framework guarantees. Only validate at system boundaries (user input, external APIs). Don't use backwards-compatibility shims when you can just change the code.
5. **No premature abstractions** - Don't create helpers, utilities, or abstractions for one-time operations. Don't design for hypothetical future requirements. The right amount of complexity is the minimum needed for the current task. Reuse existing abstractions where possible and follow the DRY principle.
6. **Use Sara tokens** - Never hardcode colors, use `sara-*` theme tokens

---

## Refactoring Slices

See **[docs/REFACTORING_SLICES.md](./docs/REFACTORING_SLICES.md)** for full details.

| Slice | Name | Files | Parallel? |
|-------|------|-------|-----------|
| S01 | Theme | ~9 | Yes |
| S02 | Navigation | ~9 | Yes |
| S03 | Auth | ~13 | Yes |
| S04 | Chat | ~75 | Sub-slices (a/b/c/d) |
| S05 | Conversations | ~41 | Depends S04 |
| S06 | Notifications | ~15 | Yes |
| S07 | Appointments | ~10 | Yes |
| S08 | Contacts | ~26 | Yes |
| S09 | Settings | ~24 | Yes |
| S10 | Components | ~62 | Yes |
| S11 | Store | ~148 | Core (careful) |
| S12 | Services | ~4 | Yes |
| S13 | Utils/Types | ~78 | Yes |

**Quick Wins:** S01 (520+ hardcoded colors), S07 (small/isolated), S10 (Storybook), S13 (cleanup)

## NOTIFY WORKFLOW (IMPORTANT)

When the user asks to "notify" (explicitly or at the end of a long task), send a notification via `curl https://ntfy.sh/codex-victor`. Use a terminal/hacker style format:

```bash
curl https://ntfy.sh \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "codex-victor",
    "message": "[claude-code] <action> :: <details> | status=<OK|ERR>"
  }'
```

Examples:
- `[claude-code] mobile build :: ios simulator ready | status=OK`
- `[claude-code] notifications :: sara api integrated | status=OK`
- `[claude-code] metro error :: bundler crash on start | status=ERR`

For links, use actions array:
```bash
curl https://ntfy.sh \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "codex-victor",
    "message": "[mobile] feature complete :: notifications screen",
    "actions": [
      {"action":"view","label":"open-crm","url":"https://crm.sara-ai.com.br","clear":true}
    ]
  }'
```
