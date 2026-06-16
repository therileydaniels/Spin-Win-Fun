# QuickWheel Monetization — Free / Paid Tiers Design

**Date:** 2026-06-16
**Status:** Draft for review
**Branch:** `auth-testing`

## Goal

Introduce a paid plan to QuickWheel. Today every feature is free for everyone;
the only difference between signed-out and signed-in is storage (localStorage,
10 wheels vs cloud Postgres, 50 wheels). This design adds a **Free** tier and a
single **Paid ("Pro")** subscription, gates premium features, and does so with a
**reusable entitlements layer** that future apps can inherit.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Number of money tiers | Two: **Free** + **Pro** |
| Account states | Anonymous and signed-in-free are the **same feature set** (signed-in adds cloud save/sync). The paywall is the only real line. |
| Paywall philosophy | **Generous free, premium polish** — the core wheel stays fun & shareable (it's the marketing); serious/creator/business use is paid. |
| Charge model | **Subscription**: monthly + discounted annual |
| Billing provider | **Clerk Billing** (Stripe-managed by Clerk) |
| Gating granularity | Gate on a single Clerk plan slug `pro`; map plan → capabilities in our own code |

## Tier sheet

| Feature | Free (anon + signed-in) | Pro |
|---|---|---|
| Spin + weighted odds | ✅ | ✅ |
| Sound, dark mode, spin history | ✅ | ✅ |
| No-repeat mode, remove-winner mode | ✅ | ✅ |
| Share link (opens the app with the wheel) | ✅ | ✅ |
| Templates | ✅ | ✅ |
| Segments per wheel | **8** | **20** |
| Saved wheels | **3** (anon→localStorage, signed-in→cloud) | **50** (cloud) |
| Colors | **preset palettes only** | **custom color picker** per segment + **logo on wheel** |
| QuickWheel branding on wheel/overlay | shown ("Made with QuickWheel") | **removed** |
| OBS embed overlay | ❌ | ✅ |
| Presentation / full-screen mode | ❌ | ✅ |
| Export (SVG / PNG) | ❌ | ✅ |

## Architecture

### 1. Reusable entitlements core

Single source of truth — no scattered `has()` calls in feature code. The plan
maps to a concrete capability object; every component and route reads from it.

```ts
// shared/entitlements.ts  — portable across apps
export interface Entitlements {
  maxWheels: number;
  maxSegments: number;
  export: boolean;
  obs: boolean;
  presentation: boolean;
  customColors: boolean;
  branding: boolean; // true = show "Made with QuickWheel"
}

const FREE: Entitlements = {
  maxWheels: 3, maxSegments: 8, export: false, obs: false,
  presentation: false, customColors: false, branding: true,
};
const PRO: Entitlements = {
  maxWheels: 50, maxSegments: 20, export: true, obs: true,
  presentation: true, customColors: true, branding: false,
};

export const entitlementsFor = (isPro: boolean): Entitlements => (isPro ? PRO : FREE);
export const PRO_PLAN = 'pro'; // Clerk plan slug
```

- **Client:** `useEntitlements()` hook wraps `useAuth().has({ plan: PRO_PLAN })`
  and returns `entitlementsFor(isPro)`. Components consume this hook only.
- **Server:** `getEntitlements(user)` wraps `user.has({ plan: PRO_PLAN })` (via
  `@clerk/backend`) and returns the same object.

The **only** coupling to Clerk Billing is the two `has({ plan: 'pro' })` calls
inside these two wrappers. Everything else is provider-agnostic.

### 2. Enforcement

Two kinds of gate. We are explicit about which is which:

**Hard gates (server-enforced, cannot be bypassed):**
- **Wheel cap** — `server/wheelsRouter.ts` already enforces a per-user cap inside
  a transaction with an advisory lock. Replace the constant `MAX_CLOUD_WHEELS`
  with a tier-aware value from `getEntitlements(user).maxWheels` (3 or 50).
- **Segment count on save** — validate `segments.length <= entitlements.maxSegments`
  on POST/PUT `/api/wheels`; reject with 422 if over.

**Soft gates (client-enforced UX gates):**
- Export, OBS-link generation, presentation mode, custom colors, branding watermark.
- These are **inherently client-side** in a PWA and a determined user could bypass
  them via devtools. This is an accepted trade-off: the friction converts the
  honest majority, and none of these expose other users' data or cost us server
  resources. Documented here so it is a known decision, not a surprise.

### 3. Upgrade UX

- New **`/pricing`** route rendering Clerk's `<PricingTable />` (monthly + annual).
- Locked controls remain **visible but show a small "Pro" lock badge**; clicking
  opens an upgrade dialog that links to `/pricing`. (Visible-but-locked converts
  better than hidden — people upgrade for things they can see.)
- Soft nudge (upgrade dialog) when a free user hits the 3-wheel or 8-segment ceiling.

### 4. Existing-user migration (no data loss)

Today signed-in users effectively have a 50-wheel cap. When Free drops to 3,
existing users who already saved more than 3 must be handled gracefully:

- **Never delete a user's wheels.**
- Over-cap free users keep full **read / load / delete** access to all existing
  wheels, but **cannot create new** wheels until they are under 3 (or upgrade).
- Rationale: simplest correct behavior; no destructive action; nudges upgrade
  naturally. (Likely few users affected today.)

## Open sub-decisions (recommendations written in; flag in review to change)

1. **Shared wheel with >8 segments opened by a free user** — Free user can
   **view & spin** it (keeps share links viral) but cannot save/edit it beyond 8
   segments. *Recommended.*
2. **Grandfathering over-cap users** — Use **block-new-saves** (section 4) rather
   than permanently grandfathering. Simpler, still non-destructive. *Recommended.*

## Clerk dashboard setup (manual steps — your action)

> Like the PocketBase pattern: configure the dashboard first, then we wire the code.

1. In the Clerk dashboard, enable **Billing** and connect your **Stripe** account.
2. Create a plan with slug **`pro`**.
3. Add two prices to the plan: **monthly** and **annual** (annual discounted).
4. (Optional, future) Add granular Clerk *features* if you ever want
   dashboard-level toggles; not required — our `entitlements.ts` map covers it.
5. Confirm the plan is published so `<PricingTable />` renders it.

No schema changes to the app's Postgres are required for billing — entitlements
live on the Clerk user. The only DB-adjacent change is making the wheel-cap
constant tier-aware (code, not schema).

## Migration path to direct Stripe (future-proofing)

If we later want full control and to drop the Clerk billing fee, we can move to
direct Stripe — but be precise about what transfers and what doesn't:

- **Customer + payment data is in Stripe; subscriptions are NOT.** Clerk uses
  Stripe only for *payment processing*, so customers, payment methods, and charges
  appear in your Stripe account (card/billing history is retained). **However,
  Clerk Billing Plans and Subscriptions are not synced to Stripe Billing** (per
  Clerk's own FAQ — subscriptions are not visible in Stripe). The subscription
  *state* (who is on Pro, renewal dates) lives inside Clerk.
- **Therefore the billing migration is real work, not a clean hand-off.** Moving
  to direct Stripe Billing means **recreating subscriptions in Stripe** (e.g.
  re-subscribing active users or running a migration), plus standing up our own
  webhooks, customer portal, and subscription-state sync into Postgres (keyed by
  Clerk `userId`).
- **Feature-gating code does NOT change.** Only the two `has({ plan: 'pro' })`
  calls inside `useEntitlements()` / `getEntitlements()` are swapped to read the
  entitlement from Postgres. Every lock badge, cap, and gated feature keeps working
  because it reads from the entitlements layer. This is the portable part, and it
  is genuinely portable.

Conclusion: the **app code** is provider-agnostic and cheap to repoint. The
**billing data** migration is heavier than a pure code swap because Clerk does not
expose subscriptions as Stripe subscriptions. Choosing Clerk Billing now still
makes sense (fastest path, no billing backend), but a future move to direct Stripe
should be planned as a subscription-migration project, not a config change.

## Risks / caveats (Clerk Billing)

- **Beta product.** Clerk Billing is in Beta; Clerk warns APIs may have breaking
  changes and recommends pinning `@clerk/react` and `@clerk/backend` to exact
  versions (no `^`). The implementation plan pins them.
- **USD only**, no tax/VAT handling, and refunds must be issued via Stripe (not
  Clerk). No 3D Secure support (some international cards may be declined).
- **Not available** in Brazil, India, Malaysia, Mexico, Singapore, Thailand.
- **Separate dev/prod instances.** The `pro` plan and gateway must be configured on
  the Production Clerk instance separately before launch (dev uses Clerk's test
  gateway; prod requires your own Stripe account).

## Out of scope (YAGNI)

- Granular per-feature Clerk plans (single `pro` plan is enough).
- Team/organization billing (B2C only for now).
- One-time lifetime purchase (subscription only).
- Promo codes / trials (can add later via Clerk dashboard with no code change).

## Files expected to change (high level; detailed plan to follow)

- **New:** `shared/entitlements.ts`, `client/src/hooks/useEntitlements.ts`,
  `client/src/pages/Pricing.tsx`, an `UpgradeDialog` component, server
  `getEntitlements` helper.
- **Modified:** `server/wheelsRouter.ts` (tier-aware cap + segment validation),
  `ProbabilityPanel.tsx` (color picker → palette/lock, save/segment limits, OBS
  & export & branding gates), `Home.tsx` (export gate, branding, presentation
  gate), `Embed.tsx` (branding), routing for `/pricing`, `WheelHeader.tsx`
  (upgrade entry point), `MyWheels.tsx` (cap messaging).
