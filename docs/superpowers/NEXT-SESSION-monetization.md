# Pick up here — QuickWheel monetization (Free / Pro)

_Last worked: 2026-06-16. Branch: `auth-testing`._

## What this is
We added a paid **Pro** tier to QuickWheel using Clerk Billing. It's fully built,
reviewed, tested, and confirmed working in the browser — but it is **NOT live**.
Everything sits on the `auth-testing` branch; `main` (production) is untouched.

## What's done ✅
- Free vs Pro tiers fully coded (caps, locks, upgrade prompts, `/pricing` page).
- Free tier: 3 wheels, 8 segments, preset colors, watermark shown, no export/OBS/presentation.
- Pro tier: 50 wheels, 20 segments, custom colors, no watermark, export + OBS + presentation.
- Automated tests pass, typecheck clean, production build succeeds.
- Verified live in the browser (signed-out/free side): segment cap shows 6/8, color
  swatches are locked with an upgrade dialog, "Save as SVG (Pro)", watermark renders,
  and `/pricing` shows Free $0 + Pro $3.50/mo.
- Clerk **Development** instance has the `pro` plan set up.
- `CLERK_PUBLISHABLE_KEY` already added to local `.env.local`.

Design details: `docs/superpowers/specs/2026-06-16-monetization-tiers-design.md`
Build steps:    `docs/superpowers/plans/2026-06-16-monetization-tiers.md`
Architecture:   the "Monetization" section of `CLAUDE.md`

## To resume / finish (in order)
1. **Test the Pro side locally.** Run `npm run dev`, open http://localhost:5000/app,
   click **Sign up**, then **Go Pro** → **Subscribe** with Stripe test card
   `4242 4242 4242 4242` (any future expiry, any CVC/ZIP). Confirm everything unlocks
   (segments go to /20, real color pickers, watermark gone, OBS/presentation/export work).
2. **Set up the Production Clerk instance** (separate from Development):
   - Create the plan with slug **exactly `pro`**, monthly + annual prices, **"Publicly available" ON**.
   - Connect your **real** Stripe account (the dev gateway is test-only).
3. **Add the key to Railway:** add `CLERK_PUBLISHABLE_KEY` to the server service
   variables (same value as `VITE_CLERK_PUBLISHABLE_KEY`). Without it the server 500s.
4. **Go live:** merge `auth-testing` → `main`. That auto-deploys to production.
   Optionally bump `CHANGELOG_VERSION` in `client/src/lib/changelog.ts` to announce Pro.

## Gotchas to remember
- Merging to `main` = instant production deploy. Don't merge until steps 2 & 3 are done.
- Local `.env.local` `DATABASE_URL` points at the **same Railway Postgres as production** —
  wheels you save while testing are real production rows.
- Clerk Billing is in Beta and does NOT sync subscriptions to Stripe Billing; a future
  move to direct Stripe means re-creating subscriptions (the app code stays the same).
- Known cosmetic-only items: the watermark tumbles during the spin animation (lands
  upright); a pre-existing favicon 404 (`/app/app/favicon-32x32.png`) unrelated to this work.
