# Clerk Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the recently-removed Supabase auth UI with Clerk's prebuilt React components — modal sign-in/sign-up plus an avatar UserButton in the header. No backend changes, no cloud storage.

**Architecture:** Single `@clerk/react@latest` SDK. `<ClerkProvider afterSignOutUrl="/app">` wraps `<App />` in `client/src/main.tsx`, outside the existing Router/QueryClient/Tooltip stack (ClerkProvider auto-reads `VITE_CLERK_PUBLISHABLE_KEY` from env, no prop needed). Auth UI lives entirely in `WheelHeader.tsx` using `<Show when="signed-in|signed-out">` to swap between Clerk's `<SignInButton mode="modal">` / `<SignUpButton mode="modal">` and `<UserButton>`.

**Tech Stack:** React 18, TypeScript, Vite 7, `@clerk/react@latest`, Wouter routing (`base="/app"`), shadcn/Radix UI, Tailwind v3.

**Testing approach:** This project has no unit test framework (`package.json` has `"check": "tsc"` only — no vitest/jest). Verification per task is therefore (a) `npx tsc --noEmit` for type safety, and (b) explicit manual browser checks at `http://localhost:5000/app`. Every task lists concrete expected UI behavior.

**Source spec:** `docs/superpowers/specs/2026-06-08-clerk-auth-design.md`

---

## Pre-flight

- [ ] **Confirm the spec is committed (or accept uncommitted state).**

Run: `git status docs/superpowers/specs/2026-06-08-clerk-auth-design.md`

If untracked, ask the user whether to commit the spec now or include it in Task 1's commit. Don't auto-commit per project preference.

- [ ] **Confirm the publishable key is at hand.**

The user previously shared: `pk_test_bWFnaWNhbC1wb2xsaXdvZy01LmNsZXJrLmFjY291bnRzLmRldiQ`. If you can't see it in context, ask before proceeding.

- [ ] **Confirm dev server isn't already running.**

Run: `netstat -ano | findstr :5000` (Windows / PowerShell environment).
Expected: no output, or note the PID so you can stop it before running `npm run dev` later.

---

## Task 1: Install Clerk SDK and set up environment

**Files:**
- Modify: `package.json` (add `@clerk/react` to dependencies)
- Modify: `package-lock.json` (auto-updated by npm)
- Create: `.env.local` at repo root (gitignored)
- Modify: `.env` at repo root (remove stale Supabase entries)
- Modify: `.env.example` at repo root (add Clerk placeholder)

**Why repo root for env files:** `vite.config.ts` sets `envDir: path.resolve(__dirname)` with `__dirname` at repo root, so Vite reads env files from there, not from `client/`.

- [ ] **Step 1: Install the SDK**

Run from repo root:
```
npm install @clerk/react@latest
```

Expected: npm completes without error, `package.json` gains `"@clerk/react": "^<resolved-version>"` under `dependencies`, `package-lock.json` updates.

- [ ] **Step 2: Create `.env.local` with the publishable key**

Create `Z:/QuickWheel/.env.local` containing exactly one line:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWFnaWNhbC1wb2xsaXdvZy01LmNsZXJrLmFjY291bnRzLmRldiQ
```

This file is gitignored via `.env.*` in `.gitignore`. Verify by running `git status .env.local` — expected: no output (ignored).

- [ ] **Step 3: Clean stale Supabase entries from `.env`**

Current content of `Z:/QuickWheel/.env`:
```
VITE_SUPABASE_URL=https://ucdnmipkodqdcwkwlxod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

Replace with: empty file (or delete and recreate empty). Nothing in the codebase reads these vars anymore (removed in the prior cleanup commit).

- [ ] **Step 4: Add Clerk placeholder to `.env.example`**

`Z:/QuickWheel/.env.example` is currently empty (truncated in the prior cleanup). Write exactly:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_clerk_publishable_key
```

- [ ] **Step 5: Verify env files**

Run from repo root:
```
git status .env .env.example .env.local
```

Expected:
- `.env` — modified
- `.env.example` — modified
- `.env.local` — NOT listed (gitignored)

- [ ] **Step 6: Verify TypeScript still compiles**

Run: `npx tsc --noEmit`

Expected: exit code 0, no output. (Clerk types aren't referenced yet, so this just confirms nothing in the install broke the type baseline.)

- [ ] **Step 7: Commit**

Per project preference ("Don't auto-commit to git without asking"), pause and ask the user before committing. If approved:

```bash
git add package.json package-lock.json .env .env.example
git commit -m "$(cat <<'EOF'
chore: install @clerk/react and clean env files

Add @clerk/react SDK ahead of Clerk auth integration.
Remove dead VITE_SUPABASE_* entries from .env (the supporting
code was removed in the prior cleanup commit). Restore .env.example
with a Clerk placeholder.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Do NOT add `.env.local` — it's gitignored intentionally.

---

## Task 2: Wrap App in ClerkProvider

**Files:**
- Modify: `client/src/main.tsx`

Current full content of `client/src/main.tsx`:
```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app/sw.js').catch(() => {});
  });
}
```

- [ ] **Step 1: Edit `client/src/main.tsx`**

Replace the file's content with:
```tsx
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider afterSignOutUrl="/app">
    <App />
  </ClerkProvider>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/app/sw.js').catch(() => {});
  });
}
```

Notes:
- `afterSignOutUrl="/app"` is a literal URL Clerk navigates to via `window.location` after sign-out — not a Wouter path. `/app` keeps users in the wheel app.
- No `publishableKey` prop. Clerk auto-reads `VITE_CLERK_PUBLISHABLE_KEY` from `import.meta.env`.
- Service-worker registration stays outside the provider (it doesn't depend on auth).

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: exit code 0. If you see `Cannot find module '@clerk/react'`, the install in Task 1 didn't take — go back and re-run `npm install @clerk/react@latest`.

- [ ] **Step 3: Start dev server**

Run: `npm run dev`

Expected:
- Server binds to port 5000 with no errors
- Console shows Vite-style HMR ready output
- No Clerk warnings in the terminal

Common failure: if you see `Missing publishable key` from Clerk, `.env.local` either doesn't exist, isn't at repo root, or has a typo in the variable name. Recheck Task 1 Step 2.

- [ ] **Step 4: Manual browser verification**

Open `http://localhost:5000/app` in a browser.

Expected:
- Page renders normally — the spinning wheel is visible
- The header looks exactly the same as before (we haven't added auth UI yet — that's Task 3)
- Browser devtools → Network tab → at least one request to a `clerk.*` host completes with 200 OK (Clerk's client bootstraps even without UI components)
- No red errors in the browser console

If you see a console error like `useClerk must be used within a <ClerkProvider>` — the provider isn't wrapping correctly. Recheck Task 2 Step 1.

- [ ] **Step 5: Stop the dev server**

Ctrl+C in the terminal running `npm run dev`.

- [ ] **Step 6: Commit (ask first)**

Ask the user before committing. If approved:

```bash
git add client/src/main.tsx
git commit -m "$(cat <<'EOF'
feat: wrap app in ClerkProvider

Mount Clerk at the root of the React tree, outside Router and
QueryClient. ClerkProvider auto-reads VITE_CLERK_PUBLISHABLE_KEY
from env. afterSignOutUrl is /app so users stay in the wheel app
after signing out.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Add desktop auth buttons to header

**Files:**
- Modify: `client/src/components/WheelHeader.tsx`

**Context:** The header has a desktop-only icon cluster on the right side. Currently (post-Supabase-removal), it contains `SoundToggle + ThemeToggle + InstallPrompt`. We prepend Clerk's auth buttons inside a `<Show>` wrapper.

Open `client/src/components/WheelHeader.tsx` and locate the block (currently near the end of the JSX, just before the closing `</header>`):

```tsx
        <div className="hidden sm:flex items-center gap-1">
          <SoundToggle isMuted={isMuted} onToggle={onToggleMute} />
          <ThemeToggle />
          <InstallPrompt />
        </div>
```

- [ ] **Step 1: Add Clerk imports**

At the top of the file, after the `lucide-react` import line:

```tsx
import { Menu, Monitor, Settings, FolderOpen, History, Trash2, LayoutGrid, Volume2, VolumeX, Sun, Moon } from "lucide-react";
```

add:
```tsx
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
```

- [ ] **Step 2: Insert auth buttons in the desktop cluster**

Replace the desktop cluster block shown above with:

```tsx
        <div className="hidden sm:flex items-center gap-1">
          <Show when="signed-out">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <SoundToggle isMuted={isMuted} onToggle={onToggleMute} />
          <ThemeToggle />
          <InstallPrompt />
        </div>
```

Notes:
- `mode="modal"` tells Clerk to open the form as an overlay rather than navigating away.
- Clerk's prebuilt buttons render with their default styling — they will not match shadcn `<Button>`. That's intentional for phase 1; restyling is a follow-up.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`

Expected: exit code 0. If you see "Cannot find name 'Show'", you missed the import in Step 1.

- [ ] **Step 4: Start dev server**

Run: `npm run dev`

- [ ] **Step 5: Manual browser verification — signed-out state**

Open `http://localhost:5000/app` in a desktop-width browser window (>= 640px wide so `sm:` breakpoints apply).

Expected:
- Right side of header now shows "Sign in" and "Sign up" buttons (Clerk's default styling — likely flat text or pill-style)
- Sound, theme, and install-prompt icons still appear to the right of them
- Mobile dropdown is unchanged (still has the old structure — that's Task 4)
- No console errors

- [ ] **Step 6: Manual browser verification — sign-in flow**

Click "Sign up". Expected:
- Clerk modal overlays the page
- Modal contains email + password fields (or whichever methods you enabled in the Clerk dashboard)
- Background dims behind the modal

Create a test account (use a real email you control — Clerk may send a verification code in test mode):
- Submit the form
- Complete email verification if prompted
- Modal closes automatically

Expected after sign-up:
- "Sign in" / "Sign up" buttons disappear
- Clerk's `<UserButton>` avatar appears in their place
- Click the avatar — Clerk's user menu opens (with "Manage account", "Sign out", etc.)

- [ ] **Step 7: Manual browser verification — sign-out**

Click the avatar → "Sign out".

Expected:
- Page navigates to `/app` (which is the current page already, so it's effectively a reload)
- Header reverts to "Sign in" / "Sign up" buttons
- No console errors

- [ ] **Step 8: Manual browser verification — session persistence**

Sign in again. Refresh the page (F5).

Expected:
- Still signed in — UserButton avatar shown immediately on load
- No flash of "Sign in / Sign up" buttons before Clerk hydrates (or only a very brief flash — acceptable)

- [ ] **Step 9: Stop dev server**

Ctrl+C.

- [ ] **Step 10: Commit (ask first)**

Ask the user before committing. If approved:

```bash
git add client/src/components/WheelHeader.tsx
git commit -m "$(cat <<'EOF'
feat: add Clerk auth buttons to desktop header

Show SignInButton/SignUpButton (modal mode) when signed out and
UserButton when signed in, in the right-side desktop cluster.
Uses Clerk's prebuilt unstyled components; restyling to match
shadcn is a follow-up.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add mobile dropdown auth items

**Files:**
- Modify: `client/src/components/WheelHeader.tsx`

**Context:** The mobile (`sm:hidden`) dropdown menu currently ends with the theme toggle item. We append a separator and `<Show>` blocks. Inside the Show blocks we use Clerk's **hooks** (`useClerk`, `useUser`) to drive plain `DropdownMenuItem`s — not Clerk's prebuilt button components. Reason: nesting `<SignInButton>` or `<UserButton>` inside `<DropdownMenuItem asChild>` is fragile (Radix `asChild` expects ref-forwarding that Clerk's components don't reliably provide, and `<UserButton>` would create a menu-within-a-menu UX).

`<Show when="signed-in|signed-out">` still gates rendering based on auth state — only the items inside change.

Locate the end of the `<DropdownMenuContent>` block in `WheelHeader.tsx`. Currently it ends like this (after the prior Supabase removal):

```tsx
            <DropdownMenuItem onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {isDark ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
```

- [ ] **Step 1: Add Clerk hooks and `LogIn` / `LogOut` icons to imports**

Update the `@clerk/react` import (added in Task 3) to also pull in the hooks:
```tsx
import { Show, SignInButton, SignUpButton, UserButton, useClerk, useUser } from "@clerk/react";
```

Update the `lucide-react` import to add the `LogIn` and `LogOut` icons (previously removed in the Supabase cleanup):
```tsx
import { Menu, Monitor, Settings, FolderOpen, History, Trash2, LayoutGrid, Volume2, VolumeX, Sun, Moon, LogIn, LogOut } from "lucide-react";
```

Ensure `DropdownMenuLabel` is in the `@/components/ui/dropdown-menu` import (it was removed in the Supabase cleanup):
```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
```

- [ ] **Step 2: Pull Clerk state into the component**

Just below the existing `const [, setLocation] = useLocation();` line in `WheelHeader`, add:
```tsx
  const { openSignIn, openSignUp, signOut } = useClerk();
  const { user } = useUser();
```

`useClerk` returns the Clerk singleton (always present once `<ClerkProvider>` is mounted). `useUser` returns the current user (`null` when signed out).

- [ ] **Step 3: Append auth items to the mobile dropdown**

Replace the end-of-dropdown block shown above with:

```tsx
            <DropdownMenuItem onClick={toggleTheme}>
              {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {isDark ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Show when="signed-out">
              <DropdownMenuItem onClick={() => openSignIn()}>
                <LogIn className="w-4 h-4 mr-2" />Sign in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openSignUp()}>
                <LogIn className="w-4 h-4 mr-2" />Sign up
              </DropdownMenuItem>
            </Show>
            <Show when="signed-in">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? "Signed in"}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/app" })}>
                <LogOut className="w-4 h-4 mr-2" />Sign out
              </DropdownMenuItem>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>
```

Notes:
- `openSignIn()` / `openSignUp()` open Clerk's modal — same UX as the desktop `<SignInButton mode="modal">` from Task 3.
- `signOut({ redirectUrl: "/app" })` is the explicit per-call equivalent of the `afterSignOutUrl` prop on ClerkProvider — both go to `/app`, which is fine; the per-call value wins if they differ.
- The signed-in label shows the user's email, falling back to username, falling back to "Signed in" so the label is never empty.
- `<UserButton>` is intentionally not used in the mobile dropdown — its built-in popover would render a menu inside our dropdown, which is awkward UX. The dropdown items above give the user the two actions they actually need (see who they are, sign out).

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 3: Start dev server and switch to mobile viewport**

Run: `npm run dev`

Open `http://localhost:5000/app`. Open browser devtools → toggle device toolbar (Ctrl+Shift+M in Chrome) → pick a viewport narrower than 640px (e.g., iPhone SE).

Expected:
- The desktop cluster is hidden
- A hamburger / Menu icon button is visible
- Tapping it opens a dropdown

- [ ] **Step 4: Manual browser verification — signed-out mobile**

Sign out first if you're signed in from Task 3 (use the desktop view, then switch back to mobile).

Open the mobile dropdown.

Expected:
- All existing items appear (My Wheels, Templates, History, Remove winner, Presentation mode, Sound, Theme)
- Below the theme item, a separator, then "Sign in" and "Sign up" items
- Tapping "Sign in" closes the dropdown AND opens Clerk's modal

- [ ] **Step 5: Manual browser verification — signed-in mobile**

Sign in via the modal.

Open the mobile dropdown again.

Expected:
- "Sign in" / "Sign up" items are gone
- A muted/grayed label shows the user's email (or username if email is hidden)
- Below it, a single "Sign out" item with a logout icon
- Tapping "Sign out" closes the dropdown, signs the user out, and navigates to `/app`
- Reopening the dropdown after sign-out shows the "Sign in" / "Sign up" items again

- [ ] **Step 6: Stop dev server**

Ctrl+C.

- [ ] **Step 7: Commit (ask first)**

Ask the user before committing. If approved:

```bash
git add client/src/components/WheelHeader.tsx
git commit -m "$(cat <<'EOF'
feat: add Clerk auth items to mobile header dropdown

Mirror the desktop auth UI in the mobile More menu. Uses Clerk's
useClerk/useUser hooks rather than nested SignInButton/UserButton
components, which integrates cleanly with Radix DropdownMenuItem
and avoids menu-within-a-menu UX. <Show> still gates the
signed-in vs signed-out rendering.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` at repo root

**Context:** The project CLAUDE.md was partially updated during the Supabase removal but doesn't yet mention Clerk. Update Stack to list Clerk; the Core Components section no longer needs auth entries (already removed).

- [ ] **Step 1: Update the Stack section**

Locate this block in `Z:/QuickWheel/CLAUDE.md`:
```markdown
## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**
- **Storage:** `localStorage` (auth/login system is being redone)
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`
```

Replace with:
```markdown
## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**
- **Auth:** Clerk (`@clerk/react`) — modal sign-in/sign-up, client-side only, no backend verification
- **Storage:** `localStorage` (not tied to auth — auth and storage are deliberately decoupled)
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`
```

- [ ] **Step 2: Verify no other stale auth references remain**

Run: `grep -n -i "supabase\|authcontext\|authmodal\|usermenu.tsx" Z:/QuickWheel/CLAUDE.md`

Expected: no matches. If there are any, remove them.

- [ ] **Step 3: Commit (ask first)**

Ask the user before committing. If approved:

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: note Clerk auth in CLAUDE.md stack

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Final end-to-end verification

**No file changes — just verify the integrated result.**

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`

Expected: exit code 0, no output.

- [ ] **Step 2: Production build**

Run: `npm run build`

Expected:
- Build completes without errors
- No Clerk-related warnings about missing env vars (the build uses `.env.local` too)
- `dist/` directory contains built assets

If the build fails with "Missing publishable key", check that `.env.local` is at repo root and contains `VITE_CLERK_PUBLISHABLE_KEY=pk_test_...`.

- [ ] **Step 3: Run the production server briefly**

Run: `npm start`

Open `http://localhost:5000/app`.

Expected:
- App loads from the built bundle (not Vite dev server)
- Header shows "Sign in" / "Sign up" buttons (assuming signed-out state)
- Signing in via the modal works end-to-end
- After sign-in, the UserButton avatar appears
- Sign-out returns you to `/app` as a logged-out user

Stop the server with Ctrl+C.

- [ ] **Step 4: Confirm git status is clean**

Run: `git status`

Expected: only untracked files like `dist/`, `node_modules/`, `.env.local` should appear (all already gitignored or build outputs). No tracked-file modifications.

- [ ] **Step 5: Report completion**

Summarize to the user:
- All 5 implementation tasks committed (or list which were committed if any were skipped)
- Verified end-to-end sign-in / sign-out flow
- Clerk dashboard URL: `https://dashboard.clerk.com/`
- Reminder of what's intentionally out of scope: cloud-saved wheels, backend token verification, custom-styled auth forms — each would be a separate spec.

---

## Notes for the executing engineer

- **Don't auto-commit.** The user's global preference is to approve commits explicitly. Each task ends with a commit step that says "ask first". Honor that — paste the proposed message, wait for go.
- **`.env.local` is sacred.** Never `git add` it. Never paste the key into chat transcripts or commit messages. The file is gitignored by pattern, but a careless `git add -A` could still trip you up — always add specific files.
- **Clerk modal vs the wheel SVG z-index.** If the Clerk modal renders behind the spinning wheel or any other element, that's a Tailwind z-index conflict — Clerk's modal uses a high z-index by default (around 1000+). The spinning wheel and existing overlays in this app don't use high z-indexes, so this should be fine, but flag it if you see it.
- **Service worker caching.** If sign-in works in incognito but not in your normal browser session, the SW (`/app/sw.js`) may be caching old assets. Hard-reload (Ctrl+Shift+R) or unregister the SW from devtools to confirm.
- **Manual verification is the test suite.** No vitest/jest here. Follow the browser-check steps literally — they're the closest thing to a test plan.
