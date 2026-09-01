# QuickWheel — CLAUDE.md

## App Purpose
A prize wheel spinner PWA. Users customize wheel segments, spin to pick a winner, save/load wheels, and share them via URL.

## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000** — serves the static app and the `/api/spin` endpoint only. No accounts, no database.
- **Storage:** `localStorage` only, via `useWheelStorage()` / `localWheelStorage.ts`. No cloud sync.
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`

## Entitlements
Everyone gets the same flat set of limits — there is no free/paid tier. Source of truth: `shared/entitlements.ts` — `ENTITLEMENTS` (10 wheels, 20 segments, export/OBS/presentation mode/custom colors all enabled, no branding watermark). Client reads it via `useEntitlements()`. The wheel cap is enforced in `localWheelStorage.ts` (`saveWheelToLocal`/`duplicateLocalWheel`); the segment cap is enforced in `useCustomSegments.ts`. Hitting either cap shows a plain error/toast — there's no upsell.

## Key Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home.tsx` | Main wheel + spin UI |
| `/my-wheels` | `MyWheels.tsx` | Saved wheels list |
| `/templates` | `Templates.tsx` | Preset wheel templates |
| `/embed` | `Embed.tsx` | OBS browser-source overlay |
| `/privacy` | `Privacy.tsx` | Privacy policy |
| `/terms` | `Terms.tsx` | Terms of service |

## Data Model (segment)
```ts
{ id: string; label: string; color: string; probability: number }
```
Probabilities are normalized weights (not percentages). Equal odds = all 1.0.

## Data Model (saved wheel)
```ts
{ id: string; name: string; segments: WheelSegment[]; createdAt; updatedAt }
```
Stored in `localStorage` only (`localWheelStorage.ts`), IDs are `crypto.randomUUID()` strings. Capped at `ENTITLEMENTS.maxWheels` (10) per browser.

## Dense wheels (legend mode)
Text layout lives in `client/src/lib/wheelTextLayout.ts`. `getRadialColumns` lays a label out as radial spoke columns and reports `fits` (legible in-slice: font ≥ `FIT_MIN_FONT`, ≤2 columns, untruncated). `shouldUseLegend(segments)` is true when **any** label fails to fit — all-or-nothing. When true, `SpinWheel` renders each slice's **number** (index+1) instead of its label, and `Home.tsx` shows `WheelLegend.tsx` (a numbered `number → label` key, side/below the wheel; compact in presentation mode). Winner readouts always use the full `label`. `SpinWheel`'s `forceLabels` prop opts out of legend mode (always real labels) — used by the OBS embed (`Embed.tsx`, no legend to decode numbers) and the export wheel. `FIT_MIN_FONT` in `wheelTextLayout.ts` is the tuning knob for how eagerly the legend triggers.

## Core Components
- `SpinWheel.tsx` — pure SVG wheel renderer; `data-testid="wheel-svg"` on the main SVG, `data-testid="wheel-pointer"` on the pointer overlay div. `forceLabels` bypasses legend mode.
- `WheelLegend.tsx` — numbered key shown beside/below a dense (legend-mode) wheel; `data-testid="wheel-legend"`
- `SpinButton.tsx` — animated spin trigger
- `ProbabilityPanel.tsx` — settings sidebar (add/remove/rename/recolor segments, save, share, OBS embed)
- `WheelHeader.tsx` — top nav with history toggle, settings toggle

## Key Hooks
- `useWheelSpin` — manages rotation state and spin physics
- `useCustomSegments` — segment CRUD, probability management, save/load
- `useSound` — win sound toggle

## SVG Export
`handleDownloadSvg` in `Home.tsx` composites the wheel SVG (`data-testid="wheel-svg"`) and pointer SVG (`data-testid="wheel-pointer" > svg`) into a single combined SVG document. It reads from a **hidden, upright, full-label export wheel** (`[data-export-wheel]`, a `forceLabels` `SpinWheel` rendered off-screen at `EXPORT_WHEEL_SIZE` = 1200px), not the on-screen wheel — so exports are always high-res and show real labels even when the visible wheel is in numbered/legend mode. It uses `getBoundingClientRect` to position each piece and scales each from its own viewBox (wheel 500×500, pointer 40×52) into the shared CSS-pixel space, then downloads it as an `.svg` file. The "Save as SVG" button appears below the Spin button when not in presentation mode.

## Conventions
- Wheel SVG uses a 500×500 viewBox, radius 200, center at (250, 250)
- Segment gradients use IDs `segmentGradient-{id}` — always unique per segment
- `claimedIds` tracks no-repeat mode (claimed segments are excluded from the next spin in `Home.tsx`'s `handleSpin`); the wheel does **not** visually dim them
- Share links encode wheel data as base64 in `?wheel=` query param
- OBS embed link: `/app/embed?wheel=<encoded>`
- Changelog version gating via `CHANGELOG_VERSION` in `lib/changelog.ts`

## SupportPrompt
`SupportPrompt.tsx` (a one-time "support QuickWheel" popup after a user's first spin) is disabled — `shouldShowSupportPrompt` in `shared/supportPrompt.ts` always returns `false`. It previously pointed at the now-removed Pro upsell. Re-enable once there's a new donation destination to link it to.

## Environment
No required environment variables — the app has no accounts or database. `PORT` is optional (defaults to 5000).

## Deployment
- **Host:** Railway, serving `quickwheel.co`. **Auto-deploys on push to `main`** (GitHub repo `therileydaniels/Spin-Win-Fun`). Treat any push to `main` as a production release.
- **Build/start:** `npm run build` (Vite client → `dist/public`, esbuild server → `dist/index.cjs`) then `npm start`. Server reads `PORT` (Railway-provided), defaults 5000.
- **DNS/proxy:** Cloudflare in front.
- **Note:** the app previously had Clerk auth/billing and a Railway Postgres-backed cloud wheel store; both were removed. The Postgres database itself was left running (not torn down) with any pre-existing rows intact, but the app no longer reads or writes to it.

## Content Security Policy (production only)
`server/index.ts` sets a helmet CSP that applies only when `NODE_ENV=production`. It allows Google Analytics (`googletagmanager.com`, `google-analytics.com`) for `script-src`/`img-src`/`connect-src`. Known harmless gap: Cloudflare's `static.cloudflareinsights.com` beacon is CSP-blocked (console error only).
