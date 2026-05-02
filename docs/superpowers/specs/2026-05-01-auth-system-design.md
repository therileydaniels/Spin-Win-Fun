# Auth System Design
**Date:** 2026-05-01
**Branch:** login-section

## Overview

Add email/password authentication via Supabase Auth so users can save wheels and access them across devices. The wheel works fully without an account — signing in only unlocks save/load functionality (implemented in a follow-on phase).

## Architecture

Pure client-side Supabase Auth. The Express backend is not involved in auth or wheel persistence. A React `AuthContext` wraps the app and provides session state and auth actions to all components.

**New files:**
- `client/src/lib/supabase.ts` — Supabase client singleton (anon key + project URL)
- `client/src/context/AuthContext.tsx` — session state + auth actions (signUp, signIn, signOut)
- `client/src/components/AuthModal.tsx` — sign in / sign up modal
- `client/src/components/UserMenu.tsx` — logged-in user dropdown

**Modified files:**
- `client/src/components/WheelHeader.tsx` — add Sign In button or UserMenu
- `client/src/App.tsx` — wrap app in `AuthProvider`

## Database

One new table in Supabase: `wheels`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `user_id` | `uuid` | FK → `auth.users.id`, cascade delete |
| `name` | `text` | Wheel name |
| `segments` | `jsonb` | Full segments array |
| `created_at` | `timestamptz` | Auto-set |
| `updated_at` | `timestamptz` | Auto-set |

**Row Level Security:** Users can only select, insert, update, and delete rows where `user_id = auth.uid()`.

Supabase Auth manages `auth.users` automatically — no custom users table needed.

## Auth Modal

Single `AuthModal` component using existing `Dialog` and `Tabs` shadcn components.

**Sign In tab:**
- Email field
- Password field
- "Sign In" submit button
- Inline generic error: "Invalid email or password"

**Sign Up tab:**
- Email field
- Password field (min 8 characters)
- "Create Account" submit button
- On success: modal closes, user is immediately logged in (no email verification)
- Inline generic error: "Could not create account"

Both tabs show a loading state on the submit button while the request is in flight. No forgot password flow.

## Header Changes

**Logged out:** "Sign In" button on the right side of the header, between the sound/theme toggles and install prompt.

**Logged in:** "Sign In" button replaced by `UserMenu` — a user icon button that opens a dropdown showing:
- User's email (greyed out, non-clickable)
- Divider
- "Sign Out" option

No other header changes.

## Out of Scope (this phase)

- Forgot password / reset flow
- Email verification
- Google or other OAuth providers
- Wheel save/load UI (follow-on phase — DB table is created here but not wired to UI)
- Admin dashboard
