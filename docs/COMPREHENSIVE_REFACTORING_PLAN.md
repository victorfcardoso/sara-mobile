# Sara Platform Comprehensive Refactoring Plan

> **Generated**: 2025-12-13
> **Scope**: Backend (cb2) + Mobile Frontend (sara-mobile)
> **Execution Model**: Staged parallel slices with Opus subagents

---

## Executive Summary

This document outlines a comprehensive refactoring plan for the Sara platform spanning both the FastAPI backend (`cb2`) and the React Native mobile app (`sara-mobile`). The plan is organized into **4 stages** with up to **15 parallel slices per stage**, designed for execution by autonomous subagents.

### Key Findings

| Area | Current State | Priority |
|------|---------------|----------|
| **Backend Code Quality** | 2,846-line files, 172 untested paths, duplicated normalizers | HIGH |
| **Mobile Theming** | 499 hardcoded hex colors vs 11 Sara tokens defined | HIGH |
| **Dark Mode** | Infrastructure exists, not implemented | MEDIUM |
| **i18n** | Complete (42 languages) | LOW |
| **Testing** | Backend improved (207%), mobile has 0 unit tests | HIGH |
| **Logo Assets** | PNG only, no SVG source in repo | MEDIUM |

---

## Design System Reference

> **Full Guidelines**: [`docs/DESIGN_GUIDELINES.md`](./DESIGN_GUIDELINES.md) — comprehensive design patterns, typography, components, and mobile adaptations

### Sara Brand Colors

**Source**: `sara-mobile/src/theme/tailwind.config.ts`

| Token | Value | Usage |
|-------|-------|-------|
| `sara-background` | `#F8F5F3` | Main screen backgrounds |
| `sara-background-light` | `#FFFFFF` | Cards, modals |
| `sara-accent` | `#4CB6AC` | Primary actions, icons |
| `sara-accent-light` | `#E6F5F4` | Accent backgrounds, badges |
| `sara-accent-muted` | `rgba(76, 182, 172, 0.25)` | Subtle highlights |
| `sara-text-primary` | `#16273D` | Headings, important text |
| `sara-text-secondary` | `#4B5D6E` | Body text, descriptions |
| `sara-text-meta` | `#6C778A` | Timestamps, metadata |
| `sara-border` | `#E6E2DD` | Dividers, card borders |
| `sara-border-strong` | `#D1CCC6` | Stronger borders |
| `sara-chip` | `#F5F3F0` | Tag/chip backgrounds |

### Design Principles

1. **Warm Aesthetic**: Cream backgrounds + soft teal accents (spa/wellness vibe)
2. **Token-First**: Never hardcode hex values; use `sara-*` tokens
3. **Consistency**: Match CRM Admin theme (`cb2/admin/src/utils/saraTheme.ts`)
4. **Accessibility**: Ensure sufficient contrast ratios for text

### Typography

- **Font Family**: Inter (variable weights: 400, 420, 500, 580, 600)
- **Primary Text**: `sara-text-primary` (#16273D)
- **Secondary Text**: `sara-text-secondary` (#4B5D6E)
- **Meta Text**: `sara-text-meta` (#6C778A)

---

## Stage 1: Foundation & Quick Wins

**Goal**: Establish solid foundation, remove technical debt, prepare for feature work.

**Duration**: Can be executed in parallel

### Slice 1.1: Backend — Consolidate Normalizers
**Priority**: HIGH | **Files**: ~8 | **Agent**: opus

**Problem**: 13 separate `normalize_*` functions scattered across:
- `app/utils/identifiers.py` (6 functions)
- `app/db/agents.py` (duplicate)
- `app/auth/models.py` (duplicate)
- `app/utils/phone.py`
- `app/crm/utils.py`
- `app/scheduling/*.py`

**Tasks**:
1. Create `app/utils/normalizers.py` as single source of truth
2. Move all normalization functions to this file
3. Remove duplicates from other files
4. Update all imports across codebase
5. Add unit tests for each normalizer

---

### Slice 1.2: Backend — Remove Debug Logging
**Priority**: HIGH | **Files**: ~3 | **Agent**: opus

**Problem**: 40+ `[DEBUG]` log statements in production code (`app/scheduling/new_scheduling_tools.py`)

**Tasks**:
1. Remove all `logger.info("[DEBUG]...")` statements
2. Convert legitimate debug info to proper `logger.debug()` calls
3. Ensure log levels are appropriate for production
4. Review and clean similar patterns in other files

---

### Slice 1.3: Backend — Extract Exception Handler Decorator
**Priority**: MEDIUM | **Files**: ~5 | **Agent**: opus

**Problem**: Same try/except pattern duplicated 16+ times in `app/users/routes.py`

**Tasks**:
1. Create `app/utils/exception_handlers.py`
2. Implement `@handle_route_exceptions` decorator
3. Refactor `users/routes.py` to use decorator
4. Apply pattern to other route files with similar duplication

---

### Slice 1.4: Mobile — Create Color Migration Script
**Priority**: HIGH | **Files**: ~1 (script) | **Agent**: opus

**Problem**: 499 hardcoded hex colors across 145 `.tsx` files

**Tasks**:
1. Create `scripts/migrate-colors.ts` to scan for hardcoded colors
2. Generate report mapping hex values to Sara tokens
3. Create sed/codemod script for bulk replacement
4. Document unmapped colors for manual review

---

### Slice 1.5: Mobile — Theme Token Audit
**Priority**: HIGH | **Files**: ~10 | **Agent**: opus

**Problem**: Many screens define local `SARA_COLORS` const instead of importing

**Target Files** (highest offenders):
- `src/screens/appointments/AppointmentsScreen.tsx` (46 colors)
- `src/screens/settings/ServiceCatalogScreen.tsx` (36 colors)
- `src/screens/settings/FaqEditorScreen.tsx` (25 colors)
- `src/screens/settings/OfficeHoursScreen.tsx` (24 colors)
- `src/screens/contacts/ContactsScreen.tsx`
- `src/screens/contacts/ContactDetailScreen.tsx`

**Tasks**:
1. Replace all hardcoded colors with `tailwind.style('sara-*')` or `tailwind.color('sara-*')`
2. Remove local `SARA_COLORS` constants
3. Verify visual consistency after changes

---

### Slice 1.6: Mobile — SVG Icon Color Migration
**Priority**: MEDIUM | **Files**: ~30 | **Agent**: opus

**Problem**: SVG icon components have hardcoded fill colors

**Target**: `src/svg-icons/*.tsx`

**Tasks**:
1. Add `color` prop to all SVG icon components
2. Replace hardcoded fills with dynamic color from props
3. Default to `sara-accent` or `sara-text-primary` as appropriate
4. Update usages to pass Sara tokens

---

### Slice 1.7: Mobile — Add SVG Logo Assets
**Priority**: MEDIUM | **Files**: ~4 | **Agent**: opus

**Problem**: Only PNG logos exist, no vector source

**Tasks**:
1. Create SVG versions of Sara logos (trace from PNG or recreate)
2. Add to `src/assets/images/`:
   - `sara_mark.svg` (icon only)
   - `sara_wordmark.svg` (logo + text)
3. Create `SaraLogo.tsx` component with configurable size/color
4. Update splash screen config to use vector if Expo supports

---

### Slice 1.8: Backend — Add Testing Infrastructure
**Priority**: HIGH | **Files**: ~5 | **Agent**: opus

**Problem**: 172 `pragma: no cover` markers indicate untested defensive code

**Tasks**:
1. Review top 20 `pragma: no cover` usages
2. Add tests for legitimate edge cases
3. Remove pragma from now-tested code
4. Create testing guidelines document
5. Set up coverage threshold in CI

---

### Slice 1.9: Mobile — Jest Test Setup
**Priority**: HIGH | **Files**: ~5 | **Agent**: opus

**Problem**: Zero unit tests exist

**Tasks**:
1. Verify jest configuration is complete
2. Create test utilities (`src/test-utils/`)
3. Add example tests for:
   - `utils/dateTimeUtils.ts`
   - `utils/conversationUtils.ts`
   - Redux selectors
4. Document testing patterns in `AGENTS.md`

---

### Slice 1.10: Mobile — Storybook Coverage Expansion
**Priority**: LOW | **Files**: ~15 | **Agent**: haiku

**Current Coverage**: 24 stories

**Tasks**:
1. Add stories for missing components in `components-next/`:
   - `NoNetwork.tsx`
   - `VerificationCode.tsx`
   - `NativeComponents/*.tsx`
2. Add stories for key screen components
3. Ensure all variants are documented

---

## Stage 2: Backend Decomposition

**Goal**: Break down massive files, improve maintainability.

**Dependencies**: Stage 1 completion (especially Slice 1.1, 1.2, 1.3)

### Slice 2.1: Split scheduling/routes.py (Part 1 - Booking)
**Priority**: HIGH | **Files**: 1→4 | **Agent**: opus

**Current**: `app/scheduling/routes.py` (2,846 lines)

**Tasks**:
1. Extract booking endpoints to `app/scheduling/booking_routes.py`
2. Move `/s/{token}` and related booking link handlers
3. Maintain backward compatibility
4. Update imports in `main.py`

---

### Slice 2.2: Split scheduling/routes.py (Part 2 - Management)
**Priority**: HIGH | **Files**: 1→2 | **Agent**: opus

**Tasks**:
1. Extract management endpoints to `app/scheduling/management_routes.py`
2. Move `/s/m/{token}` management link handlers
3. Extract SPA serving logic

---

### Slice 2.3: Split scheduling/routes.py (Part 3 - Proxy)
**Priority**: MEDIUM | **Files**: 1→2 | **Agent**: opus

**Tasks**:
1. Extract EA proxy endpoints to `app/scheduling/proxy_routes.py`
2. Move `/s/agents/{id}/ea/proxy/*` handlers
3. Consolidate proxy authentication logic

---

### Slice 2.4: Split easyappointments_webhook.py
**Priority**: HIGH | **Files**: 1→3 | **Agent**: opus

**Current**: `app/webhooks/easyappointments_webhook.py` (1,680 lines)

**Tasks**:
1. Extract event handlers to `app/webhooks/ea_handlers.py`
2. Extract notification logic to `app/webhooks/ea_notifications.py`
3. Keep main webhook router thin

---

### Slice 2.5: Split notifications/sender.py
**Priority**: HIGH | **Files**: 1→3 | **Agent**: opus

**Current**: `app/notifications/sender.py` (1,362 lines, 14 functions)

**Tasks**:
1. Extract message builders to `app/notifications/builders.py`
2. Extract delivery logic to `app/notifications/delivery.py`
3. Keep sender.py as orchestration layer

---

### Slice 2.6: Split db/customers.py
**Priority**: MEDIUM | **Files**: 1→2 | **Agent**: opus

**Current**: `app/db/customers.py` (1,425 lines)

**Tasks**:
1. Extract sync logic to `app/db/customer_sync.py`
2. Keep CRUD operations in `customers.py`
3. Separate concerns: data layer vs business logic

---

### Slice 2.7: Refactor chatwoot/routes.py
**Priority**: MEDIUM | **Files**: 1→2 | **Agent**: opus

**Current**: `app/chatwoot/routes.py` (990 lines)

**Tasks**:
1. Extract SSO logic to `app/chatwoot/sso.py`
2. Keep mobile API routes in `routes.py`
3. Add proper response models

---

### Slice 2.8: Backend Route Documentation
**Priority**: LOW | **Files**: ~1 | **Agent**: haiku

**Tasks**:
1. Generate OpenAPI documentation review
2. Add missing endpoint descriptions
3. Document request/response schemas
4. Create API reference document

---

## Stage 3: Mobile Feature Implementation

**Goal**: Implement dark mode, align with CRM routes, improve UX.

**Dependencies**: Stage 1 Slices 1.4-1.6 (color migration)

### Slice 3.1: Dark Mode — Theme Context
**Priority**: HIGH | **Files**: ~5 | **Agent**: opus

**Tasks**:
1. Create `src/context/ThemeContext.tsx`
2. Implement `useTheme()` hook
3. Connect to `settingsSlice.theme` state
4. Add system theme detection via `useColorScheme()`
5. Create theme toggle in Settings

---

### Slice 3.2: Dark Mode — Color Tokens
**Priority**: HIGH | **Files**: ~3 | **Agent**: opus

**Tasks**:
1. Define dark variants of Sara colors in `tailwind.config.ts`:
   ```typescript
   'sara-dark': {
     background: '#1A1A1A',
     'background-light': '#2D2D2D',
     accent: '#4CB6AC', // Keep teal
     // ... etc
   }
   ```
2. Create `useSaraColors()` hook that returns theme-aware colors
3. Update `tailwind.ts` to support dynamic theme switching

---

### Slice 3.3: Dark Mode — Component Updates
**Priority**: MEDIUM | **Files**: ~20 | **Agent**: opus

**Tasks**:
1. Update `components-next/` to use theme-aware colors
2. Focus on high-visibility components:
   - `BottomSheet.tsx`
   - `Button.tsx`
   - `Avatar.tsx`
   - `SearchBar.tsx`
3. Test in both light and dark modes

---

### Slice 3.4: Dark Mode — Screen Updates
**Priority**: MEDIUM | **Files**: ~15 | **Agent**: opus

**Tasks**:
1. Update main screens to use theme-aware colors
2. Priority screens:
   - `ConversationScreen.tsx`
   - `NotificationsScreen.tsx`
   - `AppointmentsScreen.tsx`
   - `SettingsScreen.tsx`
3. Update StatusBar color dynamically

---

### Slice 3.5: Mobile — Route Alignment with CRM
**Priority**: MEDIUM | **Files**: ~8 | **Agent**: opus

**CRM Routes to Mirror**:

| CRM Route | Mobile Equivalent | Status |
|-----------|------------------|--------|
| `/` (Dashboard) | Home Tab | ✅ Exists |
| `/threads` | Conversations Tab | ✅ Exists |
| `/appointments` | Appointments Tab | ✅ Exists |
| `/notifications` | Notifications Tab | ✅ Exists |
| `/customers` | Contacts Tab | ✅ Exists |
| `/office-hours` | Settings → Office Hours | ✅ Exists |
| `/agents/:id/faq` | Settings → FAQ | ✅ Exists |
| `/services` | Settings → Service Catalog | ✅ Exists |

**Tasks**:
1. Audit route naming consistency
2. Ensure deep linking patterns match CRM URLs where applicable
3. Add missing navigation paths if any

---

### Slice 3.6: Mobile — i18n Sara Key Audit
**Priority**: LOW | **Files**: ~42 | **Agent**: haiku

**Tasks**:
1. Ensure all Sara-specific keys exist in all languages (currently only en, pt_BR)
2. Add placeholders in other language files
3. Mark for translation in Crowdin
4. Verify interpolation patterns are consistent

---

### Slice 3.7: Mobile — Splash Screen Enhancement
**Priority**: LOW | **Files**: ~3 | **Agent**: haiku

**Tasks**:
1. Verify splash screen uses Sara brand colors
2. Ensure smooth transition to app
3. Test on various device sizes
4. Consider animated splash if time permits

---

### Slice 3.8: Mobile — App Icon Polish
**Priority**: LOW | **Files**: ~5 | **Agent**: haiku

**Tasks**:
1. Verify adaptive icon on Android
2. Check iOS icon corners
3. Ensure consistent branding across platforms
4. Update app store screenshots if needed

---

## Stage 4: Integration & Polish

**Goal**: Complete integration testing, documentation, cleanup.

**Dependencies**: Stages 1-3 completion

### Slice 4.1: Backend — Integration Tests
**Priority**: HIGH | **Files**: ~10 | **Agent**: opus

**Tasks**:
1. Add integration tests for mobile API endpoints
2. Test `/chatwoot/mobile-auth` flow
3. Test `/chatwoot/mobile/appointments` pagination
4. Test notification CRUD operations

---

### Slice 4.2: Mobile — E2E Test Setup
**Priority**: MEDIUM | **Files**: ~5 | **Agent**: opus

**Tasks**:
1. Evaluate Detox or Maestro for E2E testing
2. Set up basic configuration
3. Create smoke test for login flow
4. Document E2E testing approach

---

### Slice 4.3: Backend — Complete TODO Items
**Priority**: MEDIUM | **Files**: ~5 | **Agent**: opus

**Known TODOs**:
- `app/webhooks/doctor_webhook.py:59`: Nice HTML page for UX
- `app/notifications/sender.py:802`: Agent ID parameter passing
- `app/payment/payment_routes.py:843`: Failed payment notification

**Tasks**:
1. Implement or remove each TODO
2. Add tests for new functionality

---

### Slice 4.4: Backend — Structured Logging
**Priority**: MEDIUM | **Files**: ~10 | **Agent**: opus

**Tasks**:
1. Implement JSON log format for CloudWatch
2. Add request ID propagation
3. Standardize log levels across modules
4. Create logging guidelines

---

### Slice 4.5: Documentation Update
**Priority**: LOW | **Files**: ~5 | **Agent**: haiku

**Tasks**:
1. Update `CLAUDE.md` with refactoring outcomes
2. Update `AGENTS.md` with new patterns
3. Create/update API documentation
4. Document new mobile theming system

---

### Slice 4.6: Performance Audit
**Priority**: LOW | **Files**: ~1 | **Agent**: haiku

**Tasks**:
1. Profile mobile app startup time
2. Check bundle size
3. Identify optimization opportunities
4. Document findings

---

## Execution Plan

### Phase 1: Quick Wins (Stage 1)
**Parallel Agents**: Up to 10
**Est. Duration**: 2-4 hours

```
[1.1 Normalizers] [1.2 Debug Logs] [1.3 Exception Handler]
[1.4 Color Script] [1.5 Token Audit] [1.6 SVG Icons]
[1.7 SVG Logos]   [1.8 Backend Tests] [1.9 Jest Setup]
[1.10 Storybook]
```

### Phase 2: Backend Decomposition (Stage 2)
**Parallel Agents**: Up to 8
**Est. Duration**: 3-5 hours
**Dependencies**: Stage 1 complete

```
[2.1 Booking Routes] [2.2 Mgmt Routes] [2.3 Proxy Routes]
[2.4 EA Webhook]     [2.5 Sender]      [2.6 Customers]
[2.7 Chatwoot]       [2.8 API Docs]
```

### Phase 3: Mobile Features (Stage 3)
**Parallel Agents**: Up to 8
**Est. Duration**: 3-5 hours
**Dependencies**: Stage 1 color migration complete

```
[3.1 Theme Context] [3.2 Dark Tokens] [3.3 Components]
[3.4 Screens]       [3.5 Routes]      [3.6 i18n]
[3.7 Splash]        [3.8 App Icon]
```

### Phase 4: Integration (Stage 4)
**Parallel Agents**: Up to 6
**Est. Duration**: 2-3 hours
**Dependencies**: Stages 1-3 complete

```
[4.1 Integration Tests] [4.2 E2E Setup] [4.3 TODOs]
[4.4 Logging]           [4.5 Docs]      [4.6 Perf]
```

---

## Risk Mitigation

### High-Risk Slices
1. **Slice 2.1-2.3 (Route Splitting)**: Test thoroughly, may break imports
2. **Slice 3.1-3.2 (Dark Mode)**: Requires careful color token design
3. **Slice 1.5 (Color Migration)**: High file count, visual regression risk

### Mitigation Strategies
1. Run full test suite after each Stage completion
2. Visual regression testing for UI changes
3. Feature flags for dark mode rollout
4. Git branches per Stage for easy rollback

---

## Success Criteria

- [ ] All hardcoded colors replaced with Sara tokens
- [ ] No files over 500 lines in backend
- [ ] Dark mode toggle functional
- [ ] Backend test coverage increased
- [ ] Mobile unit tests exist
- [ ] All TODOs addressed or documented
- [ ] Documentation updated

---

## Appendix A: File Inventory

### Backend Files to Modify

| File | Lines | Action |
|------|-------|--------|
| `app/scheduling/routes.py` | 2,846 | Split into 4 files |
| `app/webhooks/easyappointments_webhook.py` | 1,680 | Split into 3 files |
| `app/notifications/sender.py` | 1,362 | Split into 3 files |
| `app/db/customers.py` | 1,425 | Split into 2 files |
| `app/chatwoot/routes.py` | 990 | Split into 2 files |
| `app/utils/identifiers.py` | ~200 | Consolidate normalizers |

### Mobile Files with Hardcoded Colors (Top 10)

| File | Color Count |
|------|-------------|
| `src/screens/appointments/AppointmentsScreen.tsx` | 46 |
| `src/screens/settings/ServiceCatalogScreen.tsx` | 36 |
| `src/screens/settings/FaqEditorScreen.tsx` | 25 |
| `src/screens/settings/OfficeHoursScreen.tsx` | 24 |
| `src/screens/contacts/ContactsScreen.tsx` | ~20 |
| `src/screens/notifications/NotificationsScreen.tsx` | ~18 |
| `src/navigation/tabs/BottomTabBar.tsx` | ~15 |
| `src/screens/conversations/ConversationScreen.tsx` | ~15 |
| `src/screens/settings/SettingsScreen.tsx` | ~12 |
| `src/screens/auth/LoginScreen.tsx` | ~10 |

---

## Appendix B: CRM Route Reference

| CRM Route | Description | Mobile Equivalent |
|-----------|-------------|-------------------|
| `/` | Dashboard | Home Tab |
| `/threads` | Conversation list | Conversations Tab |
| `/threads/:id/show` | Conversation detail | ChatScreen |
| `/appointments` | Appointments calendar | Appointments Tab |
| `/notifications` | Notification center | Notifications Tab |
| `/customers` | Customer list | Contacts Tab |
| `/customers/:id/show` | Customer detail | ContactDetailScreen |
| `/office-hours` | Office hours config | OfficeHoursScreen |
| `/agents` | Agent list | AgentProfileScreen |
| `/agents/:id` | Agent edit | Settings (inline) |
| `/agents/:id/faq` | FAQ editor | FaqEditorScreen |
| `/services` | Service catalog | ServiceCatalogScreen |
| `/notification-preferences` | Notification prefs | NotificationPreferencesScreen |

---

## Appendix C: Design System Files

| File | Purpose |
|------|---------|
| `sara-mobile/docs/DESIGN_GUIDELINES.md` | **Full design guidelines** (colors, typography, components, mobile adaptations) |
| `sara-mobile/src/theme/tailwind.config.ts` | Sara color tokens |
| `sara-mobile/src/theme/tailwind.ts` | Tailwind instance |
| `sara-mobile/src/theme/colors/light.ts` | Light Radix colors |
| `sara-mobile/src/theme/colors/dark.ts` | Dark Radix colors |
| `cb2/admin/src/utils/saraTheme.ts` | CRM theme constants |
| `sara-mobile/docs/chatwoot_mobile_login_ui_redesign.md` | Design narrative |
