# Design Guidelines for Rigged Wheel Spinner (Phase 1)

## Design Direction
**Aesthetic:** Luxe, polished, premium — high-end but approachable  
**Style:** Clean, modern, minimal clutter  
**Inspiration:** Tiny Decisions' simplicity + elevated sophistication

---

## Color System

**Default Mode:** Light theme with crisp white/off-white background  
**Dark Mode:** Deep charcoal/black background (included in MVP)  
**Wheel Segments:** Vibrant but harmonious colors (6 hardcoded segments with curated color palette)  
**Pointer:** Red/gold triangle at top — premium metallic feel

---

## Typography

**Font Family:** Modern sans-serif (Inter, Poppins, or SF Pro)  
**Segment Text:** Auto-contrast (white or dark based on segment color)  
**Auto-sizing:** Text scales based on segment name length

---

## Layout & Spacing

**Tailwind Units:** Use spacing of 4, 6, 8, 12, 16 for consistent rhythm  
**Mobile-First:** Responsive design with touch-friendly targets  
**Wheel Centering:** Perfect circle centered on page with clean backdrop

---

## Core Components

### Wheel Design
- **Shape:** Perfect circle with clean segment divisions
- **Segments:** Flat colors with subtle gradient or slight bevel for depth
- **Border:** Thin outer ring (metallic gold/silver for luxe feel)
- **Pointer:** Sleek red/gold triangle fixed at top, slightly elevated appearance

### Spin Button
- **Size:** Large and prominent — feels tactile
- **Style:** Rounded corners, subtle shadow, elevated appearance
- **States:** Satisfying hover/tap feedback, disabled state during spin
- **Position:** Below wheel, centered

### UI Elements
- **Buttons:** Rounded corners, subtle shadows, smooth hover states
- **Cards/Panels:** Soft shadows, rounded corners, clean separation
- **Icons:** Simple line icons, consistent stroke weight

---

## Animation & Interaction

**Spin Animation:**  
- Duration: 4-5 seconds with ±0.5s randomness
- Easing: Fast start, natural deceleration (ease-out)
- Landing: Gentle bounce when stopping at winner

**Win Celebration:**  
- Confetti: Colorful burst matching wheel theme
- Sound: Satisfying "ding" or chime (toggleable)
- Result Display: Clean highlight of winning segment

**Spin Lock:** Button disabled and visually locked during animation

---

## Mobile Responsive

- Large touch targets (min 48px)
- Wheel scales proportionally on smaller screens
- Spin button remains prominent and accessible
- Clean single-column layout on mobile

---

## Images

**No Hero Image Required:** This is a focused single-page app centered on the wheel interface. The wheel itself is the visual centerpiece — no additional hero imagery needed.