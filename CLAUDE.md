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

Sara uses a **warm, approachable color palette** defined in `src/theme/tailwind.config.ts`:

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

### Usage

```tsx
// Tailwind classes
tailwind.style('bg-sara-background text-sara-text-primary')

// For props that need hex values (SVG stroke, StatusBar, etc.)
tailwind.color('sara-accent')  // returns '#4CB6AC'
```

### Design Principles

1. **Centralize colors** - Never hardcode hex values; use `sara-*` tokens
2. **Warm aesthetic** - Cream backgrounds, soft teal accents (spa/wellness vibe)
3. **Follow upstream patterns** - Reuse Chatwoot component conventions from `src/components-next`

## Quick Commands

```bash
pnpm install          # Install dependencies
pnpm start            # Start Metro bundler
pnpm run:ios          # Run on iOS simulator
pnpm run:android      # Run on Android emulator
pnpm lint             # Check code style
pnpm test             # Run tests
```

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

1. **Read before editing** - Always inspect files before proposing changes
2. **Keep it simple** - Minimum complexity for current task
3. **Reuse existing code** - Check for existing abstractions first
4. **Use Sara tokens** - Never hardcode colors, use `sara-*` theme tokens

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
