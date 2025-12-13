# Sara Admin Design Guidelines

This document outlines the design patterns, color palette, and component conventions used in the Sara Admin CRM interface.

---

## Color Palette

### Brand Colors (Primary)

| Name | Hex | Usage |
|------|-----|-------|
| **Teal** | `#6AB4B6` | Primary actions, success states, confirmations, links |
| **Navy** | `#16273D` | Headings, primary text, secondary buttons |
| **Mint** | `#CCE6DE` | Info backgrounds, soft accents |
| **Warning** | `#F6A609` | Warnings, pending states, attention needed |
| **Error** | `#D84356` | Errors, cancellations, destructive actions |

### Extended Palette

```typescript
const colors = {
  // Primary
  teal: '#6AB4B6',
  tealLight: '#E8F4F4',      // Backgrounds, chips
  tealDark: '#4A9A9C',       // Hover states

  // Secondary
  navy: '#16273D',
  navyLight: '#2D4A6B',      // Hover states

  // Neutrals
  slate: '#64748B',          // Secondary text
  slateLight: '#94A3B8',     // Placeholder text
  border: '#E2E8F0',         // Dividers, card borders

  // Surfaces
  surface: '#FFFFFF',        // Card backgrounds
  surfaceHover: '#FAFBFC',   // Hover backgrounds
  background: '#F8FAFC',     // Page backgrounds
  paper: '#F8F5F3',          // Alternative background
  beige: '#FFFFF4',          // Sidebar background
};
```

### Using Alpha Transparency

Use MUI's `alpha()` function for consistent transparency:

```typescript
import { alpha } from '@mui/material';

// Tinted backgrounds
bgcolor: alpha(colors.teal, 0.1)    // 10% - chips, badges
bgcolor: alpha(colors.teal, 0.05)   // 5% - hover states
bgcolor: alpha(colors.navy, 0.03)   // 3% - subtle highlights

// Shadows
boxShadow: `0 2px 8px ${alpha(colors.teal, 0.3)}`   // Buttons
boxShadow: `0 4px 16px ${alpha(colors.navy, 0.08)}` // Cards on hover
```

---

## Typography

### Font Family

```typescript
fontFamily: "'Roboto', sans-serif"
```

### Heading Styles

| Element | Size | Weight | Letter Spacing |
|---------|------|--------|----------------|
| Page title (h3) | `2.25rem` (36px) | 700 | `-0.03em` |
| Section title (h5/h6) | `0.95rem` (15px) | 700 | `-0.01em` |
| Card title | `1rem` (16px) | 600 | default |
| Label (uppercase) | `0.7rem` (11px) | 600 | `0.1em` |

### Body Text

| Element | Size | Color |
|---------|------|-------|
| Primary text | `0.9rem` | `colors.navy` |
| Secondary text | `0.8rem` | `colors.slate` |
| Caption | `0.75rem` | `text.secondary` |

### Text Conventions

```typescript
// Page titles
<Typography variant="h5" sx={{ color: colors.navy, fontWeight: 700 }}>
  Notifications
</Typography>

// Section headers
<Typography variant="h6" sx={{
  fontWeight: 700,
  color: colors.navy,
  fontSize: '0.95rem'
}}>
  Section Title
</Typography>

// Uppercase labels
<Typography variant="caption" sx={{
  fontWeight: 600,
  color: colors.teal,
  textTransform: 'uppercase',
  letterSpacing: 0.5
}}>
  CONFIRMED
</Typography>
```

---

## Cards & Sections

### Standard Card

```typescript
<Card
  variant="outlined"
  sx={{
    borderRadius: 2,                    // 16px
    border: 'none',
    boxShadow: `0 1px 4px ${alpha(colors.navy, 0.06)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 16px ${alpha(colors.navy, 0.1)}`,
    },
  }}
>
```

### Section Wrapper (Settings Pages)

```typescript
<Box sx={{
  mb: 3,
  p: 3,
  bgcolor: colors.surface,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor: alpha(colors.teal, 0.3),
    boxShadow: `0 4px 20px ${alpha(colors.navy, 0.06)}`,
  },
}}>
```

### Accent Bar (Status Indicator)

For notification-style cards, use a left border accent:

```typescript
'&::before': {
  content: '""',
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  width: 4,
  borderRadius: '8px 0 0 8px',
  background: isActive
    ? `linear-gradient(180deg, ${accentColor} 0%, ${alpha(accentColor, 0.6)} 100%)`
    : `linear-gradient(180deg, ${alpha(accentColor, 0.4)} 0%, ${alpha(accentColor, 0.2)} 100%)`,
},
```

---

## Buttons

### Primary Button (Teal)

```typescript
<Button
  variant="contained"
  sx={{
    bgcolor: colors.teal,
    fontWeight: 600,
    borderRadius: 1.5,              // 12px
    textTransform: 'none',
    boxShadow: `0 2px 8px ${alpha(colors.teal, 0.3)}`,
    '&:hover': {
      bgcolor: alpha(colors.teal, 0.9),
      boxShadow: `0 4px 12px ${alpha(colors.teal, 0.4)}`,
    },
  }}
>
```

### Secondary Button (Navy)

```typescript
<Button
  sx={{
    bgcolor: colors.navy,
    color: 'white',
    fontWeight: 600,
    borderRadius: '10px',
    textTransform: 'none',
    '&:hover': {
      bgcolor: colors.navyLight,
      boxShadow: `0 8px 24px ${alpha(colors.navy, 0.25)}`,
      transform: 'translateY(-1px)',
    },
  }}
>
```

### Outline/Destructive Button

```typescript
<Button
  variant="outlined"
  sx={{
    borderColor: alpha(colors.error, 0.5),
    color: colors.error,
    fontWeight: 500,
    borderRadius: 1.5,
    textTransform: 'none',
    '&:hover': {
      borderColor: colors.error,
      bgcolor: alpha(colors.error, 0.05),
    },
  }}
>
```

### Text/Ghost Button

```typescript
<Button
  variant="text"
  sx={{
    color: colors.teal,
    fontWeight: 500,
    '&:hover': { bgcolor: alpha(colors.teal, 0.08) },
  }}
>
```

---

## Icons

### Icon Box (Header)

```typescript
<Box sx={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 1,
  bgcolor: alpha(accentColor, 0.1),
  color: accentColor,
}}>
  <SomeIcon fontSize="small" />
</Box>
```

### Recommended Icons by Context

| Context | Icon | Import |
|---------|------|--------|
| Confirmed/Success | `CheckCircleOutline` | `@mui/icons-material` |
| Pending/Decision | `PendingActions` | `@mui/icons-material` |
| Cancelled/Error | `Cancel` | `@mui/icons-material` |
| Rescheduled | `EventRepeat` | `@mui/icons-material` |
| Payment | `Payment` | `@mui/icons-material` |
| Escalated/Support | `SupportAgent` | `@mui/icons-material` |
| New Message | `ChatBubbleOutline` | `@mui/icons-material` |
| Assign Person | `PersonAdd` | `@mui/icons-material` |
| Time/Schedule | `Schedule` | `@mui/icons-material` |

---

## Date & Time Formatting

### Relative Time (for lists)

```typescript
const formatRelativeTime = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
```

### Human-Friendly Appointment Time

```typescript
const formatAppointmentTime = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (isToday) return `Today at ${timeStr}`;
  if (isTomorrow) return `Tomorrow at ${timeStr}`;

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  return `${dateStr} at ${timeStr}`;
};
```

### Examples

| Input | Output |
|-------|--------|
| 2 minutes ago | `2m ago` |
| 3 hours ago | `3h ago` |
| Yesterday | `Yesterday` |
| 5 days ago | `5 days ago` |
| Older | `Dec 5` |
| Today 4pm | `Today at 4:00 PM` |
| Tomorrow 10am | `Tomorrow at 10:00 AM` |
| Next week | `Wed, Dec 18 at 2:30 PM` |

---

## States & Indicators

### Unread/Active Indicator (Dot)

```typescript
{isUnread && (
  <Box sx={{
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: accentColor,
  }} />
)}
```

### Badge/Chip (Count)

```typescript
<Box sx={{
  px: 1,
  py: 0.25,
  borderRadius: 1,
  bgcolor: alpha(colors.teal, 0.1),
  color: colors.teal,
}}>
  <Typography variant="caption" sx={{ fontWeight: 600 }}>
    {count}
  </Typography>
</Box>
```

### Status Chip

```typescript
<Chip
  size="small"
  label={label}
  sx={{
    bgcolor: alpha(accentColor, 0.1),
    color: accentColor,
    fontWeight: 600,
    fontSize: '0.75rem',
  }}
/>
```

---

## Animations

### Subtle Transitions (Always Use)

```typescript
transition: 'all 0.2s ease'
// or for specific properties:
transition: 'transform 0.2s ease, box-shadow 0.2s ease'
```

### Hover Lift Effect

```typescript
'&:hover': {
  transform: 'translateY(-2px)',
  boxShadow: `0 4px 16px ${alpha(colors.navy, 0.1)}`,
}
```

### Fade-Up Animation (Optional, for page load)

```typescript
import { keyframes } from '@mui/material';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Usage
sx={{ animation: `${fadeUp} 0.5s ease-out` }}
```

**Note:** Avoid complex animations like shimmer, pulse, or continuous motion. Keep animations subtle and purposeful.

---

## Form Inputs

### Text Input Styling

```typescript
const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    bgcolor: colors.surface,
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: colors.border, borderWidth: 1 },
    '&:hover fieldset': { borderColor: colors.slateLight },
    '&.Mui-focused fieldset': {
      borderColor: colors.teal,
      borderWidth: 2,
      boxShadow: `0 0 0 3px ${alpha(colors.teal, 0.1)}`,
    },
  },
  '& .MuiInputLabel-root': {
    color: colors.slate,
    fontWeight: 500,
    fontSize: '0.9rem',
    '&.Mui-focused': { color: colors.teal },
  },
};
```

### Toggle/Switch Styling

```typescript
<BooleanInput
  source={source}
  sx={{
    '& .MuiSwitch-switchBase.Mui-checked': { color: colors.teal },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: colors.teal
    },
  }}
/>
```

---

## Empty States

```typescript
<Box px={2} py={8} textAlign="center">
  <Box sx={{
    width: 64,
    height: 64,
    mx: 'auto',
    mb: 2,
    borderRadius: 2,
    bgcolor: alpha(colors.teal, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <SomeIcon sx={{ fontSize: 32, color: colors.teal }} />
  </Box>
  <Typography variant="h6" sx={{ color: colors.navy, fontWeight: 600, mb: 0.5 }}>
    All caught up!
  </Typography>
  <Typography variant="body2" color="text.secondary">
    New items will appear here.
  </Typography>
</Box>
```

---

## Do's and Don'ts

### Do

- Use the brand color palette consistently
- Keep text concise and scannable
- Use relative time for recent events
- Add subtle hover effects to interactive elements
- Use icons with tinted background boxes
- Keep the accent bar on cards even when read (just muted)

### Don't

- Use custom fonts outside of Roboto
- Add shimmer, pulse, or continuous animations
- Display raw ISO timestamps
- Show redundant information (e.g., type label + type chip + status chip all saying the same thing)
- Use rainbow gradients or multiple bright colors
- Over-engineer with too many visual layers

---

## Quick Reference

```typescript
// Import pattern
import { alpha, Box, Typography, Button, Card } from '@mui/material';

// Brand colors object
const BRAND = {
  teal: '#6AB4B6',
  navy: '#16273D',
  mint: '#CCE6DE',
  paper: '#F8F5F3',
  warning: '#F6A609',
  error: '#D84356',
};
```

---

## Mobile Color Tokens (Source of Truth)

> **Source**: `src/theme/tailwind.config.ts`
>
> These are the canonical colors for sara-mobile. Always use these tokens instead of hardcoded hex values.

### Sara Mobile Palette

| Token | Hex Value | Usage |
|-------|-----------|-------|
| `sara-background` | `#F8F5F3` | Main screen backgrounds (warm cream) |
| `sara-background-light` | `#FFFFFF` | Cards, modals, elevated surfaces |
| `sara-accent` | `#4CB6AC` | Primary actions, icons, links (soft teal) |
| `sara-accent-light` | `#E6F5F4` | Accent backgrounds, badges, highlights |
| `sara-accent-muted` | `rgba(76, 182, 172, 0.25)` | Subtle teal overlays |
| `sara-text-primary` | `#16273D` | Headings, important text (navy) |
| `sara-text-secondary` | `#4B5D6E` | Body text, descriptions |
| `sara-text-meta` | `#6C778A` | Timestamps, metadata, captions |
| `sara-border` | `#E6E2DD` | Dividers, card borders |
| `sara-border-strong` | `#D1CCC6` | Stronger borders, separators |
| `sara-chip` | `#F5F3F0` | Tag/chip backgrounds |

### Usage in Code

```tsx
import tailwind from '@/theme/tailwind';

// Tailwind classes (preferred)
<View style={tailwind.style('bg-sara-background')}>
  <Text style={tailwind.style('text-sara-text-primary')}>Hello</Text>
</View>

// For props requiring hex values (SVG stroke, StatusBar, etc.)
<SomeIcon color={tailwind.color('sara-accent')} />
<StatusBar backgroundColor={tailwind.color('sara-background')} />
```

### Color Mapping (CRM → Mobile)

| CRM Color | CRM Hex | Mobile Token | Mobile Hex |
|-----------|---------|--------------|------------|
| `teal` | `#6AB4B6` | `sara-accent` | `#4CB6AC` |
| `navy` | `#16273D` | `sara-text-primary` | `#16273D` |
| `paper` | `#F8F5F3` | `sara-background` | `#F8F5F3` |
| `slate` | `#64748B` | `sara-text-meta` | `#6C778A` |
| `border` | `#E2E8F0` | `sara-border` | `#E6E2DD` |

---

## Mobile-Specific Adaptations

> For React Native (sara-mobile), adapt CRM patterns using `twrnc` (Tailwind for RN).

### Font Mapping

| CRM | Mobile |
|-----|--------|
| Roboto 400 | `inter-normal-20` |
| Roboto 500 | `inter-medium-24` |
| Roboto 600 | `inter-semibold-20` |
| Roboto 700 | `inter-semibold-20` (use `fontWeight: 700` override) |

### Component Patterns

```tsx
// Mobile card equivalent
<View style={tailwind.style(
  'bg-sara-background-light rounded-2xl p-4',
  'border border-sara-border'
)}>
  {/* content */}
</View>

// Mobile accent bar (use View with absolute positioning)
<View style={[
  tailwind.style('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg'),
  { backgroundColor: tailwind.color('sara-accent') }
]} />

// Mobile button (primary)
<TouchableOpacity style={tailwind.style(
  'bg-sara-accent py-3 px-6 rounded-xl'
)}>
  <Text style={tailwind.style('text-white font-inter-semibold-20 text-center')}>
    Action
  </Text>
</TouchableOpacity>
```

### Date Formatting (Mobile)

Reuse the same logic from CRM's `formatRelativeTime` and `formatAppointmentTime` functions. Place in `src/utils/dateTimeUtils.ts`.
