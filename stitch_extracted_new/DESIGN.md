---
name: Kinetic Logic
colors:
  surface: '#141408'
  surface-dim: '#141408'
  surface-bright: '#3a3a2b'
  surface-container-lowest: '#0f0f04'
  surface-container-low: '#1c1c0f'
  surface-container: '#202013'
  surface-container-high: '#2b2b1d'
  surface-container-highest: '#363527'
  on-surface: '#e6e3ce'
  on-surface-variant: '#cac8aa'
  inverse-surface: '#e6e3ce'
  inverse-on-surface: '#323123'
  outline: '#939277'
  outline-variant: '#484831'
  surface-tint: '#cdcd00'
  primary: '#ffffff'
  on-primary: '#323200'
  primary-container: '#eaea00'
  on-primary-container: '#686800'
  inverse-primary: '#626200'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#ffffff'
  on-tertiary: '#093637'
  tertiary-container: '#c0eaeb'
  on-tertiary-container: '#436b6c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaea00'
  primary-fixed-dim: '#cdcd00'
  on-primary-fixed: '#1d1d00'
  on-primary-fixed-variant: '#494900'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#c0eaeb'
  tertiary-fixed-dim: '#a4cece'
  on-tertiary-fixed: '#002020'
  on-tertiary-fixed-variant: '#244d4e'
  background: '#141408'
  on-background: '#e6e3ce'
  surface-variant: '#363527'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  mono-data:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: -0.01em
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  container-max: 1440px
---

## Brand & Style

This design system embodies a high-performance, developer-centric aesthetic defined by extreme contrast and technical rigor. It is designed for environments where precision is paramount—IDE interfaces, financial terminals, and hardware monitoring dashboards.

The style is a fusion of **Minimalism** and **High-Contrast**, stripping away all non-essential ornamentation to focus on data density and clear hierarchy. It utilizes a "dark-room" philosophy, where the interface recedes into a deep black void, allowing the Electric Yellow accents to serve as high-intensity beacons for action and status. Visual interest is generated through strict grid alignment, razor-sharp 1px borders, and a mono-tonal color discipline that rejects the softness of typical modern UI.

## Colors

The palette is restricted to a tri-color system: **Absolute Black**, **Pure White**, and **Electric Yellow**.

*   **Primary Background (#000000):** Used for the base canvas to maximize contrast and minimize eye strain in low-light environments.
*   **Surface / Container (#111111):** Used for cards, sidebars, and nested sections to provide subtle depth without breaking the dark aesthetic.
*   **Accent / Primary (#FFFF00):** The sole "active" color. It is used for primary buttons, active toggles, progress bars, and critical highlights.
*   **Text Hierarchy:** High-contrast White (#FFFFFF) is used for all readable content. Electric Yellow is reserved for specialized "Alert" or "Selection" typography.
*   **State Management:** Since the palette is limited, states like "Success" or "Error" are communicated through iconography and the Electric Yellow accent rather than traditional green or red hues.

## Typography

The design system utilizes **Geist** exclusively. Geist’s geometric structure and technical proportions provide the necessary clarity for high-density layouts.

*   **Headlines:** Set with tight tracking and heavy weights. They should feel architectural and authoritative.
*   **Labels:** Small-scale labels should often use the `label-caps` token with increased letter spacing to provide a "metadata" feel characteristic of technical documentation.
*   **Data Display:** For numerical values or code snippets, use `mono-data` to ensure character alignment and rapid scanning.
*   **Color Application:** Body text is always White. Only use Electric Yellow for typography when it represents a selected state or a critical system notification.

## Layout & Spacing

This design system employs a **Fixed Grid** model based on a 4px baseline.

*   **The Grid:** Use a 12-column grid for desktop with a consistent 16px gutter. All containers must align strictly to the 1px border lines.
*   **Padding:** Internal padding for components (cards, inputs) should follow a 4px incremental scale (8px, 12px, 16px, 24px).
*   **Reflow:** On mobile devices, the 12-column grid collapses to a single column. Margins reduce from 24px to 16px to maximize horizontal real estate for technical data.
*   **Density:** Interfaces should lean toward high-density layouts. White space is used strategically as a separator, but primary content should feel compact and efficient.

## Elevation & Depth

Shadows and blurs are strictly prohibited. Depth is achieved through **Tonal Layering** and **1px Outlines**.

*   **Layering:** The base is #000000. Elevated surfaces (cards, modals) use #111111 or #1A1A1A.
*   **Outlines:** Every interactive or distinct element must be bounded by a 1px border. The default border color is #333333.
*   **Active Elevation:** When an element is active or hovered, the border color transitions from #333333 to #FFFF00 (Electric Yellow). This "lighting up" of the border provides the primary visual cue for focus and interactivity.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI element—buttons, cards, inputs, and tabs—must have 90-degree corners. This reinforces the technical, engineered nature of the design system. Rounded corners are seen as "soft" and are excluded to maintain the aggressive, high-precision aesthetic.

## Components

*   **Buttons:**
    *   *Primary:* Solid #FFFF00 background with #000000 text. No border.
    *   *Secondary:* #000000 background, 1px #333333 border, #FFFFFF text. On hover, the border changes to #FFFF00.
*   **Inputs:**
    *   Black background with a 1px #333333 border. Upon focus, the border becomes #FFFF00 and a small label in #FFFF00 appears above the field.
*   **Chips/Tags:**
    *   Small, rectangular boxes with 1px borders. If "active," the text and border are #FFFF00. If "inactive," the text is #FFFFFF and border is #333333.
*   **Cards:**
    *   #111111 background with a 1px #333333 border. Headers within cards should be separated by a 1px horizontal rule.
*   **Checkboxes/Radios:**
    *   Strictly square. Selected state is a solid #FFFF00 fill or a #FFFF00 inner square.
*   **Data Tables:**
    *   Row separators are 1px #333333. Hovering over a row changes the border-top and border-bottom of that row to #FFFF00, or provides a subtle #1A1A1A background highlight.