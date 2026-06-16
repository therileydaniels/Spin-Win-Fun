# QuickWheel Monetization (Free / Pro) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Free vs Pro tier to QuickWheel, gating premium features behind a Clerk Billing `pro` subscription, built on a reusable entitlements layer.

**Architecture:** A single pure `shared/entitlements.ts` module maps `isPro → capabilities`. The client reads it via `useEntitlements()` (wrapping Clerk `useAuth().has`), the server via the request auth object (`authenticateRequest().toAuth().has`). Hard limits (wheel cap, segment count) are enforced server-side with pure, DB-free functions; soft feature gates (export, OBS, presentation, custom colors, branding) are enforced in the UI. A `/pricing` page renders Clerk's `<PricingTable />`.

**Tech Stack:** React 18 + TypeScript, Vite, wouter, Express (tsx), Drizzle/Postgres, `@clerk/react` + `@clerk/backend` (Clerk Billing), Vitest (new — logic tests only).

**Spec:** `docs/superpowers/specs/2026-06-16-monetization-tiers-design.md`

---

## Prerequisites (manual — do before Phase 4 ships, but read now)

These are the user's actions in external dashboards. The plan notes where each is required.

1. **Clerk dashboard → Billing:** enable Billing, connect Stripe.
2. On the **Plans for Users** tab, create a **plan with slug exactly `pro`**. Add **monthly** and **annual** prices (annual discounted). Ensure the **"Publicly available"** toggle is **ON** — otherwise the plan won't render in `<PricingTable />`. Features are optional (we gate on the plan slug, not features).
3. **Railway env:** add `CLERK_PUBLISHABLE_KEY` (the `pk_test_…`/`pk_live_…` value — same one used as `VITE_CLERK_PUBLISHABLE_KEY`) to the **server** service variables. The server needs it for `authenticateRequest`.
4. Add the same `CLERK_PUBLISHABLE_KEY` to local `.env.local` for dev.

> **Production-DB warning (from project memory):** local `.env.local` `DATABASE_URL` points at the **same Railway Postgres as production**. No task in this plan runs against the DB. Vitest tests are pure functions only — never point a test at the database.

---

## Phase 0 — Test tooling + entitlements core

### Task 1: Add Vitest

**Files:**
- Modify: `package.json` (devDependencies + scripts)

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2.1.8`
Expected: `vitest` added under devDependencies; no peer-dep errors.

- [ ] **Step 2: Add a `test` script**

In `package.json`, inside `"scripts"`, add the `test` line after `"check": "tsc",`:

```json
    "check": "tsc",
    "test": "vitest run",
```

- [ ] **Step 3: Verify the runner works (no tests yet)**

Run: `npm test`
Expected: Vitest runs and reports "No test files found" (exit code may be non-zero; that's fine until Task 2 adds a test).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add vitest for logic tests"
```

---

### Task 2: Entitlements core module (TDD)

The single source of truth. Pure functions only — importable by both client and server. Tests live beside it and import by relative path (no alias config needed).

**Files:**
- Create: `shared/entitlements.ts`
- Test: `shared/entitlements.test.ts`

- [ ] **Step 1: Write the failing test**

Create `shared/entitlements.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  entitlementsFor,
  canSaveWheel,
  isSegmentCountAllowed,
  FREE,
  PRO,
  PRO_PLAN,
} from "./entitlements";

describe("entitlementsFor", () => {
  it("returns FREE caps for a non-pro user", () => {
    expect(entitlementsFor(false)).toEqual(FREE);
    expect(FREE.maxWheels).toBe(3);
    expect(FREE.maxSegments).toBe(8);
    expect(FREE.export).toBe(false);
    expect(FREE.obs).toBe(false);
    expect(FREE.presentation).toBe(false);
    expect(FREE.customColors).toBe(false);
    expect(FREE.branding).toBe(true);
  });

  it("returns PRO caps for a pro user", () => {
    expect(entitlementsFor(true)).toEqual(PRO);
    expect(PRO.maxWheels).toBe(50);
    expect(PRO.maxSegments).toBe(20);
    expect(PRO.export).toBe(true);
    expect(PRO.obs).toBe(true);
    expect(PRO.presentation).toBe(true);
    expect(PRO.customColors).toBe(true);
    expect(PRO.branding).toBe(false);
  });
});

describe("canSaveWheel", () => {
  it("allows saving below the cap", () => {
    expect(canSaveWheel(2, FREE)).toBe(true);
  });
  it("blocks saving at or above the cap", () => {
    expect(canSaveWheel(3, FREE)).toBe(false);
    expect(canSaveWheel(4, FREE)).toBe(false); // over-cap legacy user
    expect(canSaveWheel(50, PRO)).toBe(false);
  });
});

describe("isSegmentCountAllowed", () => {
  it("respects the per-tier max", () => {
    expect(isSegmentCountAllowed(8, FREE)).toBe(true);
    expect(isSegmentCountAllowed(9, FREE)).toBe(false);
    expect(isSegmentCountAllowed(20, PRO)).toBe(true);
    expect(isSegmentCountAllowed(21, PRO)).toBe(false);
  });
});

it("exposes the Clerk plan slug", () => {
  expect(PRO_PLAN).toBe("pro");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run shared/entitlements.test.ts`
Expected: FAIL — cannot find module `./entitlements`.

- [ ] **Step 3: Implement the module**

Create `shared/entitlements.ts`:

```ts
// Single source of truth for tier capabilities. Pure + dependency-free so both
// the React client and the Express server import the exact same rules. To port
// monetization to another Clerk app, copy this file and adjust the values.

export interface Entitlements {
  /** Max saved wheels (cloud for signed-in, localStorage for anonymous). */
  maxWheels: number;
  /** Max segments allowed when saving/editing a wheel. */
  maxSegments: number;
  /** SVG/PNG export of the wheel. */
  export: boolean;
  /** Generate the OBS browser-source overlay link. */
  obs: boolean;
  /** Full-screen presentation mode. */
  presentation: boolean;
  /** Per-segment custom color picker (vs. preset palettes only). */
  customColors: boolean;
  /** Show the "Made with QuickWheel" watermark (true = shown, free tier). */
  branding: boolean;
}

export const FREE: Entitlements = {
  maxWheels: 3,
  maxSegments: 8,
  export: false,
  obs: false,
  presentation: false,
  customColors: false,
  branding: true,
};

export const PRO: Entitlements = {
  maxWheels: 50,
  maxSegments: 20,
  export: true,
  obs: true,
  presentation: true,
  customColors: true,
  branding: false,
};

/** Clerk Billing plan slug. The ONLY place provider coupling is named. */
export const PRO_PLAN = "pro";

export function entitlementsFor(isPro: boolean): Entitlements {
  return isPro ? PRO : FREE;
}

/** True if a user with `currentCount` saved wheels may create one more. */
export function canSaveWheel(currentCount: number, e: Entitlements): boolean {
  return currentCount < e.maxWheels;
}

/** True if a wheel with `count` segments is allowed for this tier. */
export function isSegmentCountAllowed(count: number, e: Entitlements): boolean {
  return count <= e.maxSegments;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run shared/entitlements.test.ts`
Expected: PASS — all assertions green.

- [ ] **Step 5: Commit**

```bash
git add shared/entitlements.ts shared/entitlements.test.ts
git commit -m "feat: add reusable tier entitlements core"
```

---

## Phase 1 — Server enforcement (hard gates)

### Task 3: Derive `isPro` in the auth middleware

Replace the `verifyToken`-only path with `authenticateRequest`, which exposes both `userId` and `has({ plan })`. Falls back gracefully: if anything is misconfigured, the user is treated as non-pro (never accidentally grants Pro).

**Files:**
- Modify: `server/clerkAuth.ts`

- [ ] **Step 1: Rewrite `server/clerkAuth.ts`**

Replace the entire file contents with:

```ts
import type { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string; isPro: boolean };
  }
}

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

// Created once at module load. authenticateRequest needs both keys.
const clerkClient =
  secretKey && publishableKey
    ? createClerkClient({ secretKey, publishableKey })
    : null;

// Build a Fetch API Request carrying just the Authorization header, which is all
// authenticateRequest needs to validate a Bearer session token.
function toFetchRequest(req: Request): Request {
  const headers = new Headers();
  const auth = req.headers.authorization;
  if (auth) headers.set("authorization", auth);
  return new Request(`http://localhost${req.originalUrl}`, { headers });
}

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!clerkClient) {
    res.status(500).json({ error: "Server auth misconfigured" });
    return;
  }

  try {
    const requestState = await clerkClient.authenticateRequest(
      toFetchRequest(req)
    );
    const auth = requestState.toAuth();

    if (!auth || !auth.userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.auth = { userId: auth.userId, isPro: auth.has({ plan: "pro" }) };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS (no TS errors). If `@clerk/backend` types complain about `has`, confirm `@clerk/backend@^3.5.0` is installed (it is, per package.json).

- [ ] **Step 3: Commit**

```bash
git add server/clerkAuth.ts
git commit -m "feat(server): derive isPro from Clerk plan in auth middleware"
```

> NOTE: This requires `CLERK_PUBLISHABLE_KEY` in the server env (Prerequisites #3/#4). Without it, `requireClerkAuth` returns 500 — that is the intended fail-closed behavior, surfaced when you run the dev server.

---

### Task 4: Tier-aware wheel cap + segment limit on save

Use the entitlements helpers inside the existing transaction. Keep the advisory lock. Replace the hardcoded `MAX_CLOUD_WHEELS` cap with the per-tier cap, and reject oversized segment counts for free users.

**Files:**
- Modify: `server/wheelsRouter.ts`

- [ ] **Step 1: Update imports**

Replace line 4:

```ts
import { wheels, insertWheelSchema, MAX_CLOUD_WHEELS } from "@shared/schema";
```

with:

```ts
import { wheels, insertWheelSchema } from "@shared/schema";
import { entitlementsFor, canSaveWheel, isSegmentCountAllowed } from "@shared/entitlements";
```

- [ ] **Step 2: Enforce tier in POST**

Replace the body of `wheelsRouter.post("/", ...)` (lines 34–66) with:

```ts
wheelsRouter.post("/", async (req, res) => {
  const userId = req.auth!.userId;
  const ent = entitlementsFor(req.auth!.isPro);

  const parsed = insertWheelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid wheel payload", details: parsed.error.flatten() });
  }

  if (!isSegmentCountAllowed(parsed.data.segments.length, ent)) {
    return res.status(422).json({
      error: `Free wheels are limited to ${ent.maxSegments} segments. Upgrade to Pro for up to 20 segments.`,
    });
  }

  // Count and insert inside one transaction guarded by a per-user advisory lock
  // so two concurrent saves can't both pass the cap check.
  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
    const countRows = await tx
      .select({ id: wheels.id })
      .from(wheels)
      .where(eq(wheels.userId, userId));
    if (!canSaveWheel(countRows.length, ent)) {
      return null;
    }
    const [row] = await tx
      .insert(wheels)
      .values({ ...parsed.data, userId })
      .returning();
    return row;
  });

  if (!created) {
    return res.status(409).json({ error: `Wheel limit reached (${ent.maxWheels})` });
  }
  res.status(201).json(created);
});
```

- [ ] **Step 3: Enforce segment limit in PUT**

In `wheelsRouter.put("/:id", ...)`, after the `parsed` success check (after line 75, before the `db.update`), insert:

```ts
  if (parsed.data.segments && !isSegmentCountAllowed(parsed.data.segments.length, entitlementsFor(req.auth!.isPro))) {
    return res.status(422).json({ error: "Segment limit exceeded for your plan." });
  }
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: PASS. (`MAX_CLOUD_WHEELS` is no longer imported here; it remains exported from schema for any other reference — leave it.)

- [ ] **Step 5: Commit**

```bash
git add server/wheelsRouter.ts
git commit -m "feat(server): enforce per-tier wheel cap and segment limit"
```

---

## Phase 2 — Client entitlements hook

### Task 5: `useEntitlements` hook

**Files:**
- Create: `client/src/hooks/useEntitlements.ts`

- [ ] **Step 1: Create the hook**

```ts
import { useMemo } from "react";
import { useAuth } from "@clerk/react";
import { entitlementsFor, PRO_PLAN, type Entitlements } from "@shared/entitlements";

export interface UseEntitlements extends Entitlements {
  isPro: boolean;
  isLoaded: boolean;
}

export function useEntitlements(): UseEntitlements {
  const { isLoaded, has } = useAuth();
  // While Clerk is loading, treat as free (fail-closed: never flash Pro features).
  const isPro = isLoaded && typeof has === "function" ? has({ plan: PRO_PLAN }) : false;
  return useMemo(
    () => ({ ...entitlementsFor(isPro), isPro, isLoaded }),
    [isPro, isLoaded]
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/useEntitlements.ts
git commit -m "feat(client): add useEntitlements hook"
```

---

## Phase 3 — UI gates

### Task 6: Reusable `UpgradeDialog` + Pro lock badge

A small dialog explaining Pro and routing to `/pricing`, plus a tiny lock badge used on gated controls.

**Files:**
- Create: `client/src/components/UpgradeDialog.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

export function UpgradeDialog({ open, onOpenChange, feature }: UpgradeDialogProps) {
  const [, setLocation] = useLocation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Upgrade to Pro
          </AlertDialogTitle>
          <AlertDialogDescription>
            {feature
              ? `${feature} is a Pro feature.`
              : "This is a Pro feature."}{" "}
            Pro unlocks OBS overlays, presentation mode, custom colors, exports,
            no watermark, and up to 50 wheels with 20 segments each.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-upgrade">Not now</AlertDialogCancel>
          <AlertDialogAction onClick={() => setLocation("/pricing")} data-testid="button-go-pricing">
            See Pro plans
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/UpgradeDialog.tsx
git commit -m "feat(client): add UpgradeDialog component"
```

---

### Task 7: Tier-aware segment cap in `useCustomSegments`

Make the add-segment limit follow the viewer's tier instead of the hard `MAX_SEGMENTS`. Loading a shared wheel still bypasses the cap (view & spin allowed).

**Files:**
- Modify: `client/src/hooks/useCustomSegments.ts`

- [ ] **Step 1: Import entitlements**

After line 3 (`import { DEFAULT_SEGMENTS, ... }`), add:

```ts
import { useEntitlements } from "@/hooks/useEntitlements";
```

- [ ] **Step 2: Add `maxSegments` to the return interface**

In `UseCustomSegmentsReturn` (around line 26, after `canAdd: boolean;`), add:

```ts
  maxSegments: number;
```

- [ ] **Step 3: Read the tier cap**

Immediately inside `useCustomSegments()` (right after line 45 `export function useCustomSegments(): UseCustomSegmentsReturn {`), add:

```ts
  const { maxSegments } = useEntitlements();
```

- [ ] **Step 4: Use the cap for add + canAdd**

In `addSegment` (line 146) change:

```ts
    if (segments.length >= MAX_SEGMENTS) return;
```

to:

```ts
    if (segments.length >= maxSegments) return;
```

and update its dependency array on line 155 from `}, [segments]);` to `}, [segments, maxSegments]);`.

Then change `canAdd` (line 262):

```ts
  const canAdd = segments.length < MAX_SEGMENTS;
```

to:

```ts
  const canAdd = segments.length < maxSegments;
```

- [ ] **Step 5: Return `maxSegments`**

In the returned object (after `canAdd,` near line 279), add:

```ts
    maxSegments,
```

- [ ] **Step 6: Typecheck**

Run: `npm run check`
Expected: PASS. (`MAX_SEGMENTS` is still imported and used in the load-from-storage validation — leave that import.)

- [ ] **Step 7: Commit**

```bash
git add client/src/hooks/useCustomSegments.ts
git commit -m "feat(client): tier-aware segment cap in useCustomSegments"
```

---

### Task 8: Gate the panel — segment cap UI, custom colors, OBS

`ProbabilityPanel` gets new props: `maxSegments`, `customColors`, `canUseObs`, and `onUpgrade`. Free users see preset palettes only (the per-segment `ColorPicker` becomes a static swatch that opens the upgrade dialog), the OBS buttons show a lock, and the add-segment button nudges upgrade when capped.

**Files:**
- Modify: `client/src/components/ProbabilityPanel.tsx`

- [ ] **Step 1: Extend props interface**

In `ProbabilityPanelProps` (after `onOBSEmbed: () => void;`, line 37) add:

```ts
  onUpgrade: (feature: string) => void;
  maxSegments: number;
  customColors: boolean;
  canUseObs: boolean;
```

- [ ] **Step 2: Destructure new props**

In the function params (after `onOBSEmbed,`, line 66) add:

```ts
  onUpgrade,
  maxSegments,
  customColors,
  canUseObs,
```

- [ ] **Step 3: Import the lock icon**

On line 16, add `Lock` to the lucide-react import list (append `, Lock` before the closing `}`).

- [ ] **Step 4: Tier segment count display**

Replace line 109:

```tsx
                {segments.length}/{MAX_SEGMENTS} segments
```

with:

```tsx
                {segments.length}/{maxSegments} segments
```

- [ ] **Step 5: Gate the per-segment color control**

Replace the `<ColorPicker .../>` block (lines 221–224) with:

```tsx
              {customColors ? (
                <ColorPicker
                  color={segment.color}
                  onChange={(color) => onRecolor(segment.id, color)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onUpgrade("Custom colors")}
                  className="w-6 h-6 rounded-md border border-white/10 shrink-0 relative"
                  style={{ backgroundColor: segment.color }}
                  aria-label="Custom colors are a Pro feature"
                  data-testid={`button-color-locked-${index}`}
                >
                  <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-amber-400" />
                </button>
              )}
```

- [ ] **Step 6: Gate the add-segment button**

Replace the `onClick={onAdd}` (line 265) with:

```tsx
            onClick={canAdd ? onAdd : () => onUpgrade("More segments")}
```

and remove `disabled={!canAdd}` (line 266) so the button stays clickable to trigger the upgrade nudge. (Free users at 8 segments now get the upgrade dialog instead of a dead button.)

- [ ] **Step 7: Gate the OBS buttons (mobile + desktop)**

Mobile menu item (lines 127–129) — replace with:

```tsx
                  <DropdownMenuItem onClick={canUseObs ? onOBSEmbed : () => onUpgrade("OBS overlay")} data-testid="button-obs-embed">
                    <Monitor className="w-4 h-4 mr-2" />Copy OBS link{!canUseObs && <Lock className="w-3 h-3 ml-auto text-amber-400" />}
                  </DropdownMenuItem>
```

Desktop OBS button (lines 168–175) — replace the `<Button>` `onClick` with:

```tsx
                  <Button variant="ghost" size="icon" onClick={canUseObs ? onOBSEmbed : () => onUpgrade("OBS overlay")} className="text-muted-foreground relative" data-testid="button-obs-embed">
                    <Monitor className="w-4 h-4" />
                    {!canUseObs && <Lock className="w-2.5 h-2.5 absolute top-0 right-0 text-amber-400" />}
                  </Button>
```

- [ ] **Step 8: Typecheck**

Run: `npm run check`
Expected: FAIL — `Home.tsx` does not yet pass the new required props. That is expected; Task 9 wires them. (If you want a green checkpoint, do Step 9 of Task 9 before committing; otherwise commit together.)

- [ ] **Step 9: Commit**

```bash
git add client/src/components/ProbabilityPanel.tsx
git commit -m "feat(client): gate colors, OBS, and segment cap in panel"
```

---

### Task 9: Wire gates in `Home.tsx` (panel props, export, OBS link, branding, upgrade dialog)

**Files:**
- Modify: `client/src/pages/Home.tsx`

- [ ] **Step 1: Imports**

After line 19 (`import { useWheelStorage } ...`) add:

```ts
import { useEntitlements } from "@/hooks/useEntitlements";
import { UpgradeDialog } from "@/components/UpgradeDialog";
```

- [ ] **Step 2: Read entitlements + dialog state**

After line 64 (`const queryClient = useQueryClient();`) add:

```ts
  const ent = useEntitlements();
  const [upgradeFeature, setUpgradeFeature] = useState<string | null>(null);
  const openUpgrade = useCallback((feature: string) => setUpgradeFeature(feature), []);
```

Also pull `maxSegments` from `useCustomSegments()` — add `maxSegments,` to the destructure block (after `canRemove,`, line 50).

- [ ] **Step 3: Gate OBS link generation (append `nb=1`)**

In `handleOBSEmbed` (line 223), make the body return early for free and append the no-branding flag for Pro. Replace the line building `url` (line 233):

```ts
    const url = `${window.location.origin}/app/embed?wheel=${encoded}`;
```

with:

```ts
    const url = `${window.location.origin}/app/embed?wheel=${encoded}&nb=1`;
```

and at the very top of the `handleOBSEmbed` callback body (right after line 223 `const handleOBSEmbed = useCallback(async () => {`), add:

```ts
    if (!ent.obs) { setUpgradeFeature("OBS overlay"); return; }
```

Update the dependency array on line 240 to include `ent.obs`: `}, [getWheelData, currentWheelName, toast, ent.obs]);`.

- [ ] **Step 4: Gate SVG export**

At the top of `handleDownloadSvg` (right after line 242 `const handleDownloadSvg = useCallback(() => {`) add:

```ts
    if (!ent.export) { setUpgradeFeature("SVG export"); return; }
```

Update its dependency array (line 287) to include `ent.export`: `}, [currentWheelName, toast, ent.export]);`.

- [ ] **Step 5: Branding on the live wheel**

Pass branding into `SpinWheel`. In the main `<SpinWheel ... />` render (lines 434–440), add the prop:

```tsx
                  showBranding={ent.branding}
```

(SpinWheel gains this prop in Task 11.)

- [ ] **Step 6: Pass gate props to the panel**

In the `<ProbabilityPanel ... />` props (after `onOBSEmbed={handleOBSEmbed}`, line 522) add:

```tsx
              onUpgrade={openUpgrade}
              maxSegments={maxSegments}
              customColors={ent.customColors}
              canUseObs={ent.obs}
```

- [ ] **Step 7: Gate presentation mode entry from the header**

Pass `isPro` + `onUpgrade` to `WheelHeader`. In the `<WheelHeader ... />` block (lines 381–391), change `onEnterPresentation`:

```tsx
          onEnterPresentation={() => ent.presentation ? setPresentationMode(true) : openUpgrade("Presentation mode")}
```

- [ ] **Step 8: Lock badge on the "Save as SVG" button**

In the Save-as-SVG `<Button>` (lines 459–470), the gate is already handled by Step 4; optionally append a visual hint. Replace the button label content (line 468 `Save as SVG`) with:

```tsx
              {ent.export ? "Save as SVG" : "Save as SVG (Pro)"}
```

- [ ] **Step 9: Render the upgrade dialog**

Before the closing `</div>` of the component (right after `<SaveWheelModal ... />`, line 566), add:

```tsx
      <UpgradeDialog
        open={upgradeFeature !== null}
        onOpenChange={(o) => !o && setUpgradeFeature(null)}
        feature={upgradeFeature ?? undefined}
      />
```

- [ ] **Step 10: Typecheck**

Run: `npm run check`
Expected: PASS (Task 8 + Task 9 props now match). If `WheelHeader` complains, it is updated in Task 10 — do Task 10 before this typecheck passes, or accept a temporary failure and commit after Task 10.

- [ ] **Step 11: Commit**

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(client): wire export/OBS/presentation/branding gates in Home"
```

---

### Task 10: Presentation lock indicator in `WheelHeader`

`onEnterPresentation` is already gated by Home (Task 9 Step 7). This task only adds an optional visual lock so free users see Pro before clicking. Add an `isPro` prop.

**Files:**
- Modify: `client/src/components/WheelHeader.tsx`

- [ ] **Step 1: Add prop to interface**

In `WheelHeaderProps` (after `onEnterPresentation: () => void;`, line 21) add:

```ts
  isPro: boolean;
```

- [ ] **Step 2: Destructure it**

After `onEnterPresentation,` (line 33) add:

```ts
  isPro,
```

- [ ] **Step 3: Import Lock + Sparkles**

On line 11, add `Lock` to the lucide-react import list.

- [ ] **Step 4: Badge on the desktop presentation button**

In the desktop presentation `<Button>` (lines 203–212), add a lock overlay. Change the button to include `className="text-muted-foreground h-8 w-8 relative"` and insert before its closing `</Button>`:

```tsx
                {!isPro && <Lock className="w-2.5 h-2.5 absolute top-0 right-0 text-amber-400" />}
```

- [ ] **Step 5: Badge on the mobile presentation menu item**

In the mobile menu item (lines 100–102), change to:

```tsx
            <DropdownMenuItem onClick={onEnterPresentation}>
              <Monitor className="w-4 h-4 mr-2" />Presentation mode{!isPro && <Lock className="w-3 h-3 ml-auto text-amber-400" />}
            </DropdownMenuItem>
```

- [ ] **Step 6: Pass `isPro` from Home**

In `client/src/pages/Home.tsx`, in the `<WheelHeader ... />` block add:

```tsx
          isPro={ent.isPro}
```

- [ ] **Step 7: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/WheelHeader.tsx client/src/pages/Home.tsx
git commit -m "feat(client): show Pro lock on presentation mode"
```

---

### Task 11: Branding watermark in `SpinWheel` + `Embed`

Add an optional `showBranding` prop that renders a small "Made with QuickWheel" mark inside the wheel SVG (so it also appears in exports). Embed hides it when the URL carries `nb=1` (only Pro can generate such a link).

**Files:**
- Modify: `client/src/components/SpinWheel.tsx`
- Modify: `client/src/pages/Embed.tsx`

- [ ] **Step 1: Add the prop**

In `SpinWheelProps` (after `claimedIds?: string[];`, line 10) add:

```ts
  showBranding?: boolean;
```

and in the destructure (line 118) add `showBranding = false`:

```ts
export function SpinWheel({ segments, rotation, isSpinning, spinDuration, size, claimedIds = [], showBranding = false }: SpinWheelProps) {
```

- [ ] **Step 2: Render the watermark**

Inside the `<svg>` element, just before the closing `</svg>` (right before line 268 `</svg>`), add a non-rotating mark anchored at the bottom of the viewBox. Because the `<svg>` itself is rotated by `rotation`, place the text on a counter element instead — simplest correct approach: render it as the last child but counter-rotate around center:

```tsx
        {showBranding && (
          <text
            x={centerX}
            y={viewBoxSize - 8}
            transform={`rotate(${-rotation}, ${centerX}, ${centerY})`}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="rgba(255,255,255,0.55)"
            className="pointer-events-none select-none"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            data-testid="wheel-branding"
          >
            Made with QuickWheel
          </text>
        )}
```

- [ ] **Step 3: Wire Embed branding**

In `client/src/pages/Embed.tsx`, add a no-branding flag derived from the URL. After the `size` memo (line 56) add:

```ts
  const showBranding = useMemo(() => params.get("nb") !== "1", [params]);
```

Then in the `<SpinWheel ... />` render (lines 159–165) add the prop:

```tsx
          showBranding={showBranding}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/SpinWheel.tsx client/src/pages/Embed.tsx
git commit -m "feat(client): add QuickWheel watermark with Pro/nb removal"
```

> NOTE: The main Home wheel passes `showBranding={ent.branding}` (Task 9 Step 5), so free users see the mark and Pro users don't. Share links opened by a free viewer show the mark (viewer's tier); that's the accepted soft-gate behavior from the spec.

---

## Phase 4 — Pricing page

### Task 12: `/pricing` route with Clerk `<PricingTable />`

**Files:**
- Create: `client/src/pages/Pricing.tsx`
- Modify: `client/src/App.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useLocation } from "wouter";
import { PricingTable } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Pricing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2" data-testid="button-back-home">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-xl font-extrabold tracking-tight text-gradient-brand">QuickWheel Pro</h1>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <p className="text-muted-foreground text-center mb-6">
          Unlock OBS overlays, presentation mode, custom colors, exports, no watermark, and up to 50 wheels.
        </p>
        <PricingTable />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Register the route**

In `client/src/App.tsx`, add the lazy import after line 13:

```ts
const Pricing = lazy(() => import("@/pages/Pricing"));
```

and add the route inside `<Switch>` (after the `/templates` route, line 23):

```tsx
        <Route path="/pricing" component={Pricing} />
```

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: PASS. If `PricingTable` is not exported from `@clerk/react` in v6.7.3, import from `@clerk/react` may need to be `@clerk/clerk-react`; confirm the exact export name in `node_modules/@clerk/react`. (As of Clerk Billing GA, `PricingTable` is exported from the React package.)

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/Pricing.tsx client/src/App.tsx
git commit -m "feat(client): add /pricing page with Clerk PricingTable"
```

---

### Task 13: Upgrade entry point in nav

Add a "Go Pro" button so signed-in free users can reach `/pricing` without hitting a gate first.

**Files:**
- Modify: `client/src/components/WheelHeader.tsx`

- [ ] **Step 1: Add a Pro button (desktop, signed-in free only)**

In the signed-in desktop cluster (inside `<Show when="signed-in">`, around line 229–231), before `<UserButton />` add:

```tsx
            {!isPro && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/pricing")} className="gap-1 text-amber-400" data-testid="button-go-pro">
                <Sparkles className="w-4 h-4" />Go Pro
              </Button>
            )}
```

- [ ] **Step 2: Add the Sparkles import**

On line 11, add `Sparkles` to the lucide-react import list.

- [ ] **Step 3: Add a Pro item to the mobile menu**

In the mobile `<Show when="signed-in">` block (lines 121–128), before the sign-out item add:

```tsx
              {!isPro && (
                <DropdownMenuItem onClick={() => setLocation("/pricing")}>
                  <Sparkles className="w-4 h-4 mr-2 text-amber-400" />Go Pro
                </DropdownMenuItem>
              )}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add client/src/components/WheelHeader.tsx
git commit -m "feat(client): add Go Pro nav entry for free users"
```

---

## Phase 5 — Storage caps + migration messaging

### Task 14: Free local cap → 3 (single source)

**Files:**
- Modify: `client/src/lib/localWheelStorage.ts`

- [ ] **Step 1: Use the entitlements value**

Replace line 2:

```ts
const MAX_WHEELS = 10;
```

with:

```ts
import { FREE } from "@shared/entitlements";
const MAX_WHEELS = FREE.maxWheels; // 3 — anonymous users are always free tier
```

(The existing error messages interpolate `MAX_WHEELS`, so they update automatically.)

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/localWheelStorage.ts
git commit -m "feat(client): cap anonymous local wheels at free-tier limit"
```

---

### Task 15: Tier-aware cap display + over-cap notice in `MyWheels`

**Files:**
- Modify: `client/src/pages/MyWheels.tsx`

- [ ] **Step 1: Import entitlements**

After line 4 (`import { useWheelStorage } ...`) add:

```ts
import { useEntitlements } from "@/hooks/useEntitlements";
import { useLocation as useWouterLocation } from "wouter";
```

(If `useLocation` is already imported from wouter at line 2, skip the second import and reuse `setLocation`.)

- [ ] **Step 2: Read the cap**

After line 35 (`const queryClient = useQueryClient();`) add:

```ts
  const ent = useEntitlements();
  const cap = ent.maxWheels;
  const overCap = wheels.length > cap;
```

(Place `overCap` after `const wheels = wheelsQuery.data ?? [];` if ordering requires — move the two lines to just after line 42.)

- [ ] **Step 3: Tier-aware count display**

Replace lines 167–169:

```tsx
          <span className="text-sm text-muted-foreground">
            {wheelCount}/{storage.isCloud ? 50 : 10} saved
          </span>
```

with:

```tsx
          <span className="text-sm text-muted-foreground">
            {wheelCount}/{cap} saved
          </span>
```

- [ ] **Step 4: Over-cap notice**

In the notice block (after the existing storage `<div>` ending at line 184), add:

```tsx
        {overCap && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                You're over the free limit of {cap}. Your wheels are safe, but you
                can't save new ones until you delete some{ent.isPro ? "." : " or upgrade to Pro."}
              </span>
            </div>
          </div>
        )}
```

- [ ] **Step 5: Typecheck**

Run: `npm run check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add client/src/pages/MyWheels.tsx
git commit -m "feat(client): tier-aware cap display and over-cap notice"
```

---

## Phase 6 — Docs + verification

### Task 16: Update project docs

**Files:**
- Modify: `Z:\QuickWheel\CLAUDE.md`

- [ ] **Step 1: Document tiers + entitlements**

Add a new section to `CLAUDE.md` after the "Storage" line in the Stack section (keep it concise):

```md
## Monetization
- **Tiers:** Free (anon + signed-in) and **Pro** (Clerk Billing plan slug `pro`, monthly + annual).
- **Source of truth:** `shared/entitlements.ts` — `entitlementsFor(isPro)` → caps. Client: `useEntitlements()`; server: `req.auth.isPro` (set in `server/clerkAuth.ts` via `authenticateRequest().has({ plan: 'pro' })`).
- **Hard gates (server):** wheel cap (3/50) + segment count (8/20) in `server/wheelsRouter.ts`.
- **Soft gates (client):** export, OBS link, presentation, custom colors, branding watermark.
- **Branding:** `SpinWheel showBranding`; OBS links from Pro append `nb=1` to hide it in `/embed`.
- **Env:** server now needs `CLERK_PUBLISHABLE_KEY` (for `authenticateRequest`).
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document monetization tiers and entitlements"
```

---

### Task 17: Full verification pass

- [ ] **Step 1: Run all logic tests**

Run: `npm test`
Expected: PASS — entitlements suite green.

- [ ] **Step 2: Typecheck the whole project**

Run: `npm run check`
Expected: PASS — no TS errors.

- [ ] **Step 3: Manual smoke test (dev server)**

Ensure `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are in `.env.local`, then run `npm run dev` and verify in the browser (`/app`):

Signed-out / free:
- [ ] Segment count shows `/8`; adding a 9th segment opens the upgrade dialog.
- [ ] Per-segment color swatches show a lock; clicking opens upgrade. Preset palettes still apply.
- [ ] OBS button shows a lock → upgrade dialog.
- [ ] Presentation mode button shows a lock → upgrade dialog.
- [ ] "Save as SVG (Pro)" → upgrade dialog.
- [ ] Wheel shows "Made with QuickWheel".
- [ ] Saving a 4th wheel is rejected with the cap message.
- [ ] `/pricing` renders the Clerk pricing table.

Pro (use a Clerk test user with the `pro` plan, or Clerk's test billing):
- [ ] Segment count shows `/20`; custom color pickers work.
- [ ] OBS link copies and contains `&nb=1`; opening it in `/embed` shows no watermark.
- [ ] Presentation mode and SVG export work; exported SVG has no watermark.
- [ ] Up to 50 wheels saveable.

- [ ] **Step 4: Final commit (if any doc tweaks)**

```bash
git add -A
git commit -m "chore: monetization verification pass"
```

---

## Notes / known soft-gate limitations (from spec)

- Export, OBS, presentation, custom colors, and branding are client-enforced and bypassable via devtools. Accepted trade-off.
- A free viewer opening a Pro user's share link sees the watermark (branding follows the viewer's tier). OBS links carry `nb=1` so the overlay itself is watermark-free.
- Over-cap legacy users are handled by the server cap-on-POST (block-new-saves); existing wheels remain fully editable/loadable/deletable. No grandfathering.
