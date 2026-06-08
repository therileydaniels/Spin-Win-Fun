# Clerk Auth Integration — Design

**Date:** 2026-06-08
**Status:** Approved, ready for implementation plan
**Supersedes:** `2026-05-01-auth-system-design.md` (Supabase auth, removed 2026-06-08)

## Goal

Re-establish authentication in QuickWheel using Clerk's prebuilt React components. Smallest viable surface: users can sign up, sign in, and sign out. No gated features, no cloud storage rebuild. Auth state is purely client-side and managed entirely by Clerk's provider.

This is deliberately phase 1. Any future work that hangs off identity (cloud-saved wheels, gated features, server-side session verification) is out of scope and will be specced separately.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| SDK | `@clerk/react@latest` | Current Clerk React package (renamed from `@clerk/clerk-react`). |
| Env var | `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local` | Vite default prefix; `.env.local` already gitignored via `.env.*`. |
| Provider location | `client/src/main.tsx`, wrapping `<App />` | Outside Router/QueryClient/Tooltip stack. ClerkProvider is router-agnostic in modal flow. |
| `publishableKey` prop | Passed explicitly: `publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}` | Clerk's quickstart docs claim auto-read, but `@clerk/react@6.7.3` TypeScript types declare the prop as required. Passing the env value explicitly is the standard real-world pattern and is functionally identical to auto-read. |
| Sign-in flow | Modal overlay (`<SignInButton mode="modal">`) | No new routes; matches the prior AuthModal pattern. |
| `afterSignOutUrl` | `/app` | Keep users in the wheel app after sign-out instead of bouncing to landing. |
| Auth-state components | `<Show when="signed-in">` / `<Show when="signed-out">` | Current Clerk API. `<SignedIn>` / `<SignedOut>` are deprecated. |
| Header button styling | Clerk prebuilt, unstyled | Phase 1 ships fast; restyling to match shadcn `<Button>` is a follow-up. |
| Backend changes | None | Express server stays a static host. Token verification is out of scope. |

## File-Level Changes

### New
- `.env.local` at repo root (gitignored via `.env.*`) — contains `VITE_CLERK_PUBLISHABLE_KEY=<pk_test_…>`. Created locally during implementation. Repo root, not `client/`, because `vite.config.ts` sets `envDir` to repo root.

### Modified

**`client/src/main.tsx`** — wrap `<App />` in `<ClerkProvider>` with both `publishableKey` (from env) and `afterSignOutUrl`. Service-worker registration stays as-is, outside the provider.

```tsx
import { ClerkProvider } from "@clerk/react";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    afterSignOutUrl="/app"
  >
    <App />
  </ClerkProvider>
);
```

**`client/src/components/WheelHeader.tsx`** — two insertion points where the old Supabase sign-in lived.

Desktop right-side cluster (currently `SoundToggle + ThemeToggle + InstallPrompt`), prepend:
```tsx
<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

Mobile dropdown menu (currently ends at theme toggle), append `<Show>` blocks wrapping plain `DropdownMenuItem`s. Inside the items, use Clerk's `useClerk()` hook (`openSignIn`, `openSignUp`, `signOut`) and `useUser()` (for the email label) — not Clerk's prebuilt `<SignInButton>` / `<UserButton>` components. Reason: nesting Clerk's button components inside Radix `DropdownMenuItem asChild` is fragile (ref-forwarding mismatch), and `<UserButton>` would render a popover-within-a-popover. The hooks integrate cleanly with Radix while preserving the same modal-open / sign-out behavior as the desktop side.

Imports to add: `Show`, `SignInButton`, `SignUpButton`, `useClerk`, `useUser` from `@clerk/react`. (`UserButton` is used only on desktop.)

**`package.json`** — add `@clerk/react` to `dependencies`. Install via `npm install @clerk/react@latest` and let npm record whatever version resolves at install time.

**`.env.example`** — restore one line: `VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_key`.

**`.env`** — remove the dead `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` entries left over from the prior auth system. Same rationale as removing them from `.env.example` in the prior cleanup — match the file to the code.

**`CLAUDE.md`** — update Stack section to list `Auth: Clerk (\`@clerk/react\`) — modal flow`. Update Core Components to remove `AuthModal.tsx` / `UserMenu.tsx` references (already done in prior cleanup; double-check).

### Deleted
None. Prior cleanup already removed `AuthContext.tsx`, `AuthModal.tsx`, `UserMenu.tsx`, `supabase.ts`, `supabaseWheelStorage.ts`.

## Out of Scope

- Cloud-saved wheels and any backend storage tied to user identity.
- Custom-styled auth forms (Clerk's `<SignIn />` / `<SignUp />` mounted components or custom forms with `useSignIn`).
- Express backend verifying Clerk session tokens (`@clerk/backend`).
- Choice of sign-in providers (Google / GitHub / email-only / magic link) — that's a Clerk dashboard setting, not code.
- Theming Clerk components to match shadcn/Tailwind styles.
- Email/SMS templates customization.

## User-Side Prerequisites (not code)

1. Clerk app created at dashboard.clerk.com (already done — publishable key in hand).
2. Sign-in methods enabled in Clerk dashboard (email/password is on by default; user can add Google etc. later).
3. Application home URL in Clerk dashboard set to local dev origin (`http://localhost:5000/app`) so modal post-auth redirects resolve. Production origin will be added when deploying.

## Verification

Manual smoke test after implementation:
1. `npm run dev`, open `http://localhost:5000/app`.
2. Header shows Clerk's "Sign in" and "Sign up" buttons (desktop) and matching items in the mobile dropdown.
3. Click Sign in → Clerk modal opens → create a test account → modal closes.
4. Header swaps to `<UserButton>` avatar.
5. Click `<UserButton>` → Sign out → land back on `/app` as a logged-out user.
6. Refresh page mid-session → still signed in (Clerk persists session via cookie).
7. `npx tsc --noEmit` passes.

## Risks / Open Questions

- **Service worker + Clerk session.** QuickWheel's SW caches `/app/sw.js`-served assets. Clerk's session cookie is set at the document level and shouldn't be cached by the SW. If users report "stuck signed-out after refresh," investigate SW interception of Clerk's API calls (`clerk.<your-frontend-api>.com`). Not expected to be an issue with a passive cache strategy.
- **Wouter `base="/app"`.** Clerk's modal flow uses `window.location` for redirects, not the router. `afterSignOutUrl="/app"` is therefore a literal URL string, not a Wouter path. Confirmed correct via Clerk docs.
- **Unstyled Clerk buttons.** They will look like default Clerk-themed buttons (not match shadcn). Accepted for phase 1; restyling is a separate task.
