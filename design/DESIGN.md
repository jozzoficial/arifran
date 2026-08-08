---
name: AriFran Glamour
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4f4448'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#817478'
  outline-variant: '#d2c3c7'
  surface-tint: '#795465'
  primary: '#795465'
  on-primary: '#ffffff'
  primary-container: '#f8c8dc'
  on-primary-container: '#765162'
  inverse-primary: '#e9bacd'
  secondary: '#9026c3'
  on-secondary: '#ffffff'
  secondary-container: '#cb66fe'
  on-secondary-container: '#4a006b'
  tertiary: '#735c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#f9d156'
  on-tertiary-container: '#705900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e7'
  primary-fixed-dim: '#e9bacd'
  on-primary-fixed: '#2e1221'
  on-primary-fixed-variant: '#5f3c4d'
  secondary-fixed: '#f6d9ff'
  secondary-fixed-dim: '#e9b3ff'
  on-secondary-fixed: '#310048'
  on-secondary-fixed-variant: '#7200a2'
  tertiary-fixed: '#ffe088'
  tertiary-fixed-dim: '#e9c349'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#574500'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style
The design system is engineered for the luxury cosmetics market, blending high-end editorial aesthetics with modern e-commerce functionality. The brand personality is sophisticated, aspirational, and meticulously curated. 

The visual style follows a **Minimalist / High-Contrast** hybrid approach. It leverages generous whitespace to let product photography breathe, while utilizing sharp accents of Deep Orchid and Soft Gold to guide the user's eye to calls-to-action and premium details. The emotional response should be one of "effortless elegance"—a digital experience that feels as premium as the products themselves.

## Colors
The palette is centered on a high-fashion contrast between soft femininity and bold authority. 
- **Primary (Soft Pastel Pink):** Used for large surface areas, subtle hover states, and category backgrounds. It provides a soft, inviting foundation.
- **Secondary (Deep Orchid):** Reserved for primary interactive elements, brand moments, and critical messaging. This adds a layer of modern luxury and digital vibrance.
- **Accent (Soft Gold):** Used sparingly for borders, iconography accents, and "Limited Edition" badges to evoke prestige.
- **Background:** Strictly clean white (#FFFFFF) to maintain a sterile, high-end laboratory/boutique feel.

## Typography
The typography strategy employs a classic serif-on-sans pairing. **Playfair Display** provides an editorial, authoritative voice for headlines, echoing luxury fashion mastheads. **Montserrat** offers a clean, geometric counterpoint for body copy and UI elements, ensuring legibility and a modern feel. 

For mobile screens, display sizes scale down aggressively to prevent text wrapping issues while maintaining the high-contrast ratio between headings and body. Label styles utilize uppercase styling and increased letter spacing to create a "designer tag" aesthetic for navigation and product categories.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to ensure product imagery remains perfectly framed within the 1280px container. 

- **Grid:** A 12-column system with 24px gutters.
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Whitespace:** Large vertical gaps (120px+) are used between homepage sections to emphasize exclusivity and reduce cognitive load.
- **Mobile:** Transition to a 4-column grid with reduced margins (20px). Full-bleed imagery is encouraged for hero sections on mobile to maximize impact.

## Elevation & Depth
Depth is conveyed through **Ambient Shadows** and tonal layering rather than heavy borders. 
- **Cards:** Use a very soft, diffused shadow (0px 10px 30px rgba(0,0,0,0.05)) to make products appear as if they are floating slightly above a white surface.
- **Interactive Surfaces:** Deep Orchid buttons utilize a subtle glow effect (shadow tinted with a low-opacity violet) when hovered.
- **Borders:** When borders are necessary (e.g., input fields), use the Soft Gold at 30% opacity to create a "jewelry-like" frame.

## Shapes
The shape language is "Softly Geometric." A consistent 12px to 16px corner radius (defined as level 2) is applied to all primary containers, buttons, and product cards. This softens the high-contrast colors and aligns with the organic nature of beauty products.

- **Primary Buttons:** 12px radius.
- **Product Cards:** 16px radius for a friendlier, tactile look.
- **Input Fields:** 8px radius to maintain a sense of precision.

## Components
- **Buttons:** Primary buttons use a linear gradient (Deep Orchid to a slightly lighter Violet) with white Montserrat Bold text. Secondary buttons are outlined in Soft Gold with a Soft Pink background on hover.
- **Product Cards:** Minimalist design with no visible borders. The image occupies 80% of the card height. Price and Title are center-aligned using Playfair Display.
- **Chips/Badges:** Small, pill-shaped tags for "Vegan," "Cruelty-Free," or "New." These use Soft Gold backgrounds with dark text.
- **Input Fields:** Clean, bottom-border-only design or subtle 8px rounded boxes. Focused states are highlighted with a Soft Gold outline.
- **Icons:** Use thin (1pt) line icons. Icon color should be Deep Orchid for interactive elements and Soft Gold for decorative brand markers.
- **Lists:** Clean spacing with Soft Gold horizontal dividers (0.5px thickness) to maintain an airy feel.