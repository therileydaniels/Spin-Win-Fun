# Plan: More slices (up to 20) with a number + legend fallback

**Branch:** `feature/more-slices-legend`
**Date:** 2026-08-27
**Goal:** Let QuickWheel hold up to 20 slices while keeping labels readable, by auto-switching a dense wheel to numbered slices backed by a legend. Export stays full-label and self-contained.

---

## Decisions (locked)

| Topic | Decision |
|-------|----------|
| Max slices | 12 → **20** |
| Trigger | **Auto**: wheel stays plain text until a label genuinely won't fit, then the *whole* wheel flips to numbers + legend (all-or-nothing) |
| Screen | Numbered wheel + legend panel (side on desktop, below on mobile) |
| Presentation mode | Legend shown, compact (side/below); winner banner reveals full label |
| OBS / embed | Wheel only, **no legend** |
| Export (SVG) | Rendered large with **full labels baked into slices** — no numbers, no legend, self-contained |
| Winner readout | **Always** shows the full label, regardless of screen mode |
| Numbering | Plain `1–20`, matching slice order |

### Why export is the easy part
The exported SVG is vector and output at a large fixed size (e.g. ~2000px), not the ~400px the wheel occupies on screen. A 12px font in the 500-viewBox becomes ~48 effective px at 2000px — sharp and readable. So the export can render **full labels in-slice** even when the on-screen wheel is in numbered mode. No need to bake a legend into the export.

**Named tradeoff:** the export will *not* look identical to the screen (screen = numbers, export = full labels). This is intentional and considered an improvement.

---

## Key concept: the "does it fit?" signal

Everything hinges on one function knowing whether a label fits legibly. Today `getRadialColumns` in `client/src/components/SpinWheel.tsx` always returns *something* (it truncates + drops to 9px as a last resort). We need it to also report **whether that result is acceptable or a forced fallback**.

Proposed: have the layout return a `fits: boolean` alongside `{ columns, fontSize }`. Define "doesn't fit" as roughly:
- font had to drop below ~10px, **or**
- the label required truncation (label longer than what fit), **or**
- required >2 columns to fit.

Tune the exact threshold by feel during testing (see Risks) so the flip doesn't trigger too eagerly on a wheel of medium-length labels.

The wheel is in **legend mode** when *any* segment's layout reports `fits === false`.

---

## Work breakdown

### 1. Raise the cap — `shared/entitlements.ts`
- `maxSegments` 12 → 20.
- Caps are enforced in `useCustomSegments.ts` (segment cap) — verify the error/toast copy still reads sensibly at 20.
- No change to `maxWheels`.

### 2. Layout "fits" signal — `client/src/components/SpinWheel.tsx`
- Extend `getRadialColumns` to return `fits: boolean`.
- Add a single-line preference at high slice counts (skip column-wrapping past ~14 slices — one radial spoke line uses the full ~164px radius and reads better than stacked columns in a narrow wedge).
- Derive a wheel-level `isLegendMode = segments.some(s => !layout(s).fits)` (computed from the existing memoized `columnsById`).

### 3. Numbered rendering path — `SpinWheel.tsx`
- When `isLegendMode`, render each slice's **number** (index + 1) instead of its label, centered radially, at a comfortable fixed size.
- Keep `<title>{segment.label}</title>` on each slice path (hover tooltip / accessibility).
- Keep the `aria-label` on the SVG listing full labels.
- Add a prop to force label mode regardless (used by the export path — see step 6).

### 4. Legend component — new `client/src/components/WheelLegend.tsx`
- Renders a numbered list: `1 — <label>`, colour swatch per row matching the slice colour.
- Responsive: column beside the wheel on desktop, stacked below on mobile.
- Reflects claimed/no-repeat state (dim claimed rows to match the 0.35-opacity slices).

### 5. Wire legend into the screen layouts — `client/src/pages/Home.tsx`
- Show `WheelLegend` when `isLegendMode` and **not** in embed mode.
- Presentation mode: render the legend compact (side on wide screens, below on tall). Winner banner already shows the full label — confirm it does in presentation mode too.
- Embed (`client/src/pages/Embed.tsx`): never render the legend — wheel only.

### 6. Export stays full-label — `handleDownloadSvg` in `Home.tsx`
- Render the export wheel with the **force-label-mode** prop so slices show full labels even when the screen is in legend mode.
- Confirm the export size is large enough that legend-mode-triggering labels are still legible (bump the export render size if needed).
- The existing compositing (wheel SVG + pointer SVG into one document) is unchanged; only the label-vs-number choice differs.

### 7. Winner readout
- Verify the winner banner/result always pulls `segment.label` (full), never the number. Should already be true — confirm and adjust if it reads from displayed text.

---

## Surfaces to re-check after building
- `/` Home — normal + legend mode, desktop + mobile widths
- Presentation mode — legend placement, winner reveal
- `/embed` (OBS) — wheel only, transparent, no legend
- SVG export — open the file, confirm full labels are sharp at 15–20 slices
- No-repeat / claimed mode — claimed slices dim in both wheel and legend
- Templates / My Wheels — a saved 20-slice wheel round-trips through localStorage fine

## Risks / things to feel out during testing
- **Threshold tuning** is the main one — "won't fit" must not fire on a wheel of medium labels that would've been fine. Test with mixed real-world labels (names, short phrases).
- Legend + presentation mode layout on very wide vs very tall projector aspect ratios.
- Export render size vs. the largest realistic label — make sure nothing truncates in the export at 20 slices.

## Out of scope (deliberately)
- Curved-along-the-rim text (worse for many slices; not doing)
- Letters/emoji numbering (numbers only, per decision)
- Per-slice mixed number/text (all-or-nothing chosen instead)
- Raising `maxWheels`
