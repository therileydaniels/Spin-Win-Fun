# Cloud-Saved Wheels (Railway Postgres + Clerk) — Design

**Date:** 2026-06-08
**Status:** Approved, ready for implementation plan
**Builds on:** `2026-06-08-clerk-auth-design.md` (Clerk auth, merged on `feat/clerk-auth` branch)

## Goal

When a user is signed in via Clerk, their wheels live in Railway Postgres and are available across devices. When signed out, wheels remain in `localStorage` exactly as today. On first sign-in, the user is offered a one-time prompt to import any existing localStorage wheels into their account.

This deliberately rebuilds the cloud-storage half of what was removed when Supabase came out — but on Railway-only infrastructure, gated by Clerk session tokens.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Database | Railway Postgres | Stays on Railway (user's consolidation goal). `pg` and `drizzle-orm` already in deps. |
| ORM | Drizzle (already installed) | `drizzle-orm`, `drizzle-kit`, `drizzle-zod`, `pg` already in `package.json`. `shared/schema.ts` already exists. |
| Backend SDK | `@clerk/backend@latest` | Verifies Clerk session tokens on Express. Different package from the frontend `@clerk/react`. |
| Auth middleware | Custom Express middleware reading the `Authorization: Bearer <token>` header, verifying via Clerk's `verifyToken` | Lowest moving parts. No global Clerk app proxy or framework adapter. |
| Wheel ID type | UUID (changed from current `serial`) | Frontend already treats wheel IDs as opaque strings (localStorage uses `crypto.randomUUID()`). Uniform type avoids casting and doesn't reveal user count. |
| Per-user wheel cap | 50 | Generous for normal use, low enough to bound DB growth per user. Stored as `MAX_CLOUD_WHEELS` constant in `shared/schema.ts` (alongside existing limits like `MAX_SEGMENTS`) — easy to raise. |
| Localstorage migration | Import + clear local | On first sign-in with local wheels present, prompt user once; on Import, copy to cloud and clear localStorage so there's one source of truth. |
| Migration "seen" flag | `quickwheel_cloud_migration_done` in localStorage, per-device | Per-device is correct: another device's wheels need their own prompt. |
| Frontend abstraction | New `useWheelStorage` hook returning the same shape regardless of backend | Components (`MyWheels`, save flows) stay unchanged — they call hook methods, not a specific backend. |
| Migration tool | Drizzle `db:push` (already scripted) | Simplest for early-stage app. Switch to versioned migrations later if needed. |
| Cloud sync model | Plain CRUD; no offline cache, no optimistic updates | YAGNI. Add later if users complain. |
| Public sharing | Out of scope — existing URL-share covers it | Don't bundle. |

## Schema

Replace the current `wheels` table in `shared/schema.ts`:

```ts
export const wheels = pgTable(
  "wheels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    segments: jsonb("segments").$type<WheelSegment[]>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("wheels_user_id_idx").on(table.userId),
  })
);

export type WheelSegment = {
  id: string;
  label: string;
  color: string;
  probability: number;
};
```

`userId` is the Clerk user ID (e.g. `user_2abc...`). `WheelSegment` is shared between client and server. The index on `userId` makes the most common query (list-mine) a single index lookup.

`insertWheelSchema` continues to use `drizzle-zod` to derive a Zod validator the API will use.

## Backend

### Files
- New: `server/db.ts` — Drizzle client (Postgres connection)
- New: `server/clerkAuth.ts` — Express middleware that verifies the Clerk session token
- New: `server/wheelsRouter.ts` — the four routes below
- Modify: `server/routes.ts` — mount `wheelsRouter` at `/api/wheels`
- Modify: `server/index.ts` — only if Express body-parser limits need raising (current 1MB default is plenty)

### Drizzle client
```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);
```

### Clerk middleware
```ts
import { verifyToken } from "@clerk/backend";

export async function requireClerkAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    req.auth = { userId: claims.sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

`claims.sub` is the Clerk user ID. Token cache management is left to Clerk's defaults.

### Routes
All routes scope by `req.auth.userId` so users only see their own data.

| Method | Path | Body | Returns |
|---|---|---|---|
| `GET` | `/api/wheels` | — | `Wheel[]` (current user's wheels, ordered by `updatedAt` DESC) |
| `POST` | `/api/wheels` | `{ name, segments }` | created `Wheel` |
| `PUT` | `/api/wheels/:id` | `{ name?, segments? }` | updated `Wheel` |
| `DELETE` | `/api/wheels/:id` | — | `204 No Content` |

Validation: `POST` and `PUT` bodies are parsed through `insertWheelSchema` (Zod). `segments` are validated client-side already; revalidate server-side as a defence-in-depth.

`POST` enforces the 50-wheel cap by counting existing rows for the user before insert. Over-cap returns `409 Conflict` with `{ error: "Wheel limit reached (50)" }`.

`PUT` and `DELETE` 404 if the wheel doesn't exist OR belongs to another user (same response either way so the API doesn't leak existence).

## Frontend

### Files
- New: `client/src/lib/cloudWheelStorage.ts` — mirrors `localWheelStorage.ts`'s interface, calls the API with the Clerk session token attached
- New: `client/src/hooks/useWheelStorage.ts` — picks cloud vs. local based on `useUser()` and exposes a unified interface
- New: `client/src/components/MigrationPrompt.tsx` — one-time modal offering import on first sign-in with local wheels
- Modify: `client/src/pages/MyWheels.tsx` — use `useWheelStorage` instead of calling `localWheelStorage` directly
- Modify: any other call sites of `localWheelStorage` (likely `useCustomSegments` and the save modal)
- Modify: `client/src/components/WheelHeader.tsx` — mount `<MigrationPrompt />` once at the header so it can show after sign-in

### Unified storage interface
```ts
interface WheelStorage {
  list(): Promise<LocalWheel[]>;
  save(wheel: { name: string; segments: WheelSegment[] }): Promise<Result<LocalWheel>>;
  update(id: string, data: { name?: string; segments?: WheelSegment[] }): Promise<Result<LocalWheel>>;
  delete(id: string): Promise<Result<void>>;
  duplicate(id: string): Promise<Result<LocalWheel>>;
}
```

Both local and cloud implement this. `useWheelStorage()` returns whichever is appropriate.

The `LocalWheel` type stays as today — cloud wheels expose the same shape, so consumers don't branch on backend.

Local implementations stay synchronous internally but the unified interface is async to match cloud. The slight overhead is invisible.

### Auth token for fetch calls
Cloud storage calls `useAuth().getToken()` from Clerk before each request, attaches as `Authorization: Bearer <token>`. Tokens are short-lived; Clerk handles refresh.

### Migration prompt
- On sign-in (detect via `useUser().isSignedIn` transitioning from `false` to `true`):
  - If `localStorage.getItem("quickwheel_cloud_migration_done") === "true"` → do nothing
  - Else if `getLocalWheels().length === 0` → set flag to `"true"`, do nothing
  - Else → show `<MigrationPrompt count={N} />`
- The prompt:
  - **Import**: POST each local wheel to `/api/wheels` (one at a time). Track success/failure counts. After all attempts, if any succeeded: remove the successfully-imported wheels from localStorage and set the flag. If any failed: leave failures in localStorage so the user can retry; show a toast like "Imported X of N wheels. Y failed — they remain saved locally."
  - **Skip**: set flag, dismiss. Local wheels remain in localStorage.
- A user who signs in on a second device with different local wheels will see the prompt again on that device — correct behaviour.

## Out of Scope

- Real-time sync across browser tabs (a wheel saved on tab A won't appear on tab B without a refresh)
- Optimistic UI updates (saves go through the network round-trip)
- Sharing wheels with other users (existing URL-share already covers it)
- Public wheel templates from other users
- Wheel history / undo / soft delete
- Importing wheels from a JSON file
- Versioned database migrations (using `db:push` for now)
- Rate limiting (Express middleware can be added later; not load-bearing at 100 users)
- Backups (Railway Postgres handles snapshots; user can export to JSON later if needed)
- Bumping the wheel cap above 50 (single constant change later)

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Railway | Postgres connection string (Railway sets this when you add Postgres to the project) |
| `CLERK_SECRET_KEY` | Railway + local `.env.local` | Backend Clerk SDK uses this to verify tokens. Distinct from the frontend `pk_test_…` / `pk_live_…`. Starts with `sk_test_…` or `sk_live_…`. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Already set | No change. |

Locally, `DATABASE_URL` can point to a Postgres docker container, a local install, or the Railway dev branch's connection string for quick iteration.

## User-Side Prerequisites

1. **Railway Postgres add-on** — in the Railway project: New → Database → Add PostgreSQL. Railway injects `DATABASE_URL` into the service automatically.
2. **Clerk Secret Key** — in Clerk dashboard → API Keys → copy the **Secret key** (starts with `sk_test_`). Add to Railway env vars (and to local `.env.local` for development).
3. **Run schema push** — `npm run db:push` against Railway Postgres once, to create the `wheels` table. Or run it locally pointed at the Railway URL.

## Verification

Manual smoke test after implementation:
1. Sign out → save a wheel → it appears in MyWheels (localStorage path works)
2. Sign in → migration prompt appears showing the wheel count → Import → all wheels appear in MyWheels → localStorage is cleared
3. Edit a wheel → reload the page → edit persists
4. Open the app on a second browser, sign in with the same account → same wheels appear
5. Try to save a 51st wheel → see the cap error toast
6. Sign out → the migrated wheels disappear from MyWheels (cloud is gated by auth)
7. Sign back in → wheels return
8. `npx tsc --noEmit` passes
9. `npm run build` succeeds

## Risks / Open Questions

- **Clerk session token expiry during slow page sessions.** `getToken()` returns a token valid for ~60s by default; Clerk refreshes transparently. If `getToken()` ever returns `null`, the fetch wrapper should redirect to sign-in. Not expected to bite at the access patterns this app has.
- **DB connection pool exhaustion.** `pg` defaults to 10 connections per pool. Express handles each request on one connection. At 100 users this is far from the limit. If Railway's Postgres tier has a connection ceiling lower than 10, set `max` on the pool accordingly.
- **Cold start latency.** Railway's free / hobby tier has cold-start; the first request after idle may take 2-5s. Affects user perception more than function.
- **Drizzle `db:push` vs. migrations.** `db:push` is fine for solo dev. Once two people contribute schema changes, switch to versioned migrations via `drizzle-kit generate`. Out of scope for this spec.
