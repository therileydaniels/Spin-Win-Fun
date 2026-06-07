# QuickWheel — CLAUDE.md

## App Purpose
A prize wheel spinner PWA. Users customize wheel segments, spin to pick a winner, save/load wheels, and share them via URL. Supports Supabase auth for cloud-saved wheels.

## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**
- **Auth:** Supabase (`@supabase/supabase-js`) — email/password + magic link
- **Storage:** Supabase for authenticated users; `localStorage` for unauthenticated local wheels
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`

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

## Core Components
- `SpinWheel.tsx` — pure SVG wheel renderer; `data-testid="wheel-svg"` on the main SVG, `data-testid="wheel-pointer"` on the pointer overlay div
- `SpinButton.tsx` — animated spin trigger
- `ProbabilityPanel.tsx` — settings sidebar (add/remove/rename/recolor segments, save, share, OBS embed)
- `WheelHeader.tsx` — top nav with auth slot, history toggle, settings toggle
- `AuthModal.tsx` — sign-in / sign-up modal
- `UserMenu.tsx` — logged-in user dropdown

## Key Hooks
- `useWheelSpin` — manages rotation state and spin physics
- `useCustomSegments` — segment CRUD, probability management, save/load
- `useSound` — win sound toggle
- `AuthContext` — Supabase session provider

## PNG Export
`handleDownloadPng` in `Home.tsx` composites the wheel SVG (`data-testid="wheel-svg"`) and pointer SVG (`data-testid="wheel-pointer" > svg`) onto a canvas using `getBoundingClientRect` for positioning, then downloads as a transparent-background PNG at 2.5× screen resolution. The "Save as PNG" button appears below the Spin button when not in presentation mode.

## Conventions
- Wheel SVG uses a 500×500 viewBox, radius 200, center at (250, 250)
- Segment gradients use IDs `segmentGradient-{id}` — always unique per segment
- `claimedIds` tracks no-repeat mode; segments at 0.35 opacity when claimed
- Share links encode wheel data as base64 in `?wheel=` query param
- OBS embed link: `/app/embed?wheel=<encoded>`
- Changelog version gating via `CHANGELOG_VERSION` in `lib/changelog.ts`
