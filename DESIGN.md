---
name: 'Buy-01 ("Buy It")'
description: A dark Material 3 marketplace where cyan signals action and product cards carry the surface.
colors:
  primary: "#00dddd"
  on-primary: "#003737"
  primary-container: "#004f4f"
  secondary: "#b0cccb"
  tertiary: "#ffb787"
  on-tertiary: "#502400"
  tertiary-container: "#723600"
  surface: "#101414"
  surface-container-low: "#191c1c"
  surface-container-high: "#272b2a"
  on-surface: "#e0e3e2"
  on-surface-variant: "#dae5e4"
  outline: "#889392"
  outline-variant: "#3f4948"
  error: "#ffb4ab"
  on-error: "#690005"
  accent-cyan: "oklch(60.9% 0.126 221.723)"
typography:
  display:
    fontFamily: "Roboto, sans-serif"
    fontSize: "3.562rem"
    fontWeight: 400
    lineHeight: "4rem"
    letterSpacing: "-0.016rem"
  headline:
    fontFamily: "Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
    lineHeight: "2.5rem"
    letterSpacing: "0"
  title:
    fontFamily: "Roboto, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: "1.75rem"
    letterSpacing: "0"
  body:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
    letterSpacing: "0.016rem"
  label:
    fontFamily: "Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
    letterSpacing: "0.006rem"
rounded:
  extra-small: "4px"
  small: "8px"
  medium: "12px"
  large: "16px"
  extra-large: "28px"
  full: "9999px"
spacing:
  base: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 24px"
    height: "40px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    size: "40px"
  field-outlined:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.extra-small}"
    padding: "0 16px"
    height: "56px"
  card-product:
    backgroundColor: "{colors.surface-container-low}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.medium}"
    padding: "16px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    padding: "0 8px"
  accent-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.headline}"
  toolbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.title}"
    padding: "0 16px"
    height: "64px"
---

# Design System: Buy-01

## Overview

**Creative North Star: "The Midnight Showcase"**

Buy-01 is a dark marketplace lit like a gallery after hours. The near-black teal-charcoal canvas recedes so product cards become the objects on display, and a single electric cyan signals where the visitor can act, focus, or has selected something. The atmosphere is precise and nocturnal: calm, legible, and retail-clear, never a neon gaming UI and never a generic admin panel. Warm ember orange is a rare note, not a second brand voice.

The world is built on Angular Material 3's token system, with Tailwind used only for layout and spacing. Surfaces are tonal rather than shadowed; actions are full pills while content containers are softly rounded slabs. Roboto does quiet utility work, and hierarchy comes from size and spacing rather than a second typeface. Because there is no logo or committed photography, the composition must earn its character from restraint, contrast, and the product content itself.

**Key Characteristics:**
- Dark-only teal-charcoal surface ramp with no pure-black backgrounds.
- One saturated cool accent: electric cyan, reserved for action and focus.
- Warm ember tertiary kept rare; errors use the separate coral error palette.
- Raised product cards on tonal surfaces, with light level-1 shadows only.
- Full-pill actions, 12px container corners, 4px field corners.
- Roboto-only hierarchy; 400 for reading, 500 for labels and actions.

## Colors

A cool nocturnal teal family interrupted by one electric cyan, with ember orange and soft coral as rare warm notes. All values are emitted by `mat.theme()`; the app forces the dark branch with `color-scheme: dark` on the body.

### Primary
- **Electric Cyan** (#00dddd): the single interactive accent. Filled action backgrounds, focus outlines, carets, selected states, and active navigation. It is deliberately bright against the dark surface, so it must stay scarce.
- **Deep Cyan Ink** (#003737): text and icons placed directly on cyan fills. Never put white on the primary.
- **Tidepool** (#004f4f): the tonal primary container for selected rows, quiet emphasis blocks, and secondary filled surfaces.

### Secondary
- **Sea-Glass Teal** (#b0cccb): a desaturated teal for secondary emphasis, chips, and supporting metadata. It supports cyan without competing with it.

### Tertiary
- **Ember** (#ffb787): a warm highlight for a single emphasized moment, never a general-purpose accent and never an error color.
- **Burnt Ember Ink** (#502400): text and icons on ember fills.
- **Ember Clay** (#723600): the tonal ember container for warm emphasis surfaces.

### Neutral
- **Gallery Black** (#101414): the app surface and default page background.
- **Card Charcoal** (#191c1c): raised card and low-container surface.
- **Dialog Charcoal** (#272b2a): high-container surface for menus, dialogs, and floating layers.
- **Bone White** (#e0e3e2): primary text and icon color on dark surfaces.
- **Mist** (#dae5e4): secondary text, field labels, and supporting icon color.
- **Harbor Outline** (#889392): field outlines, dividers that need to be seen, and focus-adjacent borders.
- **Faint Harbor** (#3f4948): low-emphasis dividers and outlined-card borders.
- **Soft Coral** (#ffb4ab): error text, invalid outlines, and destructive emphasis.
- **Deep Coral Ink** (#690005): text on error containers.
- **Legacy Signal Teal** (`oklch(60.9% 0.126 221.723)`, Tailwind `cyan-600`): currently used by the "All Products" link and header hover. It is a second cyan source of truth; new work must use the primary token instead.

### Named Rules
**The One Signal Rule.** Cyan appears only where the visitor can act, focus, or is selected. Never as decoration, never as a gradient, and preferably on less than 10% of a screen. Its rarity is the point.

**The No Pure Black Rule.** The darkest surface is Gallery Black; never use `#000` as a page or card background. Pure black is reserved for shadow and scrim.

**The Ember Reserve Rule.** Orange is tertiary emphasis, not a warning system. Errors and destructive actions use Soft Coral and Deep Coral Ink.

## Typography

**Display Font:** Roboto (with sans-serif fallback)
**Body Font:** Roboto (with sans-serif fallback)
**Label Font:** Roboto Medium 500

**Character:** A single neutral grotesque doing quiet Material work. It should feel precise and unshowy, with hierarchy coming from size, weight, and spacing rather than a second family.

### Hierarchy
- **Display** (400, 3.562rem / 4rem, -0.016rem): reserved for marketing-scale statements and large numbers. Not used on current app screens.
- **Headline** (400, 2rem / 2.5rem, 0): page and section titles such as "Tous les produits".
- **Title** (400, 1.375rem / 1.75rem, 0): product card titles and the toolbar wordmark.
- **Body** (400, 0.875rem / 1.25rem, 0.016rem): default UI text, card descriptions, and supporting copy. Body-large at 1rem / 1.5rem is used inside form fields.
- **Label** (500, 0.875rem / 1.25rem, 0.006rem): buttons, navigation actions, and compact labels.

### Named Rules
**The One Family Rule.** Roboto only. Use 400 for body and titles, 500 for labels and actions, and 300 only for oversized display moments. Never import a second family to add personality.

**The Quiet Hierarchy Rule.** Step up in size or weight, not both at once. A card title is larger but not bolder; a button label is bolder but not larger.

## Layout

The spatial rhythm is a 4px base. Real layouts use 8px, 12px, 16px, 20px, 24px, and 32px steps. The app shell is a full-width 64px toolbar followed by page content padded at 24px; form screens use 20–25px outer padding and a single-column stack with 16px between fields.

The public Home screen currently renders a fixed four-column `mat-grid-list`; My Products renders a fixed two-column one. The validated target is a responsive product grid: four columns on desktop, two on tablet, one on mobile, with 16–24px gutters. Header navigation links sit 12px apart, with a flexible spacer pushing account actions to the right; below 600px the seller navigation should collapse behind a menu button.

### Named Rules
**The Four-Pixel Rhythm Rule.** Every margin, padding, and gap lands on a 4px step. If a value is not on the rhythm, it is not part of the system.

## Elevation & Depth

The system is tonal-first and shadow-light. Material 3 surface-container steps carry the hierarchy: Gallery Black for the page, Card Charcoal for product cards, Dialog Charcoal for floating layers. Surfaces are flat at rest. Shadows appear only on raised cards, menus, and dialogs, and they are short and dark rather than diffuse glows. Nothing lifts or translates on hover; state is communicated through the Material state layer and color.

### Shadow Vocabulary
- **Level 0** (`box-shadow: none`): toolbar, fields, flat surfaces, outlined cards.
- **Level 1** (`box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12)`): raised product cards.
- **Level 3** (`box-shadow: 0 3px 3px -2px rgba(0, 0, 0, 0.2), 0 3px 4px 0 rgba(0, 0, 0, 0.14), 0 1px 8px 0 rgba(0, 0, 0, 0.12)`): menus, dialogs, and floating panels.

### Named Rules
**The Tonal-First Rule.** Surfaces separate by surface-container steps, not by shadow. If a shadow is doing the separating, the tonal step is wrong.

## Shapes

The form language pairs pills with soft slabs. Every action is fully rounded (9999px); every content container has a 12px corner. Outlined fields use a 4px corner, the toolbar is square, and cards never have angled or clipped corners. Borders are thin and functional: 1px on outlined fields and outlined cards, thickening to 2px in the primary color only on focus.

### Named Rules
**The Pill-and-Slab Rule.** Actions are pills; content containers are 12px slabs. Nothing in between, and never a square button.

## Components

### Buttons
- **Shape:** full pill (9999px), 40px tall, 24px horizontal padding.
- **Primary:** Electric Cyan fill with Deep Cyan Ink label; label-large 14px / 20px at 500.
- **Hover / Focus:** keep the fill and add an 8% Deep Cyan Ink state layer; focus-visible adds a visible 2px outline. Pressed deepens to 12%. Disabled uses 12% on-surface fill with 38% on-surface text.
- **Icon buttons:** 40px circles with a 24px icon in Mist; transparent at rest, with an 8% on-surface hover layer. Icon-only controls require a French `aria-label`.

### Cards
- **Corner Style:** 12px radius.
- **Background:** Card Charcoal for raised cards; Dialog Charcoal for filled cards; Gallery Black with a Faint Harbor border for outlined cards.
- **Shadow Strategy:** raised cards use level 1; filled and outlined cards use level 0. See Elevation & Depth.
- **Border:** none on raised cards; 1px Faint Harbor on outlined cards.
- **Internal Padding:** 16px horizontal; the header adds 16px top, content adds 16px bottom.
- **Imagery:** product images are 112px squares with `object-fit: cover` and no radius unless the image touches a card edge, where it inherits the card radius.

### Inputs / Fields
- **Style:** the canonical field is outlined: 56px tall, 4px radius, 1px Harbor Outline border, transparent surface, Bone White input text, and a Mist floating label at body-large 16px / 24px.
- **Focus:** the outline shifts to Electric Cyan and thickens to 2px; the caret matches the primary.
- **Error / Disabled:** invalid fields use Soft Coral for outline, label, and error text. Disabled fields drop to 38% on-surface text. The login screen currently inherits Material's filled default; new work should use the outlined form so a single field style holds across the product.

### Navigation
- **Toolbar:** 64px tall, Gallery Black background, Bone White text, 16px horizontal padding, no shadow. The "Buy It" wordmark uses title-large 22px / 28px at 400.
- **Links:** body-large 16px / 24px in Bone White at rest, Electric Cyan on hover, with a 300ms color transition and no underline. Active or current links use Electric Cyan. Links must never fall back to the browser's default blue; the current header anchors still do, so bind their resting color to Bone White when touched.
- **Mobile:** below 600px, seller navigation collapses into a menu opened from a 40px icon button.

### Accent Link
The public Home screen uses a section-level link set at headline size (24px / 32px) in Electric Cyan with no underline. It is a navigation signal, not a decorative heading; hover adds an underline with at least 4px offset and focus-visible gets a 2px primary outline.

## Do's and Don'ts

### Do:
- **Do** use Material system variables (`var(--mat-sys-*)`) for every color, radius, and type decision.
- **Do** keep Electric Cyan under roughly 10% of a screen; reserve it for actions, focus, and selected state.
- **Do** use raised cards with Card Charcoal, a 12px radius, and the level-1 shadow for product tiles.
- **Do** use outlined fields consistently: 56px tall, 4px radius, 1px Harbor Outline, 2px Electric Cyan on focus.
- **Do** use full-pill buttons at 40px with 24px horizontal padding for filled actions.
- **Do** separate hierarchy with surface-container steps before reaching for a shadow.
- **Do** keep every spacing value on a 4px step.
- **Do** give every icon-only control a French `aria-label` and a visible focus state.

### Don't:
- **Don't** add raw Tailwind palette colors such as `cyan-600` to new UI; they split the accent source of truth.
- **Don't** use Ember orange for errors, warnings, or destructive actions; use the error palette.
- **Don't** use pure black or pure white as page, card, or text colors; use the neutral ramp.
- **Don't** mix filled and outlined fields on the same screen.
- **Don't** lift, scale, or animate cards on hover; use tonal or state-layer changes instead.
- **Don't** put white text directly on Electric Cyan; use Deep Cyan Ink.
- **Don't** square off buttons or add heavy, diffuse shadows.
- **Don't** introduce a light theme or invert the surface ramp; the product commits to dark.
