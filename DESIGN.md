---
name: QuickWheel
description: A luxe, playful prize-wheel spinner PWA — the wheel is the lit hero on a dark stage.
colors:
  primary-violet: "#7C3AED"
  brand-grad-purple: "#B44AFF"
  brand-grad-pink: "#F43F8A"
  brand-grad-blue: "#0099FF"
  stage-navy: "#0F172A"
  studio-black: "#171717"
  hairline: "#292929"
  ink: "#FAFAFA"
  muted-ink: "#A6A6A6"
  danger: "#D31212"
  light-bg: "#F9F9FC"
  light-ink: "#171717"
  light-muted-ink: "#595959"
  segment-violet: "#9B6AF1"
  segment-teal: "#5FD0C0"
  segment-steel: "#477E99"
  segment-gold: "#E6C265"
  segment-peach: "#F6B98C"
typography:
  display:
    fontFamily: "Inter, 'Open Sans', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, 'Open Sans', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  section:
    fontFamily: "Inter, 'Open Sans', sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, 'Open Sans', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, 'Open Sans', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "3px"
  md: "6px"
  lg: "9px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-violet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input-field:
    backgroundColor: "{colors.stage-navy}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "36px"
  card-surface:
    backgroundColor: "{colors.studio-black}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# Design System: QuickWheel

## 1. Overview

**Creative North Star: "The Spotlight Stage"**

QuickWheel is a dark studio with one thing lit: the wheel. Everything else — nav, panels, buttons — recedes into the low light so the spin can carry the stage. The deep navy-charcoal background (`#0F172A`) is the unlit theater; the violet-to-pink-to-blue brand gradient is the stage lighting, used sparingly and only where it earns a moment (the title, the primary call to action, the win). The spin itself is the show: a long, decelerating turn that lands on a winner with a small hit of drama. This is premium broadcast energy — confident, polished, with a deliberate wink of fun.

The system is restrained by construction. Surfaces are flat at rest; shadows are globally zeroed; depth comes from interaction (a subtle brightness lift on hover) and from two signature glows — the violet pulse under the spin button and the floating winner modal. Color is rationed: the bright brand gradient appears on a tiny fraction of any screen, which is exactly why it reads as premium rather than garish. Typography is compact and quiet, because the wheel — not the type — is the hero.

This system explicitly rejects four things, drawn straight from the product's anti-references: the **cheap, ad-stuffed "spin to win" casino aesthetic**; the **sterile generic SaaS dashboard** with cards everywhere and no personality; **childish clip-art** (playful is not juvenile); and **flat, lifeless statics** — a form that happens to spin. Depth and motion are features here, not decoration.

**Key Characteristics:**
- Dark-first stage; the wheel is the only fully-lit element.
- Brand gradient as stage lighting — rare, deliberate, never wallpaper.
- Flat-by-default surfaces; depth earned through interaction and signature glows.
- Compact, confident typography that yields the spotlight to the wheel.
- Tactile components that respond to touch via a brightness-lift elevate system.

## 2. Colors

A deep, theatrical neutral base lit by a single violet primary and a three-stop brand gradient; the only riot of color lives inside the wheel itself.

### Primary
- **Spotlight Violet** (`#7C3AED`, `hsl(262 83% 58%)`): The primary action color and brand anchor. Fills the default/primary button, the focus ring, and selected/active states. The same violet drives the spin button's `pulse-glow` aura. Identical value in light and dark themes so the brand stays constant.

### Secondary
- **Brand Gradient** (`linear-gradient(135deg, #B44AFF, #F43F8A, #0099FF)`): The stage lighting. Purple → pink → blue, applied as `.text-gradient-brand` on page titles and `.bg-gradient-brand` on hero/primary surfaces. This is the signature flourish — reserved for titles, the marquee CTA, and celebration moments. It is the established brand identity; treat the gradient-on-titles as a feature, not a violation.

### Tertiary — Wheel Segment Palette
The curated, harmonious set the wheel cycles through (the `--chart-*` ramp). Vibrant but never neon.
- **Segment Violet** (`#9B6AF1`, `hsl(262 83% 68%)`)
- **Segment Teal** (`#5FD0C0`, `hsl(173 58% 59%)`)
- **Segment Steel** (`#477E99`, `hsl(197 37% 44%)`)
- **Segment Gold** (`#E6C265`, `hsl(43 74% 69%)`)
- **Segment Peach** (`#F6B98C`, `hsl(27 87% 77%)`)

### Neutral
- **Stage Navy** (`#0F172A`, `hsl(222 47% 11%)`): The dark-theme body background — the unlit theater.
- **Studio Black** (`#171717`, `hsl(0 0% 9%)`): Card and panel surface in dark theme. Slightly warmer/flatter than the navy body, so panels read as set pieces against the stage.
- **Hairline** (`#292929`, `hsl(0 0% 16%)`): Standard borders and dividers (`border-border`). Always prefer this token over `border-white/10`.
- **Ink** (`#FAFAFA`, `hsl(0 0% 98%)`): Primary text on dark surfaces.
- **Muted Ink** (`#A6A6A6`, `hsl(0 0% 65%)`): Secondary/tertiary text, metadata, hints. In dark theme only — do not reuse the light-theme muted value here.
- **Light Stage** (`#F9F9FC`, `hsl(240 20% 98%)`): Light-theme body background.
- **Light Muted Ink** (`#595959`, `hsl(0 0% 35%)`): Secondary text in light theme.

### Named Rules
**The Stage Lighting Rule.** The brand gradient is lighting, not paint. It appears on ≤10% of any screen — a title, one CTA, a celebration. The moment it tiles a background or repeats per-card, it stops reading as premium and starts reading as the casino tool we reject.

**The One Violet Rule.** Exactly one accent hue (Spotlight Violet) carries interactivity across the whole product. Status colors (emerald/amber/blue/red) are functional signals only, never decoration.

## 3. Typography

**Display / Body Font:** Inter (with Open Sans, then system sans fallback)
**Mono Font:** Menlo (rare; numeric/code contexts only)

**Character:** One family, many weights — Inter from 400 to 700. There is no serif/sans pairing because the wheel, not the type, is the focal point; a single confident sans keeps the chrome quiet and the hierarchy honest. Contrast is carried by weight and the gradient title treatment, not by mixing typefaces.

### Hierarchy
- **Display** (700, 1.25rem / 20px, tracking -0.02em): Page titles (h1). Rendered with the brand gradient via `.text-gradient-brand`. Intentionally compact — this is a product app, not a landing page; the title orients without shouting.
- **Title** (600, 1.125rem / 18px): Card titles, dialog headers (`CardTitle`).
- **Section** (500, 1rem / 16px): Sub-section headers within panels.
- **Body** (400, 1rem / 16px, line-height 1.5): Default content. Cap measure at 65–75ch in any prose block (terms, privacy, changelog).
- **Label** (400, 0.875rem / 14px, Muted Ink): Metadata, form labels, hints. Tiny text drops to 0.75rem / 12px for timestamps only.

### Named Rules
**The Gradient-Title Rule.** The brand gradient on text is reserved for the single h1 page title per screen. Never apply `background-clip: text` to body copy, card titles, or labels — it is the title's signature alone, and elsewhere it only hurts legibility.

**The Quiet Chrome Rule.** No display type exceeds 20px in the app shell. If a heading wants to be bigger, the wheel should be bigger instead.

## 4. Elevation

This system is **flat by default**. Every `--shadow-*` token is intentionally zeroed (transparent), so cards and panels carry **no drop shadow** — separation comes from the Studio-Black surface sitting on the Stage-Navy body, plus a 1px Hairline border. Depth is a response to *state and significance*, not a default coat applied to every box.

Two mechanisms supply depth:
1. **The elevate overlay system** — `hover-elevate` / `active-elevate-2` paint a translucent brightness layer (`--elevate-1` ≈ 4% white, `--elevate-2` ≈ 9% white in dark theme) over an element on hover/press. This is how buttons and interactive rows feel tactile without shadows.
2. **Signature glows** — reserved for exactly three elements: the **wheel** (drop shadow for 3D presence), the **spin button** (violet `pulse-glow` aura, `0 4px 20px rgba(139,92,246,0.4)`), and the **winner modal** (floating dialog emphasis).

### Shadow Vocabulary
- **Spin glow** (`box-shadow: 0 4px 20px rgba(139,92,246,0.4), 0 8px 30px rgba(99,102,241,0.2)`; animated to 0.55/0.35 at the pulse peak): The spin button only.
- **Wheel shadow** (drop shadow on the wheel SVG): 3D lift for the hero.
- **Modal float** (dialog elevation): The winner reveal and other modal dialogs.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. A shadow on a card is a bug. Depth appears only as a response to hover (elevate overlay), to significance (the three signature glows), or to modality (floating dialogs). If it looks like a 2014 Material card, the shadow shouldn't be there at all.

## 5. Components

### Buttons
Confident and tactile — pressable surfaces that lift on hover via the elevate overlay, not via shadow.
- **Shape:** Gently rounded (`rounded-md`, 6px). Heights are *minimums* (`min-h-9` ≈ 36px) so a button grows to fit long content instead of clipping.
- **Primary:** Spotlight Violet fill, Ink text, violet-tinted border (`border-primary-border`). Padding `8px 16px` default; `lg` widens to `px-8` (32px). The marquee spin button additionally carries the `pulse-glow` aura.
- **Outline:** Transparent fill, `var(--button-outline)` 1px border, inherits text color; `shadow-xs` at rest collapsing to `shadow-none` on press. Shows whatever surface it sits on.
- **Secondary:** Neutral `bg-secondary` fill with matching border — for quieter actions beside a primary.
- **Ghost:** Transparent with a transparent 1px border (reserves layout so a later border doesn't shift size). Toolbar and icon actions.
- **Hover / Focus:** `hover-elevate` brightness lift; `active-elevate-2` deeper press. Focus shows a 1px `ring-ring` (Spotlight Violet) outline. Icon-only buttons use `size="icon"` (h-9 w-9) — never custom dimensions.

### Cards / Containers
- **Corner Style:** `rounded-lg` (9px).
- **Background:** Studio Black at 80% with `backdrop-blur-sm` (`bg-card/80 backdrop-blur-sm`) — a whisper of glass, never a frosted slab. Modals go heavier: `bg-card/95 backdrop-blur-xl`.
- **Shadow Strategy:** None. See Elevation — separation via surface contrast + Hairline border.
- **Border:** 1px `border-border` (Hairline), or `border-border/50` for very subtle separators.
- **Internal Padding:** 16px (`p-4`); page margins `p-4 sm:p-8`.
- **Never nest cards.** A panel inside a panel is a hierarchy failure — use spacing or a Hairline divider instead.

### Inputs / Fields
- **Style:** 1px `border-input` stroke, semi-transparent `bg-background/50` fill, `rounded-md` (6px), 36px tall to align with buttons.
- **Focus:** 2px `ring-ring` (Spotlight Violet) glow with a 2px offset — a clear, branded focus state.
- **Placeholder:** Muted Ink at full 4.5:1 contrast — never a faint gray that fails legibility.
- **Disabled:** 50% opacity, `cursor-not-allowed`.

### Navigation
- **Style:** Top bar (`WheelHeader`) with the gradient page title at left, icon-button actions (history, settings) at right using `variant="ghost" size="icon"`. Hairline bottom border (`border-b border-border`).
- **States:** Ghost hover-elevate on icon buttons; tooltips supply labels for icon-only actions. Mobile keeps the same bar with touch targets ≥48px.

### Wheel (Signature Component)
The hero. A pure SVG renderer on a 500×500 viewBox (radius 200, centered at 250,250). Segments use per-segment gradients (`segmentGradient-{id}`), flat-vibrant fills from the segment palette, with auto-contrast label text (white or dark per segment luminance) and auto-sizing for long names. A thin metallic outer ring and a fixed red/gold pointer at top give the luxe, slightly-elevated feel. Spin easing is a long ease-out (`cubic-bezier(0.17, 0.67, 0.12, 0.99)`), 4–5s with ±0.5s variance, landing with a gentle settle; the button locks during the spin. Claimed segments (no-repeat mode) drop to 0.35 opacity.

## 6. Do's and Don'ts

### Do:
- **Do** keep the wheel the single lit hero of every screen it appears on; quiet the chrome around it.
- **Do** ration the brand gradient to ≤10% of a screen — a title, one CTA, a celebration. It's stage lighting, not paint.
- **Do** keep surfaces flat at rest; earn depth through `hover-elevate`/`active-elevate-2` and the three signature glows only.
- **Do** use `border-border` (Hairline) for all borders so they adapt to light/dark — never `border-white/10`.
- **Do** hold body and placeholder text to ≥4.5:1 contrast; bump Muted Ink toward Ink if it drifts close on a tinted surface.
- **Do** honor `prefers-reduced-motion`: the spin, `pulse-glow`, `idle-breathe`, and slide-ins all need a crossfade-or-instant fallback.
- **Do** indicate the winner by pointer position + label highlight, not color alone (the wheel is color-heavy and some users can't rely on hue).
- **Do** use `size="icon"` for icon-only buttons; let the component own its dimensions.

### Don't:
- **Don't** drift toward the **cheap, ad-stuffed "spin to win" casino aesthetic** — no garish flashing, no fake-prize urgency, no neon stacking. QuickWheel is trustworthy and tasteful.
- **Don't** let the app collapse into a **generic SaaS dashboard** — identical card grids, cards-everywhere, zero personality. The Spotlight Stage is the antidote.
- **Don't** go **childish / clip-art** — no Comic Sans, no primary-color clip art, no kids'-toy energy. Playful ≠ juvenile.
- **Don't** ship **flat and lifeless** — a static form that happens to spin. Motion and depth are the product.
- **Don't** put a drop shadow on a card; if it looks like a 2014 Material card, the shadow is the bug.
- **Don't** apply the gradient `background-clip: text` to anything but the single h1 page title — never body copy, card titles, or labels.
- **Don't** nest cards or use `border-left`/`border-right` >1px as a colored accent stripe — use full borders, spacing, or Hairline dividers.
- **Don't** exceed 20px display type in the app shell; make the wheel bigger instead.
