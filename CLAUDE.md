# QuickWheel — CLAUDE.md

## App Purpose
A prize wheel spinner PWA. Users customize wheel segments, spin to pick a winner, save/load wheels, and share them via URL.

## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**; `@clerk/backend` verifies session tokens; Drizzle ORM over Railway Postgres
- **Auth:** Clerk (`@clerk/react`) — modal sign-in/sign-up; server-side token verification on `/api/wheels` routes
- **Storage:** Railway Postgres for signed-in users; `localStorage` for signed-out users. `useWheelStorage()` hook dispatches automatically. Wheel cap is tier-aware (see Monetization).
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`

## Monetization
- **Tiers:** Free (anonymous + signed-in) and **Pro** (Clerk Billing plan slug `pro`, monthly + annual). Clerk Billing is in Beta; `@clerk/react`/`@clerk/backend` are pinned-ish — watch for breaking changes.
- **Source of truth:** `shared/entitlements.ts` — `entitlementsFor(isPro)` returns the caps object (pure, no deps; portable to other Clerk apps). Client reads it via `useEntitlements()`; server reads `req.auth.isPro` (set in `server/clerkAuth.ts` via `authenticateRequest().has({ plan: 'pro' })`).
- **Hard gates (server, authoritative):** wheel cap (Free 3 / Pro 50) + segment count (Free 8 / Pro 20) in `server/wheelsRouter.ts`. Anonymous local cap is `FREE.maxWheels` in `localWheelStorage.ts`.
- **Soft gates (client UX):** export, OBS link, presentation mode, custom colors, branding watermark — all read from `useEntitlements()`; bypassable in devtools (accepted).
- **Branding:** `SpinWheel showBranding`; Pro OBS links append `nb=1` so `/embed` hides the watermark. Free users may view/spin shared wheels with >8 segments but can't author past their tier.
- **Pricing UI:** `/pricing` (`Pricing.tsx`) renders Clerk `<PricingTable />`; `UpgradeDialog` + "Go Pro" nav entries route there.
- **Env:** server now needs `CLERK_PUBLISHABLE_KEY` (same value as `VITE_CLERK_PUBLISHABLE_KEY`) for `authenticateRequest`. `authorizedParties` is set to `https://quickwheel.co` in production only.
- **Tests:** Vitest (`npm test`) covers the pure entitlements logic (`shared/entitlements.test.ts`). Tests never touch the DB.
- **Migration to direct Stripe (future):** Clerk does NOT sync subscriptions to Stripe Billing — moving off Clerk means re-creating subscriptions, but the entitlements layer keeps the app code provider-agnostic. See spec.

## Key Routes
| Path | Component | Notes |
|------|-----------|-------|
| `/` | `Home.tsx` | Main wheel + spin UI |
| `/my-wheels` | `MyWheels.tsx` | Saved wheels list |
| `/templates` | `Templates.tsx` | Preset wheel templates |
| `/pricing` | `Pricing.tsx` | Clerk `<PricingTable />` — Free vs Pro |
| `/embed` | `Embed.tsx` | OBS browser-source overlay |
| `/privacy` | `Privacy.tsx` | Privacy policy |
| `/terms` | `Terms.tsx` | Terms of service |

## Data Model (segment)
```ts
{ id: string; label: string; color: string; probability: number }
```
Probabilities are normalized weights (not percentages). Equal odds = all 1.0.

## Data Model (saved wheel)
Cloud:
```ts
{ id: uuid; userId: clerk-user-id; name: string; segments: WheelSegment[]; createdAt; updatedAt }
```
Indexed on `user_id`. 50-wheel-per-user cap enforced server-side.

Local: same shape minus `userId`, IDs are `crypto.randomUUID()` strings.

`MigrationPrompt` (one-time per device) imports local wheels to cloud on first sign-in.

## Core Components
- `SpinWheel.tsx` — pure SVG wheel renderer; `data-testid="wheel-svg"` on the main SVG, `data-testid="wheel-pointer"` on the pointer overlay div
- `SpinButton.tsx` — animated spin trigger
- `ProbabilityPanel.tsx` — settings sidebar (add/remove/rename/recolor segments, save, share, OBS embed)
- `WheelHeader.tsx` — top nav with history toggle, settings toggle

## Key Hooks
- `useWheelSpin` — manages rotation state and spin physics
- `useCustomSegments` — segment CRUD, probability management, save/load
- `useSound` — win sound toggle

## SVG Export
`handleDownloadSvg` in `Home.tsx` composites the wheel SVG (`data-testid="wheel-svg"`) and pointer SVG (`data-testid="wheel-pointer" > svg`) into a single combined SVG document. It uses `getBoundingClientRect` to position each piece and scales each from its own viewBox (wheel 500×500, pointer 40×52) into the shared CSS-pixel space, then downloads it as an `.svg` file. The "Save as SVG" button appears below the Spin button when not in presentation mode.

## Conventions
- Wheel SVG uses a 500×500 viewBox, radius 200, center at (250, 250)
- Segment gradients use IDs `segmentGradient-{id}` — always unique per segment
- `claimedIds` tracks no-repeat mode; segments at 0.35 opacity when claimed
- Share links encode wheel data as base64 in `?wheel=` query param
- OBS embed link: `/app/embed?wheel=<encoded>`
- Changelog version gating via `CHANGELOG_VERSION` in `lib/changelog.ts`

## Environment
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key (`pk_test_…` / `pk_live_…`). **Baked into the frontend at build time** — changing it requires a fresh build/deploy, not just a restart.
- `CLERK_SECRET_KEY` — Clerk backend key for token verification (`sk_test_…` / `sk_live_…`)
- `DATABASE_URL` — Postgres connection string. Read at server startup (`server/db.ts` throws if unset → boot crash / 502). Must be present in the Railway service's own variables.
- **Prod Clerk = three `live` keys.** The Production Clerk instance is separate from Development and has its own key set. When pointing prod at it, **all three** must be the `live` values together: `VITE_CLERK_PUBLISHABLE_KEY` (`pk_live_…`), `CLERK_PUBLISHABLE_KEY` (`pk_live_…`), `CLERK_SECRET_KEY` (`sk_live_…`). A mismatch (e.g. live publishable + test secret) means the server can't verify frontend tokens → wheel save/load + server-side `isPro` break while the UI still looks fine.
- **New prod instance warm-up:** a freshly-created Clerk production instance can serve intermittent **503s on `clerk-js`** (`clerk.<domain>/npm/@clerk/clerk-js…`) for a while after first deploy while the custom domain / SSL propagates. Sign-in flickers then; it self-resolves — not a code bug.

## Deployment
- **Host:** Railway, serving `quickwheel.co`. **Auto-deploys on push to `main`** (GitHub repo `therileydaniels/Spin-Win-Fun`). Treat any push to `main` as a production release.
- **Build/start:** `npm run build` (Vite client → `dist/public`, esbuild server → `dist/index.cjs`) then `npm start`. Server reads `PORT` (Railway-provided), defaults 5000.
- **DNS/proxy:** Cloudflare in front. Clerk's verification CNAMEs (`clerk`, `accounts`, `clkmail`, `clk._domainkey`, `clk2._domainkey`) must be **DNS-only (grey cloud)**, not proxied.
- **Shared DB gotcha:** local `.env.local` `DATABASE_URL` points at the *same* Railway Postgres as production — dev writes are real production rows.

## Content Security Policy (production only)
`server/index.ts` sets a helmet CSP that applies only when `NODE_ENV=production`. It **must** allow Clerk's frontend API (`clerk.quickwheel.co`) and Cloudflare bot protection (`challenges.cloudflare.com`) in `script-src`/`connect-src`/`frame-src`, plus `img.clerk.com` and `worker-src blob:` — otherwise the browser blocks `clerk-js` and the sign-in/up UI silently never renders (works locally where CSP is off). See https://clerk.com/docs/security/clerk-csp. Known harmless gap: Cloudflare's `static.cloudflareinsights.com` beacon is CSP-blocked (console error only).
