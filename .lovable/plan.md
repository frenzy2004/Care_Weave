

# CareWeave UI Overhaul — From Generic to Distinctive

The current UI is functional but visually plain — default shadcn cards, no depth, no motion, no personality. This plan transforms it into something that looks like a polished health-tech product, not a template.

## Design Direction: "Glass Medical Dashboard"

Subtle glassmorphism, gradient accents, smooth animations, and a refined color system that feels like a premium health app (think Linear meets Apple Health).

## Changes

### 1. Global Styles & CSS Enhancements (`index.css`)
- Add subtle dot-grid background pattern on the main area
- Glassmorphic card style: `backdrop-blur-xl bg-white/70 border-white/20` (light) / `bg-white/5 border-white/10` (dark)
- Gradient accent utilities: primary-to-purple gradient for key CTAs
- Smooth page entrance animation (fade-up on mount)
- Custom scrollbar styling
- Glowing ring effect on focused inputs

### 2. Tailwind Config — New Animations
- `fade-in-up` (staggerable per card)
- `pulse-glow` for the flare button
- `slide-in-left` for sidebar
- `shimmer` for loading states

### 3. Sidebar Redesign (`AppLayout.tsx`)
- Gradient header area with a subtle blue-to-indigo gradient behind the logo
- Active nav item: pill shape with gradient background + subtle glow shadow
- Hover: smooth background transition with slight scale
- Doctor Mode toggle gets a styled pill with icon transition
- Bottom section: subtle user avatar placeholder with condition tags

### 4. Dashboard (`Dashboard.tsx`)
- Hero metric card: full-width gradient card (blue-to-teal for improvement, red-to-amber for worsening) with large typography and subtle pattern overlay
- Stats cards: each with a unique accent gradient top-border and icon with colored background circle
- 7-day sparkline: gradient-filled bars instead of solid, with smooth hover tooltips
- Quick action buttons: primary gets gradient, flare button gets animated pulse-glow ring
- Recent timeline: connected dots with a gradient line, hover-expand effect on each item
- Stagger animation: cards appear one-by-one with 50ms delay

### 5. Health Timeline (`HealthTimeline.tsx`)
- Timeline line: gradient from top to bottom (primary → muted)
- Event nodes: larger with ring animation on hover, icon background matches event type gradient
- Cards: glassmorphic with left color accent bar matching event type
- Date badges: pill-shaped with subtle gradient backgrounds
- Smooth mount animation per item (staggered fade-in-up)

### 6. Symptom Logger (`SymptomLogger.tsx`)
- Pain scale: circular buttons instead of rectangles, selected state gets gradient ring + scale animation
- Emoji faces: larger with bounce animation on select
- Flare toggle card: animated gradient border (red pulse) when active
- Symptom checkboxes: custom styled with colored check indicators per symptom type
- Submit button: full-width gradient with hover glow

### 7. Pattern Dashboard (`PatternDashboard.tsx`)
- Insight cards: gradient left border by category (teal=improvement, amber=warning, red=alert)
- Confidence badges: colored dot indicator before text
- Charts: custom gradient fills under line charts, rounded bar charts
- Section headers with subtle gradient text for titles

### 8. Health Story (`HealthStory.tsx`)
- Story card: large with generous padding, quote-style opening with oversized quotation mark
- Paragraphs: alternating subtle left-border colors
- Disclaimer: styled in a muted callout box with info icon

### 9. Medications, Providers, Visits
- Cards: hover lift effect (`hover:-translate-y-0.5 hover:shadow-md transition-all`)
- Drug class badges: gradient pill backgrounds instead of flat
- Active meds: subtle green left-border, past meds: dashed border
- Form cards: slide-down animation on open

### 10. Export Page
- Report preview: paper shadow effect with subtle rotation hover
- Download button: gradient with download icon animation on hover

## Technical Approach
- All visual changes via Tailwind utilities + `index.css` custom classes — no new dependencies
- Add keyframe animations to `tailwind.config.ts`
- Glassmorphic effects via `backdrop-blur` + opacity backgrounds
- Stagger animations via CSS `animation-delay` with utility classes
- Keep all existing functionality untouched — purely visual layer

## Files Modified
1. `src/index.css` — new utility classes, background patterns, glassmorphic styles
2. `tailwind.config.ts` — new keyframes and animation utilities
3. `src/components/layout/AppLayout.tsx` — sidebar redesign
4. `src/pages/Dashboard.tsx` — hero gradient, animated cards, sparkline upgrade
5. `src/pages/HealthTimeline.tsx` — gradient timeline, glassmorphic cards
6. `src/pages/SymptomLogger.tsx` — circular pain scale, animated flare toggle
7. `src/pages/PatternDashboard.tsx` — gradient insight cards, chart styling
8. `src/pages/HealthStory.tsx` — quote-style narrative, callout disclaimer
9. `src/pages/MedicationTracker.tsx` — hover lift, gradient badges
10. `src/pages/ProviderDirectory.tsx` — hover lift, styled cards
11. `src/pages/VisitsLog.tsx` — hover lift, styled cards
12. `src/pages/ExportReport.tsx` — paper shadow effect

