# Support Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a one-time, friendly "QuickWheel is free — support if you'd like" dialog after a new user's first spin, inviting (not forcing) a Pro upgrade.

**Architecture:** A pure decision function in `shared/` (TDD'd with Vitest, like `entitlements.ts`) decides eligibility. A thin client-side localStorage wrapper persists the one-time flag. A `SupportPrompt.tsx` React component (modeled on `MigrationPrompt.tsx`) renders the shadcn `Dialog`, observes the spin-result signal passed from `Home.tsx`, and opens once after the first spin's `WinnerModal` closes. Pro users never see it.

**Tech Stack:** React 18 + TypeScript, Wouter (`useLocation`), shadcn/ui `Dialog`, Clerk via `useEntitlements()`, Vitest.

## Global Constraints

- Copy is **exact, approved Variant A** — do not reword:
  - Title: `QuickWheel is free — and staying that way`
  - Body: `All the core features are free forever. If you'd like to support the app, you can upgrade to Pro — it helps me cover hosting costs and build more free tools like this one. Either way, thanks for spinning! 🎡`
  - Buttons: `Maybe later` (outline) · `Support QuickWheel` (primary)
- One-time **per device** via `localStorage` key `quickwheel_support_prompt_seen` (string `"true"`).
- **Only the two buttons burn the flag.** Escape / overlay-click closes for the session only and must NOT set the flag (mirrors `MigrationPrompt`).
- **Pro users never see it.** Anonymous + signed-in Free users do.
- "Support QuickWheel" navigates to `/pricing` with Wouter's `useLocation`.
- Branch: `auth-testing`. Pure tests live in `shared/`; client code has no automated tests (manual verification).

---

### Task 1: Pure eligibility logic (`shared/supportPrompt.ts`)

**Files:**
- Create: `shared/supportPrompt.ts`
- Test: `shared/supportPrompt.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `export const SUPPORT_PROMPT_FLAG = "quickwheel_support_prompt_seen"`
  - `export interface SupportPromptState { isLoaded: boolean; isPro: boolean; seen: boolean; spinSettled: boolean }`
  - `export function shouldShowSupportPrompt(s: SupportPromptState): boolean`

- [ ] **Step 1: Write the failing test**

```ts
// shared/supportPrompt.test.ts
import { describe, it, expect } from "vitest";
import { shouldShowSupportPrompt, SUPPORT_PROMPT_FLAG } from "./supportPrompt";

const base = { isLoaded: true, isPro: false, seen: false, spinSettled: true };

describe("shouldShowSupportPrompt", () => {
  it("shows for a loaded, free, unseen user after a spin settles", () => {
    expect(shouldShowSupportPrompt(base)).toBe(true);
  });
  it("hides while Clerk is still loading", () => {
    expect(shouldShowSupportPrompt({ ...base, isLoaded: false })).toBe(false);
  });
  it("hides for Pro users", () => {
    expect(shouldShowSupportPrompt({ ...base, isPro: true })).toBe(false);
  });
  it("hides once already seen", () => {
    expect(shouldShowSupportPrompt({ ...base, seen: true })).toBe(false);
  });
  it("hides before any spin has settled", () => {
    expect(shouldShowSupportPrompt({ ...base, spinSettled: false })).toBe(false);
  });
  it("exposes the localStorage flag key", () => {
    expect(SUPPORT_PROMPT_FLAG).toBe("quickwheel_support_prompt_seen");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run shared/supportPrompt.test.ts`
Expected: FAIL — cannot find module `./supportPrompt`.

- [ ] **Step 3: Write minimal implementation**

```ts
// shared/supportPrompt.ts
// Pure, no deps — portable and Vitest-testable (mirrors entitlements.ts).

export const SUPPORT_PROMPT_FLAG = "quickwheel_support_prompt_seen";

export interface SupportPromptState {
  /** Clerk auth has finished loading. */
  isLoaded: boolean;
  /** User is on the Pro plan. */
  isPro: boolean;
  /** The one-time localStorage flag is already set on this device. */
  seen: boolean;
  /** A first spin has completed and its result modal has closed. */
  spinSettled: boolean;
}

export function shouldShowSupportPrompt(s: SupportPromptState): boolean {
  return s.isLoaded && !s.isPro && !s.seen && s.spinSettled;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run shared/supportPrompt.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Run the full suite to confirm nothing broke**

Run: `npm test`
Expected: PASS (existing entitlements tests + the 6 new ones).

- [ ] **Step 6: Commit**

```bash
git add shared/supportPrompt.ts shared/supportPrompt.test.ts
git commit -m "feat(support-popup): pure eligibility logic + tests"
```

---

### Task 2: localStorage flag wrapper (`client/src/lib/supportPromptStorage.ts`)

**Files:**
- Create: `client/src/lib/supportPromptStorage.ts`

**Interfaces:**
- Consumes: `SUPPORT_PROMPT_FLAG` from `@shared/supportPrompt`.
- Produces:
  - `export function hasSeenSupportPrompt(): boolean`
  - `export function markSupportPromptSeen(): void`

No automated test (client code; matches `localWheelStorage.ts` which is also untested). The
try/catch mirrors `localWheelStorage.ts`'s defensive localStorage access.

- [ ] **Step 1: Write the implementation**

```ts
// client/src/lib/supportPromptStorage.ts
import { SUPPORT_PROMPT_FLAG } from "@shared/supportPrompt";

export function hasSeenSupportPrompt(): boolean {
  try {
    return localStorage.getItem(SUPPORT_PROMPT_FLAG) === "true";
  } catch {
    return false;
  }
}

export function markSupportPromptSeen(): void {
  try {
    localStorage.setItem(SUPPORT_PROMPT_FLAG, "true");
  } catch {
    // private mode / storage disabled — degrade silently
  }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/lib/supportPromptStorage.ts
git commit -m "feat(support-popup): localStorage flag wrapper"
```

---

### Task 3: `SupportPrompt` component (`client/src/components/SupportPrompt.tsx`)

**Files:**
- Create: `client/src/components/SupportPrompt.tsx`

**Interfaces:**
- Consumes: `useEntitlements()` (`@/hooks/useEntitlements`) → `{ isPro, isLoaded }`;
  `shouldShowSupportPrompt` (`@shared/supportPrompt`);
  `hasSeenSupportPrompt`, `markSupportPromptSeen` (`@/lib/supportPromptStorage`);
  shadcn `Dialog` family + `Button`; Wouter `useLocation`.
- Produces: `export function SupportPrompt(props: { spinResultOpen: boolean }): JSX.Element`
  - `spinResultOpen` mirrors `useWheelSpin().showResult` — true while `WinnerModal` is open.

Sequencing: the component opens **after** the first spin's `WinnerModal` closes (true→false
transition of `spinResultOpen`), so the two dialogs never stack. `handledRef` prevents
re-opening later in the same session; the localStorage flag prevents it across sessions.

- [ ] **Step 1: Write the implementation**

```tsx
// client/src/components/SupportPrompt.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useEntitlements } from "@/hooks/useEntitlements";
import { shouldShowSupportPrompt } from "@shared/supportPrompt";
import {
  hasSeenSupportPrompt,
  markSupportPromptSeen,
} from "@/lib/supportPromptStorage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SupportPromptProps {
  /** Mirrors useWheelSpin().showResult — true while the WinnerModal is open. */
  spinResultOpen: boolean;
}

// Small delay after the winner modal closes so the popup doesn't collide with
// the win celebration.
const OPEN_DELAY_MS = 1000;

export function SupportPrompt({ spinResultOpen }: SupportPromptProps) {
  const { isPro, isLoaded } = useEntitlements();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  // True once a spin's result modal has been shown at least once.
  const sawResultRef = useRef(false);
  // True once we've decided to open (don't re-trigger this session).
  const handledRef = useRef(false);

  useEffect(() => {
    if (spinResultOpen) {
      sawResultRef.current = true;
      return;
    }
    // WinnerModal just closed (or was never open).
    if (!sawResultRef.current || handledRef.current) return;

    const seen = hasSeenSupportPrompt();
    if (!shouldShowSupportPrompt({ isLoaded, isPro, seen, spinSettled: true })) {
      // Not eligible yet (e.g. Clerk still loading). The effect re-runs when
      // isLoaded/isPro change, so a late-loading Pro flag is still respected.
      return;
    }
    handledRef.current = true;
    const t = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [spinResultOpen, isLoaded, isPro]);

  const handleLater = () => {
    markSupportPromptSeen();
    setOpen(false);
  };

  const handleSupport = () => {
    markSupportPromptSeen();
    setOpen(false);
    setLocation("/pricing");
  };

  // Escape / overlay-click closes for THIS session only — it must NOT burn the
  // one-time flag. Only the two buttons call markSupportPromptSeen().
  return (
    <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QuickWheel is free — and staying that way</DialogTitle>
          <DialogDescription>
            All the core features are free forever. If you'd like to support the
            app, you can upgrade to Pro — it helps me cover hosting costs and
            build more free tools like this one. Either way, thanks for spinning! 🎡
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleLater}
            data-testid="button-support-later"
          >
            Maybe later
          </Button>
          <Button onClick={handleSupport} data-testid="button-support-pro">
            Support QuickWheel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/SupportPrompt.tsx
git commit -m "feat(support-popup): SupportPrompt dialog component"
```

---

### Task 4: Mount in `Home.tsx` and verify end-to-end

**Files:**
- Modify: `client/src/pages/Home.tsx` (import near line 16–23; render near the `WinnerModal` at ~line 577)

**Interfaces:**
- Consumes: `SupportPrompt` (`@/components/SupportPrompt`); existing `showResult` from `useWheelSpin()`.
- Produces: nothing (integration point).

- [ ] **Step 1: Add the import**

Add alongside the other component imports (e.g. after the `UpgradeDialog` import, ~line 21):

```tsx
import { SupportPrompt } from "@/components/SupportPrompt";
```

- [ ] **Step 2: Render the component**

Immediately after the existing `<WinnerModal ... />` block (~line 577–581), add:

```tsx
      <SupportPrompt spinResultOpen={showResult} />
```

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual verification (dev server)**

Start the dev server (see memory `nas-dev-server-quirks`: clear any orphan on port 5000 first;
Vite uses polling on the Z: drive). Then, in the browser:

1. **Anon, first spin:** with a cleared `quickwheel_support_prompt_seen` key (DevTools →
   Application → Local Storage), spin once. After the winner modal closes, the support popup
   appears (~1s later). ✅
2. **Buttons burn the flag:** click `Maybe later` → popup closes and
   `quickwheel_support_prompt_seen === "true"`. Reload + spin → popup does NOT reappear. ✅
3. **Support routes to pricing:** clear the flag, spin, click `Support QuickWheel` → navigates
   to `/pricing` and the flag is set. ✅
4. **Escape does not burn the flag:** clear the flag, spin, press Escape on the popup → it
   closes but `quickwheel_support_prompt_seen` is still absent; next session it can reappear. ✅
5. **Pro user never sees it:** signed in as a Pro user (or with the plan), spin → no popup. ✅
6. **No double-stacking:** the popup never appears while the `WinnerModal` is still open. ✅

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/Home.tsx
git commit -m "feat(support-popup): mount SupportPrompt after first spin in Home"
```

---

## Self-Review

**Spec coverage:**
- Trigger after first spin, post-win moment → Task 3 effect + Task 4 mount (reads `showResult`). ✅
- Audience anon + Free, Pro never → `shouldShowSupportPrompt` (Task 1) + `useEntitlements` (Task 3). ✅
- One-time per device, only buttons burn flag, Escape defers → Task 2 wrapper + Task 3 handlers/`onOpenChange`. ✅
- Actions: Maybe later closes; Support → `/pricing` → Task 3 handlers. ✅
- Approved Variant A copy verbatim → Task 3 JSX + Global Constraints. ✅
- Separate component (not `UpgradeDialog`) → Task 3 creates `SupportPrompt.tsx`. ✅
- Testing: pure logic in Vitest, component manual → Task 1 tests + Task 4 manual steps. ✅

**Placeholder scan:** No TBD/TODO; all code and commands are concrete. ✅

**Type consistency:** `SupportPromptState`, `shouldShowSupportPrompt`, `SUPPORT_PROMPT_FLAG`,
`hasSeenSupportPrompt`, `markSupportPromptSeen`, and the `spinResultOpen` prop are named
identically across Tasks 1–4. ✅
