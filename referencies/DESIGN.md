---
name: Cognitive Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434654'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#6df5e1'
  on-secondary-container: '#006f64'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#71f8e4'
  secondary-fixed-dim: '#4fdbc8'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005048'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  unit-1: 4px
  unit-2: 8px
  unit-4: 16px
  unit-6: 24px
  unit-8: 32px
  gutter: 24px
  margin: 32px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for high-stakes enterprise environments where clarity and precision are paramount. The brand personality is authoritative yet unobtrusive, prioritizing functional elegance to achieve an "expensive," premium aesthetic. 

The visual style blends **Minimalism** with **Modern Corporate** sensibilities. It utilizes generous whitespace to reduce cognitive load—essential for complex task management—and maintains high-contrast ratios for accessibility and professional rigor. The UI should evoke a sense of calm reliability, suggesting that the AI is a sophisticated tool under the user's control rather than a distracting novelty. Precision is conveyed through razor-sharp alignment, subtle borders, and a restrained use of color.

## Colors

The palette is anchored by "Strategic Blue," a deep, trustworthy primary color used for high-priority actions and navigational anchors. "Neural Teal" serves as a semantic accent specifically reserved for AI-driven insights, agent-led tasks, and automated suggestions. 

Neutral tones are layered to create depth without relying on heavy lines. The background remains a crisp `#FFFFFF` to maximize contrast, while `#F8FAFC` and `#E2E8F0` are used for secondary surfaces and structural dividers. This subtle hierarchy of grays ensures the interface feels light and airy while maintaining clear logical boundaries.

## Typography

The design system utilizes **Inter** for its exceptional legibility and systematic character. The typographic hierarchy is strictly enforced to guide the user through dense task data. 

Headlines use semi-bold weights with slight negative letter-spacing to create a "tight," professional feel. Body text is optimized for long-form reading with a standard 1.5x line height. Labels utilize a slightly heavier weight and uppercase styling for categorical distinction, ensuring that metadata (like task status or AI confidence scores) is immediately scannable.

## Layout & Spacing

This design system is built on a **4px/8px incremental grid**. This mathematical approach ensures consistent rhythm across all components.

The layout employs a **Fixed Grid** model for large screens, centering content within a 1440px container to prevent excessive line lengths in task descriptions. On tablet and mobile, the layout transitions to a fluid model. 
- **Desktop (1440px+):** 12-column grid, 24px gutters, 32px margins.
- **Tablet (768px - 1439px):** 8-column grid, 16px gutters, 24px margins.
- **Mobile (Up to 767px):** 4-column grid, 16px gutters, 16px margins.

Generous padding (24px+) is applied to card containers to reinforce the minimalist, premium aesthetic.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layering** and **Ambient Shadows**. Instead of heavy borders, the design system uses depth to indicate interactivity and importance.

- **Level 0 (Background):** Pure white (#FFFFFF).
- **Level 1 (Cards/Sidebar):** Slight elevation using a very soft, diffused shadow: `0px 1px 3px rgba(0, 0, 0, 0.05), 0px 4px 6px rgba(0, 0, 0, 0.03)`.
- **Level 2 (Dropdowns/Modals):** Higher elevation with increased blur to suggest floating: `0px 10px 15px rgba(0, 0, 0, 0.08)`.

Subtle 1px borders in `#E2E8F0` are used on Level 1 elements to maintain crispness on low-resolution displays without compromising the "expensive" look.

## Shapes

The design system uses a **Soft (Level 1)** roundedness logic. This 4px base radius (0.25rem) provides a professional, "tooled" appearance that feels more precise than fully rounded corners.

- **Standard Components (Buttons, Inputs):** 4px (rounded).
- **Containers (Cards, Modals):** 8px (rounded-lg).
- **Interactive Accents:** 12px (rounded-xl) used sparingly for large promotional surfaces or empty-state illustrations.

This restrained approach to curvature maintains the "clean lines" required by the brand personality.

## Components

### Buttons
Primary buttons use "Strategic Blue" with white text. Ghost buttons use `#64748B` for text and borders. AI-specific actions (e.g., "Suggest Next Steps") use a "Neural Teal" outline or subtle gradient background to distinguish them from standard system actions.

### Cards
Cards are the primary container for tasks. They feature a white background, an 8px corner radius, and a 1px border in `#E2E8F0`. On hover, the shadow elevation increases slightly to indicate interactivity.

### Status Indicators
Human vs. AI distinction is critical. 
- **Human Tasks:** Accompanied by a standard circular avatar.
- **AI Tasks:** Accompanied by a "Neural Teal" hexagonal icon or a subtle glowing ring around the avatar.

### Input Fields
Inputs use a 4px radius and `#F8FAFC` background. When focused, the border transitions to "Strategic Blue" with a 2px soft outer glow.

### Chips
Small, low-contrast pills (4px radius) used for tagging. AI-generated tags are always styled in "Neural Teal" with 10% opacity backgrounds to remain distinct.

### Lists
Task lists utilize high horizontal padding (16px) and subtle dividers. Row hover states use `#F8FAFC` to provide immediate feedback without visual clutter.