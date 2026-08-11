---
name: Technical Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#705d00'
  on-secondary: '#ffffff'
  secondary-container: '#fcd400'
  on-secondary-container: '#6e5c00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  border-subtle: '#E5E5E5'
  text-muted: '#666666'
  status-submitted: '#666666'
  status-review: '#FFD700'
  status-verified: '#3B82F6'
  status-approved: '#10B981'
  status-rejected: '#EF4444'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  technical-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  sidebar-width: 240px
  max-content-width: 1200px
---

## Brand & Style

This design system embodies a **Minimalist Developer-Product** aesthetic, prioritizing clarity, high information density, and functional beauty. The mood is calm, professional, and technical, drawing inspiration from industry leaders like Vercel, Linear, and GitHub. It avoids decorative fluff in favor of precise alignment, generous whitespace, and a high-contrast utility.

The system targets developers and administrators who value efficiency over ornamentation. The emotional response should be one of competence and speed—a "power tool" for learning and challenge management. The visual language uses thin borders, a strict monochromatic base, and a single high-energy accent color to guide the eye toward critical actions and status changes.

## Colors

The palette is rooted in a "Near-White" workspace environment. 
- **Backgrounds:** Use `#FAFAFA` for the main application canvas to provide a soft contrast against `#FFFFFF` cards and surfaces.
- **Typography:** The primary ink is `#1A1A1A` (Dark Charcoal), ensuring deep contrast without the harshness of pure black.
- **Accent:** Electric Yellow/Warm Amber (`#FFD700`) is the singular chromatic signature. It is reserved exclusively for active states, primary call-to-actions, and progress indicators.
- **Borders:** A consistent 1px subtle gray (`#E5E5E5`) is used to define structure without adding visual weight.
- **Status Badges:** Use a restrained semantic palette for status communication, keeping saturation moderate to prevent them from overpowering the content.

## Typography

The typography system uses a tri-font approach to reinforce the technical narrative:
- **Geist** for headlines provides a sharp, geometric precision.
- **Inter** for body text ensures maximum legibility and a neutral, professional tone for descriptions and content.
- **JetBrains Mono** is utilized for all technical metadata, IDs, repository links, and small uppercase labels.

Hierarchy is established through weight and spacing rather than dramatic size shifts. Use `label-caps` for section headers in the sidebar or table headers to evoke a terminal-like utility.

## Layout & Spacing

This design system employs a **fixed-fluid hybrid grid** based on an 8px square-grid rhythm.

- **Desktop:** A fixed left sidebar (240px) is paired with a fluid main content area that caps at 1200px. This ensures readability on ultra-wide monitors while maintaining a "centered" focus.
- **Sidebar:** Groups navigation into logical units with 32px vertical spacing between sections.
- **Top Bar:** A clean breadcrumb-led top bar with a 1px bottom border handles global context and search.
- **Responsive:** On mobile, the sidebar transitions to a hidden drawer, and margins reduce from 24px to 16px. Table views should transition to "card-stack" views to preserve metadata visibility.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layers** and **Subtle Outlines** rather than traditional shadows.

- **Surface 0 (Background):** `#FAFAFA` - The lowest level.
- **Surface 1 (Cards/Sidebar):** `#FFFFFF` - Elevated visually via 1px `#E5E5E5` borders.
- **Interaction Depth:** On hover, cards may feature an extremely subtle, diffused shadow (`0 4px 12px rgba(0,0,0,0.03)`) or a slight border color shift to `#D1D1D1`. 
- **Active State:** Navigation items use a subtle `#F5F5F5` background fill with a 2px vertical `#FFD700` bar on the leading edge to indicate the current page.

## Shapes

The shape language is "Rounded-Geometric." Standard components use an 8px radius (`rounded`) for a balanced, modern feel that isn't overly "soft." Larger containers like main dashboard cards may use 12px (`rounded-lg`) to differentiate structural areas. Interactive elements like buttons and input fields stay strictly at 8px to maintain a compact, technical appearance.

## Components

### Buttons
- **Primary:** Dark Charcoal (`#1A1A1A`) background, white text. Hover state shifts the background to a deep gray with a focus ring in Electric Yellow.
- **Secondary:** White background, 1px gray border. Text is Dark Charcoal.
- **Accent:** Electric Yellow background, Dark Charcoal text. Used for high-priority platform actions (e.g., "Submit Challenge").

### Tables
Tables are the heart of the technical dashboard. Rows are 48px high with thin horizontal lines. Use JetBrains Mono for ID columns. Column headers are `label-caps` in `#666666`.

### Inputs & Forms
Inputs use a white background and a 1px border. Focus states are indicated by a 1px border color change to the primary accent color or a sharp 2px black ring. Labels always sit above the input field in a medium-weight sans-serif.

### Status Badges
Understated, small badges with a low-opacity background tint and a high-contrast text color of the same hue. For example, "Verified" uses a light blue background with dark blue text.

### Statistics Blocks
Large, high-contrast numbers (`headline-lg`) paired with a `label-caps` descriptor. These should be housed in simple white cards to provide a snapshot of user performance.