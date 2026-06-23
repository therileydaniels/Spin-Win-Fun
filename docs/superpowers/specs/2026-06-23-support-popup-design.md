# Support Popup — one-time "support the app" dialog

**Date:** 2026-06-23
**Status:** Design approved, pending spec review
**Branch:** `auth-testing` (ships with the monetization work, before merge)

## Purpose

A friendly, one-time dialog that appears after a new user's **first spin**. It reassures
them that the core app is and will stay free, and invites (does not pressure) them to support
the app by upgrading to Pro — which helps cover hosting and fund more free tools. It is a
*thank-you-and-ask*, not a paywall or feature gate.

## Behavior

- **Trigger:** fires once, shortly after the user's **first completed spin** (the winner has
  been revealed and the spin animation has settled), so the ask follows a positive moment.
- **Audience:** anonymous users and signed-in Free users. **Pro users never see it** (no point
  asking an existing supporter to upgrade).
- **One-time per device:** gated by a `localStorage` flag (mirrors `MigrationPrompt`). Once the
  flag is set, it never shows again on that device.
- **Dismissal rules (mirror `MigrationPrompt`):**
  - Clicking either button (**Maybe later** or **Support QuickWheel**) burns the flag — it won't
    show again.
  - Escape / overlay-click closes it for the **current session only** and does **not** burn the
    flag, so a stray Escape just defers it to a later session rather than forfeiting it.
- **Actions:**
  - **Maybe later** → close, burn flag.
  - **Support QuickWheel** → burn flag, navigate to `/pricing` (Clerk `<PricingTable />` handles
    the rest; anonymous users can sign in inside the Clerk flow).

## Copy (approved — Variant A)

- **Title:** `QuickWheel is free — and staying that way`
- **Body:** `All the core features are free forever. If you'd like to support the app, you can
  upgrade to Pro — it helps me cover hosting costs and build more free tools like this one.
  Either way, thanks for spinning! 🎡`
- **Buttons:** `Maybe later` (ghost/outline) · `Support QuickWheel` (primary gradient)

## Component design

New component `SupportPrompt.tsx`, modeled on `MigrationPrompt.tsx`:

- Uses the shadcn `Dialog` family (not `AlertDialog`), consistent with `MigrationPrompt`.
- Reads Pro status from `useEntitlements()` / Clerk (the same source the rest of the app uses).
  If Pro, render nothing.
- Subscribes to spin completion (the same signal that reveals the winner — exact hook resolved
  during implementation; candidates: a callback from `useWheelSpin`, or watching the winner
  state in `Home.tsx`).
- On first spin completion, if the flag is unset and the user is not Pro, open the dialog after a
  short delay (~1s) so it doesn't collide with the win celebration.
- Navigates with Wouter's `useLocation` (as `UpgradeDialog` does) for the `/pricing` route.

### localStorage flag

- Key: `quickwheel_support_prompt_seen` (string `"true"`).
- Set only by the two button handlers; never by Escape/overlay close.

### Mount point

Mount alongside `MigrationPrompt` in `WheelHeader.tsx` (or wherever it can observe spin
completion most cleanly — to be confirmed in the plan, since it must hear the spin event).

## Why a separate component (not `UpgradeDialog`)

`UpgradeDialog` is a transactional feature gate ("X is a Pro feature"). This popup has a
different job and tone (support/thanks, triggered by behavior, one-time). Keeping it separate
keeps each component single-purpose and avoids overloading the gate dialog with unrelated state.

## Out of scope (YAGNI)

- No "don't show again" checkbox (it's already one-time).
- No per-account sync of the seen flag (per-device, like `MigrationPrompt`, is sufficient).
- No A/B copy testing, analytics, or multiple trigger points.
- No separate in-popup sign-in step (Clerk's flow on `/pricing` covers it).

## Testing

- The popup itself is UI/behavioral; the existing Vitest suite covers the pure entitlements
  logic and won't change. Manual verification: as an anon/Free user, first spin → popup appears;
  buttons set the flag; Escape does not; Pro user never sees it; reload after dismissal → no
  popup.

## Risks / notes

- Must read the spin-completion signal without coupling tightly to spin internals; prefer an
  existing callback/state over reaching into `useWheelSpin`.
- Ships on `auth-testing` with the rest of monetization — verify before the merge described in
  the monetization handoff.
