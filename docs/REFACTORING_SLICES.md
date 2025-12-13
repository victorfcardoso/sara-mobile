# Refactoring Slices

The codebase is divided into **13 slices** for parallel refactoring work. Each slice is designed to be worked on independently by subagents with minimal cross-slice conflicts.

## Slice Overview

| Slice | Name | Files | Priority | Parallelizable |
|-------|------|-------|----------|----------------|
| **S01** | Theme | ~9 | HIGH | Yes |
| **S02** | Navigation | ~9 | Medium | Yes |
| **S03** | Auth | ~13 | Medium | Yes |
| **S04** | Chat | ~75 | HIGH | Sub-slices |
| **S05** | Conversations | ~41 | HIGH | Depends S04 |
| **S06** | Notifications | ~15 | Medium | Yes |
| **S07** | Appointments | ~10 | Low | Yes |
| **S08** | Contacts | ~26 | Medium | Yes |
| **S09** | Settings | ~24 | Medium | Yes |
| **S10** | Components | ~62 | Medium | Yes |
| **S11** | Store | ~148 | HIGH | Core |
| **S12** | Services | ~4 | Medium | Yes |
| **S13** | Utils/Types | ~78 | Low | Yes |

## Dependency Graph

```
S01-THEME <------------------------------------------+
    |                                                |
S02-NAV <-- S03-AUTH                                 |
    |           |                                    | (all screens)
    +-----------+------------------------------------+
                |                                    |
S10-COMPONENTS <+------------------------------------+
                |                                    |
S11-STORE <-----+-- S12-SERVICES                     |
    |           |       |                            |
    +-----------+-------+----------------------------+
    |           |       |
    v           v       v
+-------------------------------------+
|         FEATURE SLICES              |
|  S04-CHAT  S05-CONVERSATIONS        |
|  S06-NOTIFICATIONS  S07-APPOINTMENTS|
|  S08-CONTACTS  S09-SETTINGS         |
+-------------------------------------+
```

## Parallelization Matrix

| Slices | Can Parallel? | Notes |
|--------|---------------|-------|
| S01 + S02 + S03 | Yes | No overlap |
| S04a + S04b + S04c + S04d | Caution | Share chat types, coordinate |
| S06 + S07 + S08 + S09 | Yes | Independent features |
| S10 + S13 | Yes | Support layers |
| S05 + S04 | No | S05 depends on S04 types |
| S11 + any feature | No | Store changes affect features |
| S12 + S11 | Caution | Service extraction needs store coordination |

**Recommended Parallel Groups:**
1. **Group A (Foundation):** S01, S02, S10, S13
2. **Group B (Features):** S06, S07, S08, S09
3. **Group C (Chat):** S04a, S04b, S04c, S04d (with coordination)
4. **Group D (Core):** S03, S05, S11, S12 (sequential or coordinated)

---

## S01-THEME — Design System

**Purpose:** Centralize all colors, fonts, and styling patterns.

**Files:**
```
src/theme/                          # 9 files
├── tailwind.config.ts              # Sara color tokens
├── tailwind.ts                     # twrnc instance
├── colors.ts                       # Color utilities
└── fonts/                          # Inter font files
```

**Known Issues:**
- 520+ hardcoded hex colors across screens (anti-pattern)
- Many screens define local `SARA_COLORS` const instead of importing

**Refactoring Tasks:**
1. Audit all hardcoded colors in screens
2. Create `tailwind.color()` utility for non-className usage
3. Remove all local color constants
4. Document color usage patterns

**Parallelizable:** Fully independent, affects many files but changes are mechanical.

---

## S02-NAV — Navigation

**Purpose:** App navigation structure, deep linking, tab bar.

**Files:**
```
src/navigation/                     # 9 files
├── index.tsx                       # AppNavigator + deep linking
├── tabs/
│   ├── AppTabs.tsx                 # Bottom tab navigator
│   ├── BottomTabBar.tsx            # Custom tab styling
│   └── ActionBottomSheet.tsx       # Global action menu
└── stack/
    ├── AuthStack.tsx               # Login flow
    ├── ConversationStack.tsx       # Conversation list + detail
    ├── NotificationsStack.tsx      # Notifications list + detail
    ├── AppointmentsStack.tsx       # Appointments list
    ├── ContactsStack.tsx           # Contacts + CRM
    └── SettingsStack.tsx           # Settings tabs
```

**Dependencies:** None (entry point)

**Refactoring Tasks:**
1. Consolidate deep link handling
2. Improve type safety for navigation params
3. Clean up modal presentation patterns

**Parallelizable:** Isolated module.

---

## S03-AUTH — Authentication

**Purpose:** Login, SSO, MFA, session management.

**Files:**
```
src/screens/auth/                   # 4 files
├── LoginScreen.tsx
├── MFAScreen.tsx
├── ConfigURLScreen.tsx
└── ForgotPasswordScreen.tsx

src/store/auth/                     # 9 files
├── authSlice.ts
├── authActions.ts
├── authSelectors.ts
└── authTypes.ts
```

**Dependencies:** S12-SERVICES (SaraAPIService)

**Refactoring Tasks:**
1. Clean up SSO callback handling
2. Improve error handling UX
3. Consolidate auth state management

**Parallelizable:** Self-contained feature.

---

## S04-CHAT — Chat Feature (Complex)

**Purpose:** Main chat interface — message display, composition, real-time sync.

This is the **most complex slice** (75 files). It's divided into **4 sub-slices** for parallel work:

### S04a-MESSAGES — Message Rendering
```
src/screens/chat-screen/components/message-components/   # 38 files
├── TextBubble.tsx
├── ImageBubble.tsx / .ios.tsx / .android.tsx
├── AudioBubble.tsx
├── VideoBubble.tsx
├── FileBubble.tsx
├── EmailBubble.tsx
├── LocationBubble.tsx
├── MarkdownBubble.tsx
├── AttachedMedia.tsx
├── DeliveryStatus.tsx
├── ErrorInformation.tsx
└── [25+ more message type components]
```

### S04b-LIST — Message List
```
src/screens/chat-screen/components/message-list/        # 8 files
├── MessageList.tsx                 # FlashList virtualized
├── MessageItem.tsx
├── DateSeparator.tsx
└── [scroll/load logic]
```

### S04c-COMPOSE — Reply Box
```
src/screens/chat-screen/components/reply-box/           # 15 files
├── ReplyBox.tsx
├── mentions-input/                 # @mention functionality
│   ├── MentionsInput.tsx
│   └── mentionUtils.ts
├── buttons/
│   ├── SendButton.tsx
│   ├── VoiceRecordButton.tsx
│   ├── PhotosButton.tsx
│   └── CommandsButton.tsx
└── [file upload, emoji handling]

src/screens/chat-screen/components/audio-recorder/      # 3 files
```

### S04d-HEADER — Chat Header & Macros
```
src/screens/chat-screen/components/chat-header/         # 7 files
├── ChatHeader.tsx
├── SLAIndicator.tsx
├── DropdownMenu.tsx
└── [action buttons]

src/screens/chat-screen/components/macros/              # 5 files
├── MacroList.tsx
├── MacroItem.tsx
└── [canned response logic]
```

**Dependencies:**
- S11-STORE (conversation slice)
- S10-COMPONENTS (Avatar, BottomSheet)
- S01-THEME (colors)

**Parallelizable:** Sub-slices can run in parallel, but must coordinate on shared types.

---

## S05-CONVERSATIONS — Conversation List

**Purpose:** Inbox list view, filtering, conversation status management.

**Files:**
```
src/screens/conversations/          # ~25 files
├── ConversationScreen.tsx          # 362 LOC — needs splitting
├── ConversationListItem.tsx
├── ConversationFilters.tsx
└── [filter components, empty states]

src/store/conversation/             # 16 files
├── conversationSlice.ts
├── conversationActions.ts
├── conversationSelectors.ts
└── conversationTypes.ts

src/context/ConversationListContext.tsx
```

**Dependencies:**
- S04-CHAT (navigates to ChatScreen)
- S11-STORE (conversation, inbox, filter slices)

**Refactoring Tasks:**
1. Split ConversationScreen.tsx (362 LOC -> smaller components)
2. Consolidate filter logic
3. Improve list performance

**Parallelizable:** Depends on S04-CHAT types.

---

## S06-NOTIFICATIONS — Sara Notifications

**Purpose:** Booking, payment, escalation notifications from Sara API.

**Files:**
```
src/screens/notifications/          # ~8 files
├── NotificationsScreen.tsx         # 383 LOC
├── NotificationDetailScreen.tsx
├── NotificationListItem.tsx
└── [action components]

src/screens/inbox/                  # ~5 files (legacy Chatwoot inbox)

src/store/notification/             # 7 files
├── notificationSlice.ts
├── notificationActions.ts
├── notificationSelectors.ts
├── notificationTypes.ts
└── saraNotificationService.ts      # Sara API integration
```

**Dependencies:**
- S12-SERVICES (SaraAPIService)
- S11-STORE (notification slice)

**Refactoring Tasks:**
1. Split NotificationsScreen.tsx (383 LOC)
2. Consolidate Sara inbox + Chatwoot inbox
3. Improve notification action handling

**Parallelizable:** Recently refactored (Dec 13), mostly independent.

---

## S07-APPOINTMENTS — Appointments

**Purpose:** Doctor appointment list from Sara API.

**Files:**
```
src/screens/appointments/           # 3 files
├── AppointmentsScreen.tsx
├── AppointmentListItem.tsx
└── AppointmentDetailScreen.tsx

src/store/appointments/             # 7 files
├── appointmentsSlice.ts
├── appointmentsActions.ts
├── appointmentsSelectors.ts
└── appointmentsTypes.ts
```

**Dependencies:**
- S12-SERVICES (SaraAPIService)

**Refactoring Tasks:**
1. Clean up date/time formatting
2. Add appointment actions (confirm, cancel, reschedule)
3. Improve loading states

**Parallelizable:** Fully independent.

---

## S08-CONTACTS — Contacts & CRM

**Purpose:** Contact list, CRM customer details, contact management.

**Files:**
```
src/screens/contacts/               # 5 files
├── ContactsScreen.tsx
├── ContactListItem.tsx
└── [search, filters]

src/screens/contact-details/        # 2 files
├── ContactDetailsScreen.tsx
└── ContactDetailsSheet.tsx

src/store/contact/                  # 13 files (+ listener middleware)
├── contactSlice.ts
├── contactActions.ts
├── contactSelectors.ts
├── contactTypes.ts
└── contactListenerMiddleware.ts    # Reactive pattern

src/store/crm-customers/            # 8 files (new Sara feature)
```

**Dependencies:**
- S05-CONVERSATIONS (contact <-> conversation linking)
- S11-STORE (contact, crm-customers slices)

**Refactoring Tasks:**
1. Consolidate contact + crm-customers slices
2. Improve contact search performance
3. Clean up CRM integration

**Parallelizable:** Mostly independent.

---

## S09-SETTINGS — Settings

**Purpose:** Agent profile, office hours, service catalog, FAQ.

**Files:**
```
src/screens/settings/               # 7 files
├── SettingsScreen.tsx
├── AgentProfileScreen.tsx
├── OfficeHoursScreen.tsx
├── ServiceCatalogScreen.tsx
├── FAQScreen.tsx
└── [sub-settings]

src/store/settings/                 # 9 files
├── settingsSlice.ts
├── settingsActions.ts
└── [bootstrap logic, migrations]

src/store/agent-settings/           # 8 files
src/services/ServiceCatalogService.ts
src/services/OfficeHoursService.ts
```

**Dependencies:**
- S12-SERVICES (OfficeHoursService, ServiceCatalogService)
- S11-STORE (settings, agent-settings slices)

**Known Issues:**
- 51 hardcoded colors in settings screens

**Refactoring Tasks:**
1. Remove hardcoded colors
2. Consolidate settings + agent-settings slices
3. Improve service catalog UX

**Parallelizable:** Mostly independent.

---

## S10-COMPONENTS — Component Library

**Purpose:** Shared UI components used across all screens.

**Files:**
```
src/components-next/                # 62 files
├── button/                         # 4 files
│   ├── Button.tsx
│   ├── IconButton.tsx
│   └── AuthButton.tsx
├── common/                         # 20 files
│   ├── Avatar.tsx
│   ├── BottomSheet.tsx
│   ├── Filters.tsx
│   ├── SearchBar.tsx
│   ├── Spinner.tsx
│   ├── Swipeable.tsx
│   └── [more]
├── action-tabs/                    # Tab switcher
├── label-section/                  # Labels display
├── list-components/                # List helpers
├── sheet-components/               # Bottom sheet content
├── native-components/              # NView, NText wrappers
├── spinner/
├── no-network/
├── verification-code/              # OTP input
└── index.ts                        # Barrel export
```

**Storybook Coverage:**
- Button, Avatar, BottomSheet, Filters, SearchBar, Slider, Swipeable

**Dependencies:** S01-THEME (colors)

**Refactoring Tasks:**
1. Add Storybook stories for uncovered components
2. Improve type safety
3. Document component API

**Parallelizable:** Independent (used by all, but changes don't conflict).

---

## S11-STORE — Redux Infrastructure

**Purpose:** Core Redux setup, middleware, common patterns.

**Files:**
```
src/store/                          # 148 files total
├── index.ts                        # Store configuration
├── rootReducer.ts                  # Combined reducers
├── persistConfig.ts                # redux-persist config
├── migrations.ts                   # Version migrations (v2)
└── [24 slices]

Key Slices:
├── conversation/                   # 16 files — Core
├── notification/                   # 7 files — Sara
├── contact/                        # 13 files — + middleware
├── auth/                           # 9 files
├── settings/                       # 9 files
├── inbox/                          # 8 files
├── appointments/                   # 7 files
├── crm-customers/                  # 8 files
├── agent-settings/                 # 8 files
├── manageable-agents/              # 7 files
├── assignable-agent/               # 8 files
├── conversation-participant/       # 7 files
├── team/                           # 8 files
├── macro/                          # 8 files
├── label/                          # 8 files
├── dashboard-app/                  # 6 files
├── custom-attribute/               # 6 files
├── canned-response/                # 6 files
└── [filter slices, typing, audio]
```

**Dependencies:** None (foundation layer)

**Refactoring Tasks:**
1. Remove unused slices
2. Consolidate similar slices (settings + agent-settings)
3. Improve selector efficiency
4. Standardize action patterns

**Parallelizable:** Core infrastructure — changes affect many slices. Should be done carefully.

---

## S12-SERVICES — API Layer

**Purpose:** HTTP clients for Sara and Chatwoot APIs.

**Files:**
```
src/services/                       # 4 files
├── SaraAPIService.ts               # Sara backend client (singleton)
├── APIService.ts                   # Chatwoot API (minimal)
├── ServiceCatalogService.ts        # Service listing
└── OfficeHoursService.ts           # Office hours config
```

**Known Issues:**
- Most API calls live in Redux thunks, not services
- Only 5 service imports across codebase

**Refactoring Tasks:**
1. Extract API calls from thunks to services
2. Add proper error handling patterns
3. Improve testability with DI

**Parallelizable:** Small, isolated layer.

---

## S13-UTILS — Utilities & Types

**Purpose:** Helper functions, TypeScript types, constants.

**Files:**
```
src/utils/                          # 48 files
├── conversationUtils.ts            # Domain logic
├── messageUtils.ts
├── inboxUtils.ts
├── dateTimeUtils.ts                # Formatting
├── messageFormatterUtils.ts
├── pushUtils.ts                    # FCM integration
├── findNotificationFromFCM.ts
├── ssoUtils.ts                     # Auth helpers
├── actionCable.ts                  # WebSocket
├── baseActionCableConnector.ts
├── customAnimations.ts             # Reanimated
├── useScaleAnimation.ts
├── audioConverter.ios.ts           # Platform-specific
├── audioConverter.android.ts
├── toastUtils.ts
├── navigationUtils.ts
├── permissionUtils.ts
├── phone.ts
└── [more helpers]

src/types/                          # 30 files
├── Conversation.ts
├── Message.ts
├── Contact.ts
├── User.ts
├── Inbox.ts
├── Notification.ts                 # Sara
├── Macro.ts
├── Team.ts
├── Agent.ts
├── Account.ts
├── Label.ts
├── common/                         # Enums, shared types
│   ├── Channel.ts
│   ├── ConversationStatus.ts
│   ├── ConversationPriority.ts
│   ├── CustomAttribute.ts
│   ├── AvailabilityStatus.ts
│   ├── SLA.ts
│   └── UserRole.ts
└── [declaration files]

src/constants/                      # 2 files
src/config/                         # 3 files
src/i18n/                           # 3 files
```

**Dependencies:** None

**Refactoring Tasks:**
1. Consolidate duplicate utilities
2. Add JSDoc to key functions
3. Improve type coverage

**Parallelizable:** Fully independent.

---

## Quick Wins (Start Here)

1. **S01-THEME:** Remove 520+ hardcoded colors — mechanical, high impact
2. **S07-APPOINTMENTS:** Small slice, isolated, easy refactor
3. **S10-COMPONENTS:** Add Storybook stories, no risk
4. **S13-UTILS:** Cleanup, add types — no dependencies
