# Sara Platform Comprehensive Refactoring Plan

> **Generated**: 2025-12-13
> **Scope**: Mobile Frontend (sara-mobile) only
> **Execution Model**: Staged parallel slices with Opus subagents

> ⚠️ **Note**: Backend (cb2) refactoring is **OUT OF SCOPE** for this plan.

---

## Executive Summary

This document outlines a comprehensive refactoring plan for the Sara mobile app (`sara-mobile`). The plan is organized into **3 stages** with up to **10 parallel slices per stage**, designed for execution by autonomous subagents.

### Key Findings

| Area | Current State | Priority |
|------|---------------|----------|
| **Mobile Theming** | ✅ DONE - Migrated to Sara tokens | COMPLETE |
| **Dark Mode** | Infrastructure exists, not implemented | MEDIUM |
| **i18n** | Complete (42 languages) | LOW |
| **Testing** | ✅ DONE - 185 tests, 38 suites | COMPLETE |
| **Logo Assets** | ✅ DONE - SVG components created | COMPLETE |
| **Storybook** | ✅ DONE - 28 story files | COMPLETE |

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

## ~~Stage 2: Backend Decomposition~~ (OUT OF SCOPE)

> ⚠️ **This stage has been removed from scope.** Backend (cb2) refactoring will be handled separately.

---

## Stage 2: Mobile Feature Implementation

**Goal**: Implement dark mode, align with CRM routes, improve UX.

**Dependencies**: Stage 1 complete ✅

### Slice 2.1: Dark Mode — Theme Context
**Priority**: HIGH | **Files**: ~5 | **Agent**: opus

**Tasks**:
1. Create `src/context/ThemeContext.tsx`
2. Implement `useTheme()` hook
3. Connect to `settingsSlice.theme` state
4. Add system theme detection via `useColorScheme()`
5. Create theme toggle in Settings

---

### Slice 2.2: Dark Mode — Color Tokens
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

### Slice 2.3: Dark Mode — Component Updates
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

### Slice 2.4: Dark Mode — Screen Updates
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

### Slice 2.5: Mobile — Route Alignment with CRM
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

### Slice 2.6: Mobile — i18n Sara Key Audit
**Priority**: LOW | **Files**: ~42 | **Agent**: haiku

**Tasks**:
1. Ensure all Sara-specific keys exist in all languages (currently only en, pt_BR)
2. Add placeholders in other language files
3. Mark for translation in Crowdin
4. Verify interpolation patterns are consistent

---

### Slice 2.7: Mobile — Splash Screen Enhancement
**Priority**: LOW | **Files**: ~3 | **Agent**: haiku

**Tasks**:
1. Verify splash screen uses Sara brand colors
2. Ensure smooth transition to app
3. Test on various device sizes
4. Consider animated splash if time permits

---

### Slice 2.8: Mobile — App Icon Polish
**Priority**: LOW | **Files**: ~5 | **Agent**: haiku

**Tasks**:
1. Verify adaptive icon on Android
2. Check iOS icon corners
3. Ensure consistent branding across platforms
4. Update app store screenshots if needed

---

## Stage 3: Integration & Polish

**Goal**: Complete E2E testing, documentation, cleanup.

**Dependencies**: Stages 1-2 completion

### Slice 3.1: Mobile — E2E Test Setup
**Priority**: MEDIUM | **Files**: ~5 | **Agent**: opus

**Tasks**:
1. Evaluate Detox or Maestro for E2E testing
2. Set up basic configuration
3. Create smoke test for login flow
4. Document E2E testing approach

---

### Slice 3.2: Documentation Update
**Priority**: LOW | **Files**: ~5 | **Agent**: haiku

**Tasks**:
1. Update `CLAUDE.md` with refactoring outcomes
2. Update `AGENTS.md` with new patterns
3. Create/update API documentation
4. Document new mobile theming system

---

### Slice 3.3: Performance Audit
**Priority**: LOW | **Files**: ~1 | **Agent**: haiku

**Tasks**:
1. Profile mobile app startup time
2. Check bundle size
3. Identify optimization opportunities
4. Document findings

---

## Execution Plan

### Phase 1: Foundation & Quick Wins (Stage 1) ✅ COMPLETE
**Status**: Done (2024-12-14)

```
[1.4 Color Script] ✅  [1.5 Token Audit] ✅  [1.6 SVG Icons] ✅
[1.7 SVG Logos] ✅     [1.9 Jest Setup] ✅   [1.10 Storybook] ✅
```

### Phase 2: Mobile Features (Stage 2) ✅ COMPLETE
**Status**: Complete (2025-12-14)

```
[2.1 Theme Context] ✅  [2.2 Dark Tokens] ✅  [2.3 Components] ✅
[2.4 Screens] ✅        [2.5 Routes] ✅       [2.6 i18n] ✅
[2.7 Splash] ✅         [2.8 App Icon] ✅
```

**Note**: Dark mode infrastructure fully in place (ThemeContext, useSaraColors hook, dark tokens).
All key screens use theme-aware colors. Dark mode toggle available in Settings.
Remaining hardcoded colors fixed (NotificationPreferences switch, Tick/Check icons).

### Phase 3: Integration & Polish (Stage 3) ✅ COMPLETE
**Status**: Done (2025-12-14)

```
[3.1 E2E Setup] ✅  [3.2 Docs] ✅  [3.3 Perf] ✅
```

**Deliverables**:
- Maestro E2E framework configured (`.maestro/` flows, login smoke test)
- Documentation updated (CLAUDE.md, AGENTS.md, THEMING.md, PERFORMANCE_AUDIT.md)
- Performance audit complete (no critical issues, 3 quick wins identified)

---

## Risk Mitigation

### High-Risk Slices
1. **Slice 2.1-2.2 (Dark Mode)**: Requires careful color token design
2. **Slice 2.3-2.4 (Component/Screen Updates)**: High file count, visual regression risk

### Mitigation Strategies
1. Run full test suite after each Stage completion
2. Visual regression testing for UI changes
3. Feature flags for dark mode rollout
4. Git branches per Stage for easy rollback

---

## Success Criteria

- [x] All hardcoded colors replaced with Sara tokens ✅
- [x] Mobile unit tests exist ✅ (185 tests)
- [x] SVG logo assets created ✅
- [x] Storybook coverage expanded ✅
- [x] Dark mode toggle functional ✅ (ThemeContext, useSaraColors hook, Settings toggle)
- [x] E2E tests configured ✅ (Maestro)
- [x] Documentation updated ✅ (THEMING.md, PERFORMANCE_AUDIT.md, CLAUDE.md)

---

## Appendix A: File Inventory

### Mobile Files - Color Migration Status ✅ COMPLETE

| File | Status |
|------|--------|
| `src/screens/appointments/AppointmentsScreen.tsx` | ✅ Migrated |
| `src/screens/settings/ServiceCatalogScreen.tsx` | ✅ Migrated |
| `src/screens/settings/FaqEditorScreen.tsx` | ✅ Migrated |
| `src/screens/settings/OfficeHoursScreen.tsx` | ✅ Migrated |
| `src/screens/contacts/ContactsScreen.tsx` | ✅ Migrated |
| `src/svg-icons/**/*.tsx` (50+ files) | ✅ Migrated |

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
