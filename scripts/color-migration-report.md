# Color Migration Report

Generated: 2025-12-13T22:32:17.061Z

## Summary

- **Total .tsx files scanned:** 317
- **Total hardcoded colors found:** 539
- **Colors with token mapping:** 539 (100.0%)
- **Colors needing manual review:** 0 (0.0%)
- **Unique colors found:** 136

## Color Frequency (Top 30)

| Color | Count | Suggested Token | Status |
|-------|-------|-----------------|--------|
| `#16273D` | 57 | sara-text-primary | Mapped |
| `#4CB6AC` | 41 | sara-accent | Mapped |
| `#858585` | 35 | gray-700 | Mapped |
| `#FFFFFF` | 31 | sara-background-light | Mapped |
| `#666666` | 24 | gray-700 | Mapped |
| `#E6E0D7` | 23 | sara-border | Mapped |
| `#566273` | 21 | sara-text-secondary | Mapped |
| `#F8F5F3` | 18 | sara-background | Mapped |
| `#4B5D6E` | 15 | sara-text-secondary | Mapped |
| `#CCE6DE` | 13 | jade-200 | Mapped |
| `#BBBBBB` | 13 | gray-500 | Mapped |
| `#8D8D8D` | 13 | gray-700 | Mapped |
| `#838383` | 10 | gray-700 | Mapped |
| `#FFC53D` | 9 | amber-700 | Mapped |
| `#D9D9D9` | 7 | gray-300 | Mapped |
| `#0F4D49` | 6 | teal-900 | Mapped |
| `#E5F3F0` | 6 | sara-accent-light | Mapped |
| `#B54747` | 6 | red-800 | Mapped |
| `#DDDDE3` | 6 | gray-300 | Mapped |
| `#FFBA1A` | 6 | amber-700 | Mapped |
| `#8A5A2E` | 5 | brown-700 | Mapped |
| `#646464` | 5 | gray-800 | Mapped |
| `#3B82F6` | 4 | blue-600 | Mapped |
| `#E7E2DD` | 4 | sara-border | Mapped |
| `#E54666` | 4 | red-700 | Mapped |
| `#EF4444` | 3 | red-600 | Mapped |
| `#6C778A` | 3 | sara-text-meta | Mapped |
| `#E6E2DD` | 3 | sara-border | Mapped |
| `#3E63DD` | 3 | indigo-700 | Mapped |
| `#D8D1C9` | 3 | sand-500 | Mapped |

## Occurrences by File

### src/screens/settings/ServiceCatalogScreen.tsx (30 colors)

- Line 71: `#F8F5F3` -> sara-background
  ```ra-background') ?? '#F8F5F3';```
- Line 72: `#FFFFFF` -> sara-background-light
  ```kground-light') ?? '#FFFFFF';```
- Line 73: `#4CB6AC` -> sara-accent
  ```('sara-accent') ?? '#4CB6AC';```
- Line 74: `#16273D` -> sara-text-primary
  ```-text-primary') ?? '#16273D';```
- Line 75: `#4B5D6E` -> sara-text-secondary
  ```ext-secondary') ?? '#4B5D6E';```
- Line 76: `#E6E2DD` -> sara-border
  ```('sara-border') ?? '#E6E2DD';```
- Line 77: `#F5F3F0` -> sara-chip
  ```or('sara-chip') ?? '#F5F3F0';```
- Line 80: `#B54747` -> red-800
  ```ESTRUCTIVE_COLOR = '#B54747';```
- Line 81: `#FEF4E1` -> amber-50
  ```const WARNING_BG = '#FEF4E1';```
- Line 82: `#8A5A2E` -> brown-700
  ```nst WARNING_TEXT = '#8A5A2E';```
- Line 83: `#CCE6DE` -> jade-200
  ```const BADGE_BG = '#CCE6DE';```
- Line 84: `#FDFBF9` -> sara-background
  ```const INPUT_BG = '#FDFBF9';```
- Line 403: `#16273D` -> sara-text-primary
  ```ChevronLeft stroke="#16273D" strokeWidth={1.5}```
- Line 484: `#D8D1C9` -> sand-500
  ```os_backgroundColor="#D8D1C9"```
- Line 545: `#16273D` -> sara-text-primary
  ```ChevronLeft stroke="#16273D" strokeWidth={1.4}```
- Line 557: `#16273D` -> sara-text-primary
  ```n={<AddIcon stroke="#16273D" strokeWidth={1.4}```
- Line 635: `#4B5D6E` -> sara-text-secondary
  ```<PencilIcon stroke="#4B5D6E" strokeWidth={1.4}```
- Line 716: `#EFE8E0` -> sara-chip
  ```backgroundColor: '#EFE8E0',```
- Line 719: `#E3DCD2` -> sand-300
  ```backgroundColor: '#E3DCD2',```
- Line 731: `#E3F2EF` -> teal-100
  ```backgroundColor: '#E3F2EF',```
- ... and 10 more

### src/screens/appointments/AppointmentsScreen.tsx (25 colors)

- Line 62: `#F8F5F3` -> sara-background
  ```ra-background') ?? '#F8F5F3';```
- Line 63: `#FFFFFF` -> sara-background-light
  ```kground-light') ?? '#FFFFFF';```
- Line 64: `#4CB6AC` -> sara-accent
  ```('sara-accent') ?? '#4CB6AC';```
- Line 65: `#16273D` -> sara-text-primary
  ```-text-primary') ?? '#16273D';```
- Line 66: `#4B5D6E` -> sara-text-secondary
  ```ext-secondary') ?? '#4B5D6E';```
- Line 67: `#6C778A` -> sara-text-meta
  ```ara-text-meta') ?? '#6C778A';```
- Line 68: `#E6E2DD` -> sara-border
  ```('sara-border') ?? '#E6E2DD';```
- Line 69: `#F5F3F0` -> sara-chip
  ```or('sara-chip') ?? '#F5F3F0';```
- Line 78: `#CCE6DE` -> jade-200
  ```{ backgroundColor: '#CCE6DE', textColor: '#0F4D```
- Line 78: `#0F4D49` -> teal-900
  ```CE6DE', textColor: '#0F4D49' },```
- Line 79: `#FFF1D6` -> amber-100
  ```{ backgroundColor: '#FFF1D6', textColor: '#8A5A```
- Line 79: `#8A5A2E` -> brown-700
  ```FF1D6', textColor: '#8A5A2E' },```
- Line 80: `#FFE6E0` -> red-100
  ```{ backgroundColor: '#FFE6E0', textColor: '#9F4E```
- Line 80: `#9F4E2F` -> brown-800
  ```FE6E0', textColor: '#9F4E2F' },```
- Line 81: `#F8E6E6` -> red-100
  ```{ backgroundColor: '#F8E6E6', textColor: '#8A3B```
- Line 81: `#8A3B3B` -> red-900
  ```8E6E6', textColor: '#8A3B3B' },```
- Line 82: `#E5E7F2` -> violet-100
  ```{ backgroundColor: '#E5E7F2', textColor: '#3B47```
- Line 82: `#3B4770` -> indigo-900
  ```5E7F2', textColor: '#3B4770' },```
- Line 85: `#E2E6EB` -> slate-200
  ```{ backgroundColor: '#E2E6EB', textColor: '#3D4A```
- Line 85: `#3D4A5C` -> slate-900
  ```2E6EB', textColor: '#3D4A5C' };```
- ... and 5 more

### src/screens/settings/FaqEditorScreen.tsx (25 colors)

- Line 46: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 47: `#E6E0D7` -> sara-border
  ```headerBorder: '#E6E0D7',```
- Line 48: `#E7E2DD` -> sara-border
  ```backButton: '#E7E2DD',```
- Line 49: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 50: `#4B5D6E` -> sara-text-secondary
  ```textSecondary: '#4B5D6E',```
- Line 51: `#FFFFFF` -> sara-background-light
  ```inputBackground: '#FFFFFF',```
- Line 52: `#DDD5CA` -> sand-400
  ```inputBorder: '#DDD5CA',```
- Line 53: `#B54747` -> red-800
  ```error: '#B54747',```
- Line 54: `#E7F4F2` -> teal-100
  ```chipBg: '#E7F4F2',```
- Line 55: `#1E7068` -> teal-900
  ```chipText: '#1E7068',```
- Line 56: `#4B5D6E` -> sara-text-secondary
  ```chipRemove: '#4B5D6E',```
- Line 57: `#E6E0D7` -> sara-border
  ```escalationBorder: '#E6E0D7',```
- Line 58: `#FFF8F0` -> amber-50
  ```alationBackground: '#FFF8F0',```
- Line 59: `#0F9C9C` -> teal-700
  ```accent: '#0F9C9C',```
- Line 60: `#0C7D7D` -> teal-800
  ```accentPressed: '#0C7D7D',```
- Line 61: `#12A594` -> teal-700
  ```saveButtonBg: '#12A594',```
- Line 62: `#0F8B8D` -> teal-700
  ```saveButtonPressed: '#0F8B8D',```
- Line 63: `#C9C3BA` -> sand-600
  ```disabled: '#C9C3BA',```
- Line 64: `#FDEBEB` -> red-100
  ```deleteBackground: '#FDEBEB',```
- Line 65: `#F8D7D7` -> red-200
  ```BackgroundPressed: '#F8D7D7',```
- ... and 5 more

### src/screens/settings/OfficeHoursScreen.tsx (23 colors)

- Line 66: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 67: `#FFFFFF` -> sara-background-light
  ```card: '#FFFFFF',```
- Line 68: `#E6E0D7` -> sara-border
  ```border: '#E6E0D7',```
- Line 69: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 70: `#4B5D6E` -> sara-text-secondary
  ```textSecondary: '#4B5D6E',```
- Line 71: `#CCE6DE` -> jade-200
  ```tagBackground: '#CCE6DE',```
- Line 72: `#0F4D49` -> teal-900
  ```tagText: '#0F4D49',```
- Line 73: `#EDEAE5` -> sara-chip
  ```pressed: '#EDEAE5',```
- Line 74: `#4CB6AC` -> sara-accent
  ```accent: '#4CB6AC',```
- Line 75: `#B54747` -> red-800
  ```destructive: '#B54747',```
- Line 76: `#FDFBF9` -> sara-background
  ```inputBackground: '#FDFBF9',```
- Line 77: `#E6E0D7` -> sara-border
  ```inputBorder: '#E6E0D7',```
- Line 78: `#4CB6AC` -> sara-accent
  ```switchTrackActive: '#4CB6AC',```
- Line 79: `#D8D1C9` -> sand-500
  ```itchTrackInactive: '#D8D1C9',```
- Line 80: `#FFFFFF` -> sara-background-light
  ```switchThumb: '#FFFFFF',```
- Line 81: `#B54747` -> red-800
  ```errorText: '#B54747',```
- Line 253: `#F5D9D9` -> red-200
  ```{ backgroundColor: '#F5D9D9' } : null,```
- Line 954: `#FFFFFF` -> sara-background-light
  ```color: '#FFFFFF',```
- Line 964: `#F8E8E8` -> red-100
  ```backgroundColor: '#F8E8E8',```
- Line 1071: `#A8ABA9` -> sage-600
  ```color: '#A8ABA9',```
- ... and 3 more

### src/screens/contacts/CrmContactDetailsScreen.tsx (22 colors)

- Line 49: `#CCE6DE` -> jade-200
  ```{ backgroundColor: '#CCE6DE', textColor: '#0F4D```
- Line 49: `#0F4D49` -> teal-900
  ```CE6DE', textColor: '#0F4D49' },```
- Line 50: `#FFF1D6` -> amber-100
  ```{ backgroundColor: '#FFF1D6', textColor: '#8A5A```
- Line 50: `#8A5A2E` -> brown-700
  ```FF1D6', textColor: '#8A5A2E' },```
- Line 51: `#FFE6E0` -> red-100
  ```{ backgroundColor: '#FFE6E0', textColor: '#9F4E```
- Line 51: `#9F4E2F` -> brown-800
  ```FE6E0', textColor: '#9F4E2F' },```
- Line 52: `#F8E6E6` -> red-100
  ```{ backgroundColor: '#F8E6E6', textColor: '#8A3B```
- Line 52: `#8A3B3B` -> red-900
  ```8E6E6', textColor: '#8A3B3B' },```
- Line 53: `#E5E7F2` -> violet-100
  ```{ backgroundColor: '#E5E7F2', textColor: '#3B47```
- Line 53: `#3B4770` -> indigo-900
  ```5E7F2', textColor: '#3B4770' },```
- Line 56: `#E2E6EB` -> slate-200
  ```{ backgroundColor: '#E2E6EB', textColor: '#3D4A```
- Line 56: `#3D4A5C` -> slate-900
  ```2E6EB', textColor: '#3D4A5C' };```
- Line 425: `#EFE8E0` -> sara-chip
  ```backgroundColor: '#EFE8E0',```
- Line 501: `#E4F3F0` -> teal-100
  ```backgroundColor: '#E4F3F0',```
- Line 519: `#EEE7E1` -> sand-100
  ```backgroundColor: '#EEE7E1',```
- Line 541: `#E5E3FC` -> iris-100
  ```backgroundColor: '#E5E3FC',```
- Line 546: `#3E3A92` -> iris-900
  ```color: '#3E3A92',```
- Line 579: `#D3E4E1` -> teal-200
  ```backgroundColor: '#D3E4E1',```
- Line 580: `#D3E4E1` -> teal-200
  ```borderColor: '#D3E4E1',```
- Line 587: `#0F4D49` -> teal-900
  ```color: '#0F4D49',```
- ... and 2 more

### src/screens/settings/SettingsScreen.tsx (20 colors)

- Line 108: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 109: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 110: `#4B5D6E` -> sara-text-secondary
  ```textSecondary: '#4B5D6E',```
- Line 111: `#CCE6DE` -> jade-200
  ```badgeBackground: '#CCE6DE',```
- Line 112: `#16273D` -> sara-text-primary
  ```badgeText: '#16273D',```
- Line 113: `#566273` -> sara-text-secondary
  ```footerText: '#566273',```
- Line 114: `#E7E2DD` -> sara-border
  ```geMutedBackground: '#E7E2DD',```
- Line 115: `#4B5D6E` -> sara-text-secondary
  ```badgeMutedText: '#4B5D6E',```
- Line 116: `#FFEBD6` -> amber-100
  ```WarningBackground: '#FFEBD6',```
- Line 117: `#8A5A2E` -> brown-700
  ```badgeWarningText: '#8A5A2E',```
- Line 118: `#0F4D49` -> teal-900
  ```accent: '#0F4D49',```
- Line 119: `#B54747` -> red-800
  ```errorText: '#B54747',```
- Line 120: `#4CB6AC` -> sara-accent
  ```switchTrackActive: '#4CB6AC',```
- Line 121: `#D8D1C9` -> sand-500
  ```itchTrackInactive: '#D8D1C9',```
- Line 122: `#FFFFFF` -> sara-background-light
  ```switchThumb: '#FFFFFF',```
- Line 1007: `#E1D9CF` -> sand-400
  ```borderColor: '#E1D9CF',```
- Line 1010: `#FFFFFF` -> sara-background-light
  ```backgroundColor: '#FFFFFF',```
- Line 1014: `#EEF7F5` -> teal-50
  ```backgroundColor: '#EEF7F5',```
- Line 1033: `#D5CBC0` -> sand-500
  ```borderColor: '#D5CBC0',```
- Line 1038: `#DFF4F0` -> teal-100
  ```backgroundColor: '#DFF4F0',```

### src/screens/settings/FaqScreen.tsx (18 colors)

- Line 30: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 31: `#E6E0D7` -> sara-border
  ```headerBorder: '#E6E0D7',```
- Line 32: `#E7E2DD` -> sara-border
  ```backButton: '#E7E2DD',```
- Line 33: `#12A594` -> teal-700
  ```addButton: '#12A594',```
- Line 34: `#0E857F` -> teal-700
  ```addButtonPressed: '#0E857F',```
- Line 35: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 36: `#4B5D6E` -> sara-text-secondary
  ```textSecondary: '#4B5D6E',```
- Line 37: `#FFFFFF` -> sara-background-light
  ```card: '#FFFFFF',```
- Line 38: `#E6E0D7` -> sara-border
  ```border: '#E6E0D7',```
- Line 39: `#FFEBD6` -> amber-100
  ```badgeEscalationBg: '#FFEBD6',```
- Line 40: `#8A5A2E` -> brown-700
  ```dgeEscalationText: '#8A5A2E',```
- Line 41: `#F1EAE1` -> sara-chip
  ```triggerChipBg: '#F1EAE1',```
- Line 42: `#4B5D6E` -> sara-text-secondary
  ```triggerChipText: '#4B5D6E',```
- Line 43: `#FDF3F3` -> red-50
  ```errorBg: '#FDF3F3',```
- Line 44: `#B54747` -> red-800
  ```errorText: '#B54747',```
- Line 45: `#FFFFFF` -> sara-background-light
  ```answerBubble: '#FFFFFF',```
- Line 46: `#D6CEC4` -> sand-500
  ```answerShadow: '#D6CEC4',```
- Line 207: `#FFFFFF` -> sara-background-light
  ```n={<AddIcon stroke="#FFFFFF" />} size={20} />```

### src/components-next/label-section/LabelCell.stories.tsx (17 colors)

- Line 9: `#EF4444` -> red-600
  ```ug report', color: '#EF4444', showOnSidebar: tr```
- Line 10: `#3B82F6` -> blue-600
  ```e request', color: '#3B82F6', showOnSidebar: tr```
- Line 11: `#10B981` -> green-600
  ```hancement', color: '#10B981', showOnSidebar: tr```
- Line 12: `#8B5CF6` -> violet-600
  ```on: 'Docs', color: '#8B5CF6', showOnSidebar: tr```
- Line 13: `#F59E0B` -> amber-600
  ```'Question', color: '#F59E0B', showOnSidebar: tr```
- Line 32: `#FFFFFF` -> sara-background-light
  ```backgroundColor: '#FFFFFF',```
- Line 124: `#EF4444` -> red-600
  ```iption: '', color: '#EF4444', showOnSidebar: tr```
- Line 125: `#3B82F6` -> blue-600
  ```iption: '', color: '#3B82F6', showOnSidebar: tr```
- Line 126: `#10B981` -> green-600
  ```iption: '', color: '#10B981', showOnSidebar: tr```
- Line 127: `#8B5CF6` -> violet-600
  ```iption: '', color: '#8B5CF6', showOnSidebar: tr```
- Line 128: `#F59E0B` -> amber-600
  ```iption: '', color: '#F59E0B', showOnSidebar: tr```
- Line 129: `#EC4899` -> pink-600
  ```iption: '', color: '#EC4899', showOnSidebar: tr```
- Line 130: `#14B8A6` -> teal-600
  ```iption: '', color: '#14B8A6', showOnSidebar: tr```
- Line 131: `#F97316` -> orange-600
  ```iption: '', color: '#F97316', showOnSidebar: tr```
- Line 156: `#FFFFFF` -> sara-background-light
  ```backgroundColor: '#FFFFFF',```
- Line 158: `#000000` -> black
  ```shadowColor: '#000',```
- Line 165: `#E5E5E5` -> gray-200
  ```borderBottomColor: '#E5E5E5' }}>```

### src/components-next/spinner/Spinner.stories.tsx (17 colors)

- Line 70: `#4CB6AC` -> sara-accent
  ```stroke: '#4CB6AC', // sara-accent co```
- Line 78: `#3B82F6` -> blue-600
  ```stroke: '#3B82F6',```
- Line 88: `#666666` -> gray-700
  ```rginTop: 8, color: '#666' }}>16px</Text>```
- Line 92: `#666666` -> gray-700
  ```rginTop: 8, color: '#666' }}>24px</Text>```
- Line 96: `#666666` -> gray-700
  ```rginTop: 8, color: '#666' }}>32px</Text>```
- Line 100: `#666666` -> gray-700
  ```rginTop: 8, color: '#666' }}>48px</Text>```
- Line 104: `#666666` -> gray-700
  ```rginTop: 8, color: '#666' }}>64px</Text>```
- Line 116: `#666666` -> gray-700
  ```rginTop: 8, color: '#666', fontSize: 12 }}>D```
- Line 119: `#4CB6AC` -> sara-accent
  ```r size={32} stroke="#4CB6AC" />```
- Line 120: `#666666` -> gray-700
  ```rginTop: 8, color: '#666', fontSize: 12 }}>T```
- Line 123: `#3B82F6` -> blue-600
  ```r size={32} stroke="#3B82F6" />```
- Line 124: `#666666` -> gray-700
  ```rginTop: 8, color: '#666', fontSize: 12 }}>B```
- Line 127: `#EF4444` -> red-600
  ```r size={32} stroke="#EF4444" />```
- Line 128: `#666666` -> gray-700
  ```rginTop: 8, color: '#666', fontSize: 12 }}>R```
- Line 139: `#1F2937` -> gray-950
  ```backgroundColor: '#1F2937',```
- Line 144: `#FFFFFF` -> sara-background-light
  ```r size={32} stroke="#FFFFFF" />```
- Line 145: `#FFFFFF` -> sara-background-light
  ```ginTop: 12, color: '#FFFFFF' }}>Loading...</Tex```

### src/screens/auth/LoginScreen.tsx (12 colors)

- Line 151: `#F8F5F3` -> sara-background
  ```nt backgroundColor="#F8F5F3" barStyle="dark-con```
- Line 192: `#6C778A` -> sara-text-meta
  ```aceholderTextColor="#6C778A"```
- Line 240: `#6C778A` -> sara-text-meta
  ```aceholderTextColor="#6C778A"```
- Line 291: `#F8F5F3` -> sara-background
  ```backgroundColor: '#F8F5F3',```
- Line 304: `#16273D` -> sara-text-primary
  ```color: '#16273D',```
- Line 307: `#4B5D6E` -> sara-text-secondary
  ```color: '#4B5D6E',```
- Line 313: `#16273D` -> sara-text-primary
  ```color: '#16273D',```
- Line 316: `#FFFFFF` -> sara-background-light
  ```backgroundColor: '#FFFFFF',```
- Line 319: `#CCE6DE` -> jade-200
  ```borderColor: '#CCE6DE',```
- Line 320: `#16273D` -> sara-text-primary
  ```color: '#16273D',```
- Line 323: `#4CB6AC` -> sara-accent
  ```color: '#4CB6AC',```
- Line 326: `#566273` -> sara-text-secondary
  ```color: '#566273',```

### src/screens/chat-screen/components/message-item/Message.tsx (11 colors)

- Line 66: `#16273D` -> sara-text-primary
  ```IANTS.USER]: 'text-[#16273D]',```
- Line 67: `#16273D` -> sara-text-primary
  ```RIANTS.BOT]: 'text-[#16273D]',```
- Line 68: `#16273D` -> sara-text-primary
  ```S.TEMPLATE]: 'text-[#16273D]',```
- Line 71: `#566273` -> sara-text-secondary
  ```S.ACTIVITY]: 'text-[#566273]',```
- Line 72: `#16273D` -> sara-text-primary
  ```ANTS.EMAIL]: 'text-[#16273D]',```
- Line 73: `#566273` -> sara-text-secondary
  ```NSUPPORTED]: 'text-[#566273]',```
- Line 77: `#4CB6AC` -> sara-accent
  ```RIANTS.AGENT]: 'bg-[#4CB6AC]',```
- Line 80: `#E5F3F0` -> sara-accent-light
  ```VARIANTS.BOT]: 'bg-[#E5F3F0]',```
- Line 81: `#E5F3F0` -> sara-accent-light
  ```NTS.TEMPLATE]: 'bg-[#E5F3F0]',```
- Line 90: `#CCE6DE` -> jade-200
  ```R]: 'border border-[#CCE6DE]',```
- Line 94: `#E5F3F0` -> sara-accent-light
  ```L]: 'border border-[#E5F3F0]',```

### src/screens/settings/AgentProfileScreen.tsx (9 colors)

- Line 46: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 47: `#FFFFFF` -> sara-background-light
  ```panel: '#FFFFFF',```
- Line 48: `#E6E0D7` -> sara-border
  ```border: '#E6E0D7',```
- Line 49: `#4B5D6E` -> sara-text-secondary
  ```muted: '#4B5D6E',```
- Line 50: `#16273D` -> sara-text-primary
  ```heading: '#16273D',```
- Line 51: `#0F4D49` -> teal-900
  ```accent: '#0F4D49',```
- Line 52: `#4CB6AC` -> sara-accent
  ```teal: '#4CB6AC',```
- Line 53: `#16273D` -> sara-text-primary
  ```tealText: '#16273D',```
- Line 402: `#EEF7F5` -> teal-50
  ```dColor: isActive ? '#EEF7F5' : 'transparent',```

### src/svg-icons/status-icons/Pending.tsx (8 colors)

- Line 6: `#858585` -> gray-700
  ```Icon = ({ stroke = '#858585' }: IconProps): JSX```
- Line 24: `#D9D9D9` -> gray-300
  ```" height="32" fill="#D9D9D9" />```
- Line 29: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```
- Line 33: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```
- Line 37: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```
- Line 41: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```
- Line 45: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```
- Line 49: `#FFBA1A` -> amber-700
  ```fill="#FFBA1A"```

### src/components-next/button/AuthButton.stories.tsx (7 colors)

- Line 11: `#838383` -> gray-700
  ```fill="#838383"```
- Line 21: `#838383` -> gray-700
  ```stroke="#838383"```
- Line 33: `#838383` -> gray-700
  ```stroke="#838383"```
- Line 127: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Outline:</Text>```
- Line 131: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Filled:</Text>```
- Line 135: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>```
- Line 141: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Disabled Filled```

### src/screens/chat-screen/components/message-components/MessageTextCell.tsx (7 colors)

- Line 14: `#FFFFFF` -> sara-background-light
  ```incomingBubble: '#FFFFFF',```
- Line 15: `#CCE6DE` -> jade-200
  ```incomingBorder: '#CCE6DE',```
- Line 16: `#16273D` -> sara-text-primary
  ```incomingText: '#16273D',```
- Line 17: `#566273` -> sara-text-secondary
  ```incomingTimestamp: '#566273',```
- Line 18: `#4CB6AC` -> sara-accent
  ```outgoingBubble: '#4CB6AC',```
- Line 19: `#FFFFFF` -> sara-background-light
  ```outgoingText: '#FFFFFF',```
- Line 20: `#F2FFFB` -> mint-50
  ```outgoingTimestamp: '#F2FFFB',```

### src/screens/conversations/components/conversation-header/ConversationHeaderPresenter.tsx (7 colors)

- Line 45: `#16273D` -> sara-text-primary
  ```] text-center text-[#16273D]',```
- Line 76: `#566273` -> sara-text-secondary
  ```checkedIcon stroke="#566273" />```
- Line 103: `#B4BFC6` -> slate-400
  ```ount === 0 ? 'text-[#B4BFC6]' : 'text-[#4CB6AC]```
- Line 103: `#4CB6AC` -> sara-accent
  ```[#B4BFC6]' : 'text-[#4CB6AC]',```
- Line 125: `#16273D` -> sara-text-primary
  ```{<CloseIcon stroke="#16273D" />} />```
- Line 132: `#4CB6AC` -> sara-accent
  ```.5 rounded-full bg-[#4CB6AC]',```
- Line 136: `#4CB6AC` -> sara-accent
  ```<FilterIcon stroke="#4CB6AC" />} />```

### src/svg-icons/common/NotificationIcons.tsx (7 colors)

- Line 8: `#D9D9D9` -> gray-300
  ```" height="20" fill="#D9D9D9" />```
- Line 15: `#3E63DD` -> indigo-700
  ```fill="#3E63DD"```
- Line 27: `#2781F6` -> blue-700
  ```fill="#2781F6"```
- Line 36: `#4CB6AC` -> sara-accent
  ```="20" rx="10" fill="#4CB6AC" />```
- Line 37: `#F8F5F3` -> sara-background
  ```9" rx="4.5" stroke="#F8F5F3" strokeWidth="1.2"```
- Line 48: `#8D8D8D` -> gray-700
  ```fill="#8D8D8D"```
- Line 57: `#E54666` -> red-700
  ```="20" rx="10" fill="#E54666" />```

### src/components-next/list-components/PriorityIndicator.stories.tsx (6 colors)

- Line 79: `#666666` -> gray-700
  ```xt style={{ color: '#666' }}>Urgent</Text>```
- Line 83: `#666666` -> gray-700
  ```xt style={{ color: '#666' }}>High</Text>```
- Line 87: `#666666` -> gray-700
  ```xt style={{ color: '#666' }}>Medium</Text>```
- Line 91: `#666666` -> gray-700
  ```xt style={{ color: '#666' }}>Low</Text>```
- Line 108: `#F5F5F5` -> gray-100
  ```backgroundColor: '#F5F5F5',```
- Line 115: `#666666` -> gray-700
  ```xt style={{ color: '#666', fontSize: 12 }}>P```

### src/components-next/list-components/SettingsList.tsx (6 colors)

- Line 22: `#FFFFFF` -> sara-background-light
  ```card: '#FFFFFF',```
- Line 23: `#EDEAE5` -> sara-chip
  ```pressed: '#EDEAE5',```
- Line 24: `#E6E0D7` -> sara-border
  ```border: '#E6E0D7',```
- Line 25: `#566273` -> sara-text-secondary
  ```heading: '#566273',```
- Line 26: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 27: `#4B5D6E` -> sara-text-secondary
  ```textSecondary: '#4B5D6E',```

### src/screens/chat-screen/components/message-components/AudioBubble.tsx (6 colors)

- Line 159: `#E4EFEC` -> teal-100
  ```ARIANTS.USER ? 'bg-[#E4EFEC]' : 'bg-[#C2E4DE]',```
- Line 159: `#C2E4DE` -> jade-200
  ```g-[#E4EFEC]' : 'bg-[#C2E4DE]',```
- Line 161: `#4CB6AC` -> sara-accent
  ```ARIANTS.USER ? 'bg-[#4CB6AC]' : 'bg-[#1F7F75]',```
- Line 161: `#1F7F75` -> teal-800
  ```g-[#4CB6AC]' : 'bg-[#1F7F75]',```
- Line 163: `#4CB6AC` -> sara-accent
  ```R ? 'border border-[#4CB6AC]' : 'border border-```
- Line 163: `#1F7F75` -> teal-800
  ```' : 'border border-[#1F7F75]',```

### src/screens/chat-screen/components/message-components/FileBubble.tsx (6 colors)

- Line 81: `#4CB6AC` -> sara-accent
  ```GE_VARIANTS.USER ? '#4CB6AC' : '#FFFFFF'}```
- Line 81: `#FFFFFF` -> sara-background-light
  ```USER ? '#4CB6AC' : '#FFFFFF'}```
- Line 90: `#16273D` -> sara-text-primary
  ```GE_VARIANTS.USER ? '#16273D' : '#FFFFFF'}```
- Line 90: `#FFFFFF` -> sara-background-light
  ```USER ? '#16273D' : '#FFFFFF'}```
- Line 108: `#16273D` -> sara-text-primary
  ```? 'text-[#16273D]'```
- Line 122: `#CCE6DE` -> jade-200
  ```GE_VARIANTS.USER ? '#CCE6DE' : 'rgba(255,255,25```

### src/screens/inbox/components/NotificationTypeIndicator.tsx (6 colors)

- Line 9: `#6AB4B6` -> cyan-600
  ```teal: '#6AB4B6',```
- Line 10: `#16273D` -> sara-text-primary
  ```navy: '#16273D',```
- Line 11: `#CCE6DE` -> jade-200
  ```mint: '#CCE6DE',```
- Line 12: `#F6A609` -> amber-800
  ```warning: '#F6A609',```
- Line 13: `#D84356` -> red-700
  ```error: '#D84356',```
- Line 14: `#3E63DD` -> indigo-700
  ```blue: '#3E63DD',```

### src/components-next/button/IconButton.stories.tsx (5 colors)

- Line 87: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Primary:</Text>```
- Line 91: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Secondary:</Tex```
- Line 95: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>```
- Line 101: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>```
- Line 107: `#666666` -> gray-700
  ```ht: 'bold', color: '#666' }}>Disabled:</Text```

### src/components-next/sara-logo/SaraLogo.tsx (5 colors)

- Line 17: `#4CB6AC` -> sara-accent
  ```efault sara-accent (#4CB6AC)```
- Line 22: `#16273D` -> sara-text-primary
  ```sara-text-primary (#16273D)```
- Line 47: `#4CB6AC` -> sara-accent
  ```go size={48} color="#4CB6AC" />```
- Line 64: `#4CB6AC` -> sara-accent
  ```('sara-accent') ?? '#4CB6AC';```
- Line 65: `#16273D` -> sara-text-primary
  ```-text-primary') ?? '#16273D';```

### src/screens/conversations/components/conversation-actions/UpdateAssignee.tsx (5 colors)

- Line 44: `#E6E0D7` -> sara-border
  ```der-b-[1px] border-[#E6E0D7]' : '',```
- Line 49: `#16273D` -> sara-text-primary
  ```'text-base text-[#16273D] font-inter-420-20```
- Line 140: `#4CB6AC` -> sara-accent
  ```ityIndicator color="#4CB6AC" />```
- Line 152: `#E6E0D7` -> sara-border
  ```der-b-[1px] border-[#E6E0D7]',```
- Line 157: `#4CB6AC` -> sara-accent
  ```'text-base text-[#4CB6AC] font-inter-420-20```

### src/screens/conversations/components/conversation-item/ConversationLastMessage.tsx (5 colors)

- Line 87: `#566273` -> sara-text-secondary
  ```eading-[21px] text-[#566273]',```
- Line 100: `#566273` -> sara-text-secondary
  ```eading-[21px] text-[#566273]',```
- Line 106: `#566273` -> sara-text-secondary
  ```eading-[21px] text-[#566273]',```
- Line 121: `#566273` -> sara-text-secondary
  ```eading-[21px] text-[#566273]',```
- Line 131: `#566273` -> sara-text-secondary
  ```eading-[21px] text-[#566273]',```

### src/components-next/sheet-components/NotificationPreferences.tsx (4 colors)

- Line 73: `#C9D7E3` -> slate-300
  ```ackColor={{ false: '#C9D7E3', true: '#1F93FF' }```
- Line 73: `#1F93FF` -> blue-700
  ```: '#C9D7E3', true: '#1F93FF' }}```
- Line 74: `#FFFFFF` -> sara-background-light
  ```thumbColor="#FFFFFF"```
- Line 76: `#C9D7E3` -> slate-300
  ```os_backgroundColor="#C9D7E3"```

### src/screens/chat-screen/components/chat-header/ChatHeader.tsx (4 colors)

- Line 30: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 31: `#16273D` -> sara-text-primary
  ```textPrimary: '#16273D',```
- Line 93: `#E13D45` -> red-700
  ```lor={isSlaMissed ? '#E13D45' : '#BBBBBB'} />} s```
- Line 93: `#BBBBBB` -> gray-500
  ```ssed ? '#E13D45' : '#BBBBBB'} />} size={24} />```

### src/screens/conversations/ConversationScreen.tsx (4 colors)

- Line 73: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 74: `#4CB6AC` -> sara-accent
  ```accent: '#4CB6AC',```
- Line 75: `#566273` -> sara-text-secondary
  ```textSecondary: '#566273',```
- Line 331: `#4CB6AC` -> sara-accent
  ```overflow-hidden bg-[#4CB6AC] w-8 h-1 rounded-[1```

### src/screens/inbox/NotificationDetailScreen.tsx (4 colors)

- Line 28: `#4CB6AC` -> sara-accent
  ```rIcon = ({ color = '#4CB6AC' }: { color?: strin```
- Line 40: `#4CB6AC` -> sara-accent
  ```rIcon = ({ color = '#4CB6AC' }: { color?: strin```
- Line 52: `#4CB6AC` -> sara-accent
  ```eIcon = ({ color = '#4CB6AC' }: { color?: strin```
- Line 71: `#4CB6AC` -> sara-accent
  ```rIcon = ({ color = '#4CB6AC' }: { color?: strin```

### src/svg-icons/channels/Facebook.tsx (4 colors)

- Line 7: `#BBBBBB` -> gray-500
  ```y="8.5" r="8" fill="#BBBBBB" />```
- Line 21: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```
- Line 35: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```
- Line 57: `#BBBBBB` -> gray-500
  ```fill="#BBBBBB"```

### src/svg-icons/channels/X.tsx (4 colors)

- Line 7: `#171717` -> gray-950
  ```y="10" r="10" fill="#171717" />```
- Line 20: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```
- Line 40: `#838383` -> gray-700
  ```fill="#838383"```
- Line 51: `#838383` -> gray-700
  ```fill="#838383"```

### src/svg-icons/common/Priority.tsx (4 colors)

- Line 8: `#ED8A5C` -> orange-600
  ```" height="24" fill="#ED8A5C" />```
- Line 11: `#FFC53D` -> amber-700
  ```ht="8" rx="2" fill="#FFC53D" />```
- Line 12: `#FFC53D` -> amber-700
  ```t="12" rx="2" fill="#FFC53D" />```
- Line 13: `#FFC53D` -> amber-700
  ```t="16" rx="2" fill="#FFC53D" />```

### src/svg-icons/conversation-icons/NoPriority.tsx (4 colors)

- Line 8: `#D9D9D9` -> gray-300
  ```" height="24" fill="#D9D9D9" />```
- Line 11: `#DDDDE3` -> gray-300
  ```ht="8" rx="2" fill="#DDDDE3" />```
- Line 12: `#DDDDE3` -> gray-300
  ```t="12" rx="2" fill="#DDDDE3" />```
- Line 13: `#DDDDE3` -> gray-300
  ```t="16" rx="2" fill="#DDDDE3" />```

### src/svg-icons/conversation-icons/Unassigned.tsx (4 colors)

- Line 9: `#8D8D8D` -> gray-700
  ```stroke="#8D8D8D"```
- Line 16: `#8D8D8D` -> gray-700
  ```stroke="#8D8D8D"```
- Line 21: `#8D8D8D` -> gray-700
  ```stroke="#8D8D8D"```
- Line 28: `#8D8D8D` -> gray-700
  ```stroke="#8D8D8D"```

### src/svg-icons/priority-icons/High.tsx (4 colors)

- Line 15: `#ED8A5C` -> orange-600
  ```" height="24" fill="#ED8A5C" />```
- Line 18: `#FFC53D` -> amber-700
  ```ht="8" rx="2" fill="#FFC53D" />```
- Line 19: `#FFC53D` -> amber-700
  ```t="12" rx="2" fill="#FFC53D" />```
- Line 20: `#FFC53D` -> amber-700
  ```t="16" rx="2" fill="#FFC53D" />```

### src/svg-icons/priority-icons/Low.tsx (4 colors)

- Line 15: `#D9D9D9` -> gray-300
  ```" height="24" fill="#D9D9D9" />```
- Line 18: `#FFC53D` -> amber-700
  ```ht="8" rx="2" fill="#FFC53D" />```
- Line 19: `#DDDDE3` -> gray-300
  ```t="12" rx="2" fill="#DDDDE3" />```
- Line 20: `#DDDDE3` -> gray-300
  ```t="16" rx="2" fill="#DDDDE3" />```

### src/svg-icons/priority-icons/Medium.tsx (4 colors)

- Line 15: `#D9D9D9` -> gray-300
  ```" height="24" fill="#D9D9D9" />```
- Line 18: `#FFC53D` -> amber-700
  ```ht="8" rx="2" fill="#FFC53D" />```
- Line 19: `#FFC53D` -> amber-700
  ```t="12" rx="2" fill="#FFC53D" />```
- Line 20: `#DDDDE3` -> gray-300
  ```t="16" rx="2" fill="#DDDDE3" />```

### src/svg-icons/priority-icons/Urgent.tsx (4 colors)

- Line 15: `#ED8A5C` -> orange-600
  ```" height="24" fill="#ED8A5C" />```
- Line 18: `#E54666` -> red-700
  ```ht="8" rx="2" fill="#E54666" />```
- Line 19: `#E54666` -> red-700
  ```t="12" rx="2" fill="#E54666" />```
- Line 22: `#E54666` -> red-700
  ```fill="#E54666"```

### src/svg-icons/sara/SaraWordmark.tsx (4 colors)

- Line 7: `#16273D` -> sara-text-primary
  ```* @default '#16273D' (sara-text-primary```
- Line 12: `#4CB6AC` -> sara-accent
  ```* @default '#4CB6AC' (sara-accent)```
- Line 27: `#16273D` -> sara-text-primary
  ```textColor = '#16273D',```
- Line 28: `#4CB6AC` -> sara-accent
  ```markColor = '#4CB6AC',```

### src/screens/chat-screen/components/message-components/MarkdownDisplay.tsx (3 colors)

- Line 8: `#16273D` -> sara-text-primary
  ```incomingText: '#16273D',```
- Line 9: `#FFFFFF` -> sara-background-light
  ```outgoingText: '#FFFFFF',```
- Line 30: `#FFFFFF` -> sara-background-light
  ```return '#FFFFFF';```

### src/screens/chat-screen/components/message-components/ReplyMessageBubble.tsx (3 colors)

- Line 20: `#E5F3F0` -> sara-accent-light
  ```RIANTS.AGENT]: 'bg-[#E5F3F0]',```
- Line 21: `#F1F6F5` -> teal-50
  ```ARIANTS.USER]: 'bg-[#F1F6F5]',```
- Line 69: `#4CB6AC` -> sara-accent
  ```o rounded-[4px] bg-[#4CB6AC]')} />```

### src/screens/contacts/ContactsScreen.tsx (3 colors)

- Line 465: `#E7E2DD` -> sara-border
  ```backgroundColor: '#E7E2DD',```
- Line 479: `#FFFFFF` -> sara-background-light
  ```color: '#FFFFFF',```
- Line 507: `#F1EBE4` -> sara-chip
  ```backgroundColor: '#F1EBE4',```

### src/screens/conversations/components/conversation-actions/UpdateTeam.tsx (3 colors)

- Line 56: `#E6E0D7` -> sara-border
  ```der-b-[1px] border-[#E6E0D7]' : '',```
- Line 61: `#16273D` -> sara-text-primary
  ```'text-base text-[#16273D] font-inter-420-20```
- Line 78: `#4CB6AC` -> sara-accent
  ```ityIndicator color="#4CB6AC" />```

### src/screens/conversations/components/conversation-header/ConversationHeaderPresenter.stories.tsx (3 colors)

- Line 31: `#E6E0D7` -> sara-border
  ```der-b-[1px] border-[#E6E0D7]')}>```
- Line 49: `#566273` -> sara-text-secondary
  ```medium italic text-[#566273]')}>{title}</Text>```
- Line 54: `#E6E0D7` -> sara-border
  ```der-b-[1px] border-[#E6E0D7] ')}>{children}</Vi```

### src/screens/conversations/components/conversation-item/ConversationItemDetail.tsx (3 colors)

- Line 89: `#E6E0D7` -> sara-border
  ```r-b-[1px] border-b-[#E6E0D7]')}>```
- Line 96: `#16273D` -> sara-text-primary
  ```king-[0.24px] text-[#16273D] capitalize',```
- Line 145: `#E6E0D7` -> sara-border
  ```le('w-[1px] h-3 bg-[#E6E0D7]')} />```

### src/screens/conversations/components/conversation-item/SLAIndicator.tsx (3 colors)

- Line 84: `#E13D45` -> red-700
  ```tus?.isSlaMissed ? '#E13D45' : '#BBBBBB'} />```
- Line 84: `#BBBBBB` -> gray-500
  ```ssed ? '#E13D45' : '#BBBBBB'} />```
- Line 88: `#566273` -> sara-text-secondary
  ```-ruby-800' : 'text-[#566273]',```

### src/screens/settings/SettingsHeader.tsx (3 colors)

- Line 8: `#F8F5F3` -> sara-background
  ```background: '#F8F5F3',```
- Line 9: `#16273D` -> sara-text-primary
  ```text: '#16273D',```
- Line 10: `#E6E0D7` -> sara-border
  ```border: '#E6E0D7',```

### src/svg-icons/channels/Telegram.tsx (3 colors)

- Line 20: `#2AABEE` -> sky-700
  ```<Stop stopColor="#2AABEE" />```
- Line 21: `#229ED9` -> sky-700
  ```fset="1" stopColor="#229ED9" />```
- Line 31: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```

### src/svg-icons/channels/WhatsApp.tsx (3 colors)

- Line 7: `#02BC02` -> green-700
  ```y="10" r="10" fill="#02BC02" />```
- Line 19: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```
- Line 31: `#BBBBBB` -> gray-500
  ```y="10" r="10" fill="#BBBBBB" />```
