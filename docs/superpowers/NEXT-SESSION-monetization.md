# Pick up here — QuickWheel monetization (Free / Pro)

_Last worked: 2026-06-22. Branch: `auth-testing`. **Plan: push to `main` on 2026-06-23.**_

## What this is
We added a paid **Pro** tier to QuickWheel using Clerk Billing. It's fully built,
reviewed, and tested — local + production billing infra are set up — but it is
**NOT live yet**. Everything sits on the `auth-testing` branch; `main` (production)
is still the old auth-only build. **Almost done: one key to verify, then merge.**

## What's done ✅
- Free vs Pro tiers fully coded (caps, locks, upgrade prompts, `/pricing` page).
- Free tier: 3 wheels, 8 segments, preset colors, watermark shown, no export/OBS/presentation.
- Pro tier: 50 wheels, 20 segments, custom colors, no watermark, export + OBS + presentation.
- Automated tests pass, typecheck clean, production build succeeds.
- **Free side verified** in the browser: segment cap, locked color swatches → upgrade
  dialog, "Save as SVG (Pro)", watermark renders, `/pricing` shows Free $0 + Pro $3.50/mo.
- **Pro side verified locally** (2026-06-22) with Stripe test card — unlocks confirmed.
- Clerk **Development** instance has the `pro` plan set up.
- **Clerk Production instance set up** (2026-06-22): `pro` plan (slug `pro`, monthly +
  annual, "Publicly available" ON) + **real Stripe account connected**. Billing enabled
  (Clerk's "you're all set up" confirmation seen — the `<PricingTable/>`/`has()` it tells
  you to add are already in our code, nothing more to do there).
- **Railway env (production) updated**: all three prod keys confirmed `live` —
  `VITE_CLERK_PUBLISHABLE_KEY` = `pk_live_…`, `CLERK_PUBLISHABLE_KEY` = `pk_live_…`,
  and `CLERK_SECRET_KEY` = `sk_live_…` (verified 2026-06-22).
- **Production auth confirmed loading** on quickwheel.co: the initial `clerk-js` 503s were
  just the brand-new prod instance warming up / propagating — resolved on its own; sign-in
  / sign-up render reliably now.
- `CLERK_PUBLISHABLE_KEY` also in local `.env.local`.

Design details: `docs/superpowers/specs/2026-06-16-monetization-tiers-design.md`
Build steps:    `docs/superpowers/plans/2026-06-16-monetization-tiers.md`
Architecture:   the "Monetization" section of `CLAUDE.md`

## To finish — remaining before push
All prerequisites are done. Only the deploy is left.

1. **(Optional) Final Free-lock sanity check locally:** `npm run dev`, open
   **http://localhost:5000/app/** (trailing slash; dev base is `/app/`, not `/app`), stay
   **signed out** = Free tier. Confirm: 8-segment cap, locked color swatches, "Save as SVG
   (Pro)", watermark shown, 3-wheel cap. Sub-routes like `/pricing` resolve via in-app nav,
   not by typing the URL.
2. **Go live:** merge `auth-testing` → `main` and push. That auto-deploys to production
   and turns on the whole Pro/Free system. Optionally bump `CHANGELOG_VERSION` in
   `client/src/lib/changelog.ts` to announce Pro.

   ```
   git checkout main
   git merge auth-testing
   git push
   ```

   **After the push:** watch the Railway deploy, then load quickwheel.co signed out and
   confirm the Free locks are now live (they're absent today only because the code isn't
   on `main` yet). If sign-in flickers briefly right after deploy, that's instance warm-up.

## Why "nothing is locked" on the live site right now
Expected — the locking code isn't deployed. There's **no entitlements code on `main`**;
production only deploys from `main`, so quickwheel.co is still the old auth-only build with
zero gating. The merge in step 3 is what makes the locks appear live. (Confirmed:
`git ls-tree main` has no `shared/entitlements.ts`.)

## Gotchas to remember
- Merging to `main` = instant production deploy. Don't merge until step 1 is confirmed.
- A brand-new Clerk **production** instance can serve intermittent **503s on `clerk-js`**
  for a while after first deploy while the custom domain / SSL propagates — it self-resolves.
  If sign-in flickers right after going live, that's warm-up, not a code bug.
- Local `.env.local` `DATABASE_URL` points at the **same Railway Postgres as production** —
  wheels you save while testing are real production rows.
- Clerk Billing is in Beta and does NOT sync subscriptions to Stripe Billing; a future
  move to direct Stripe means re-creating subscriptions (the app code stays the same).
- Minor CSP gap (non-blocking): production `connect-src` doesn't include
  `https://fonts.googleapis.com`, so the service worker's font `fetch` is blocked (console
  error only; fonts still load via the `<link>`). Worth adding to the helmet CSP in
  `server/index.ts` later.
- Known cosmetic-only items: the watermark tumbles during the spin animation (lands
  upright); a pre-existing favicon 404 (`/app/app/favicon-32x32.png`) unrelated to this work.
