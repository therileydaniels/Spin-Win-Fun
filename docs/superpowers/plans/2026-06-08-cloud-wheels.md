# Cloud-Saved Wheels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist wheels in Railway Postgres for signed-in Clerk users while keeping `localStorage` for signed-out users; one-time prompt to import local wheels on first sign-in.

**Architecture:** Add `@clerk/backend` for server-side session-token verification. Express server gains 4 CRUD routes under `/api/wheels`, scoped by Clerk `userId`, persisted via Drizzle into a Railway Postgres `wheels` table (UUID PK, `user_id` indexed). Frontend introduces a single `WheelStorage` interface; `useWheelStorage()` returns cloud or local impl based on `useUser().isSignedIn`. Call sites (`Home.tsx`, `Embed.tsx`, `MyWheels.tsx`) switch from synchronous direct `localWheelStorage` calls to async-via-React-Query (already in deps). Existing localStorage code stays intact for the signed-out path.

**Tech Stack:** TypeScript, Express, `@clerk/backend@latest`, `drizzle-orm` + `pg` (already installed), `@clerk/react@6.7.3`, `@tanstack/react-query` (already installed), Railway Postgres.

**Source spec:** `docs/superpowers/specs/2026-06-08-cloud-wheels-design.md`

**Testing approach:** No unit test framework in this project (`package.json` script `check` = `tsc` only). Per-task verification: `npx tsc --noEmit` for types, `curl` against the running dev server for API routes (with a copy-pasted Clerk token), and explicit Playwright/manual browser checks for end-to-end flows.

---

## Pre-flight

- [ ] **Confirm starting branch state.**

Run: `git branch --show-current` and `git status --short | head -10`

Expected: on `main` with `feat/clerk-auth` merged (or branch off main after merging it). If `feat/clerk-auth` is unmerged, decide with user: branch from `feat/clerk-auth` or merge it first. Create a new branch `feat/cloud-wheels`.

- [ ] **Confirm spec is committed (or accept uncommitted).**

Run: `git status docs/superpowers/specs/2026-06-08-cloud-wheels-design.md`

If untracked, ask user whether to commit before starting Task 1.

- [ ] **Confirm Railway Postgres provisioned.**

Ask the user to:
1. In Railway project → New → Database → Add PostgreSQL.
2. Click the new Postgres service → Variables → copy the `DATABASE_URL` value (looks like `postgresql://postgres:...@...railway.app:.../railway`).
3. Provide that string to you so you can put it in local `.env.local`.

If they haven't done this yet, stop and have them do it before Task 3.

- [ ] **Confirm Clerk Secret Key at hand.**

Ask user to copy the **Secret key** from Clerk dashboard → API Keys (starts with `sk_test_...`). NOT the publishable key — that's a different value already in `.env.local`.

- [ ] **Stop dev server if running.**

Run: `netstat -ano | findstr "LISTENING.*:5000"`. If anything is listed, kill the PID with `powershell.exe -Command "Stop-Process -Id <PID> -Force"`.

---

## Task 1: Rewrite the wheels schema

**Files:**
- Modify: `shared/schema.ts`

**Context:** The existing `wheels` table has `serial` PK and no `user_id` — that was the pre-auth setup. We need UUID PK (matches the frontend's existing string IDs from `crypto.randomUUID()`), a `user_id` text column scoped to Clerk's user IDs (format `user_2abc...`), and an index for the dominant query (list-mine).

- [ ] **Step 1: Replace the `wheels` table and add the cap constant**

Open `Z:\QuickWheel\shared\schema.ts`.

Replace the existing import line:
```ts
import { pgTable, text, varchar, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core";
```
with:
```ts
import { pgTable, text, varchar, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";
```

Replace the `wheels` table definition (currently lines 5-11) and the `insertWheelSchema` (currently lines 13-17) with:

```ts
export type WheelSegment = {
  id: string;
  label: string;
  color: string;
  probability: number;
};

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

export const insertWheelSchema = createInsertSchema(wheels).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
```

At the bottom of the file (just before the closing of the existing constants block) add:
```ts
export const MAX_CLOUD_WHEELS = 50;
```

- [ ] **Step 2: Type check**

Run from repo root: `npx tsc --noEmit`

Expected: exit code 0.

Possible failures:
- "Cannot find module 'drizzle-orm/pg-core' export 'uuid'" → Drizzle version doesn't support `uuid` import. Check `node_modules/drizzle-orm/pg-core/index.d.ts` for available exports. (Should be fine on `drizzle-orm@^0.39.3` already in deps.)
- "Cannot find name 'WheelSegment'" → out-of-order definition; move the `WheelSegment` type above the table.

- [ ] **Step 3: Stop. Do not commit.** (Controller commits after user approval.)

---

## Task 2: Install `@clerk/backend` and configure env vars

**Files:**
- Modify: `package.json` (add `@clerk/backend`)
- Modify: `package-lock.json` (auto)
- Modify: `.env.local` (add `CLERK_SECRET_KEY` and `DATABASE_URL`)
- Modify: `.env.example` (add the two placeholders)

- [ ] **Step 1: Install the backend SDK**

From repo root:
```
npm install @clerk/backend@latest
```

Expected: completes with a single new dependency line in `package.json`. Verify with `grep "@clerk/backend" package.json` — should show the new entry.

- [ ] **Step 2: Add new env vars to `.env.local`**

Read the user-supplied secret key and Railway DATABASE_URL (from pre-flight). Open `Z:\QuickWheel\.env.local` and add (keep the existing `VITE_CLERK_PUBLISHABLE_KEY` line):

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWFnaWNhbC1wb2xsaXdvZy01LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_REPLACE_WITH_USER_PROVIDED_VALUE
DATABASE_URL=postgresql://REPLACE_WITH_USER_PROVIDED_VALUE
```

Do NOT commit `.env.local` — it's gitignored by `.env.*`.

- [ ] **Step 3: Update `.env.example`**

Replace the contents of `Z:\QuickWheel\.env.example` with:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_replace_with_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_replace_with_your_clerk_secret_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

- [ ] **Step 4: Type check**

Run: `npx tsc --noEmit`

Expected: exit code 0 (no code uses the new vars yet, this just confirms install didn't break anything).

- [ ] **Step 5: Stop. Do not commit.**

---

## Task 3: Drizzle client + push schema to Railway

**Files:**
- Create: `server/db.ts`

**Context:** `pg` and `drizzle-orm` are already installed. `npm run db:push` runs `drizzle-kit push` which reads the schema from `shared/schema.ts` and applies changes to whichever DB `DATABASE_URL` points at.

- [ ] **Step 1: Create the Drizzle client**

Create `Z:\QuickWheel\server\db.ts` with:

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool);
```

- [ ] **Step 2: Check `drizzle.config.ts` exists or create it**

Run: `ls Z:/QuickWheel/drizzle.config.ts 2>&1`

If missing, create at repo root:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

If a config already exists, verify it points at `./shared/schema.ts` and uses `postgresql` dialect. If not, update those two fields.

- [ ] **Step 3: Push the schema to Railway Postgres**

Run from repo root (env vars from `.env.local` need to load — use `npx dotenv-cli` if drizzle-kit doesn't pick them up; check first by running):
```
npm run db:push
```

Expected: a prompt or output describing the `wheels` table being created on Railway. Confirm any `y/N` prompts.

If `npm run db:push` fails with `DATABASE_URL is not set`, drizzle-kit isn't reading `.env.local`. Workaround:
```
$env:DATABASE_URL="<railway-url>"; npm run db:push
```
(PowerShell) — set the env var inline for the command.

- [ ] **Step 4: Verify the table exists in Railway**

Ask the user to open Railway → Postgres service → Data tab → confirm `wheels` table appears with columns: `id` (uuid), `user_id` (text), `name` (varchar), `segments` (jsonb), `created_at`, `updated_at`.

Alternatively run from local PowerShell:
```
$env:PGPASSWORD="<pwd from URL>"; psql "<DATABASE_URL>" -c "\d wheels"
```
(requires `psql` installed locally — skip if not).

- [ ] **Step 5: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 6: Stop. Do not commit.**

---

## Task 4: Clerk auth middleware

**Files:**
- Create: `server/clerkAuth.ts`
- Modify: `server/index.ts` or relevant type-augmentation file (add `req.auth` typing)

**Context:** Middleware reads `Authorization: Bearer <token>`, verifies via `@clerk/backend`'s `verifyToken`, and exposes `req.auth.userId` to subsequent handlers.

- [ ] **Step 1: Create the middleware**

Create `Z:\QuickWheel\server\clerkAuth.ts` with:

```ts
import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string };
  }
}

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Server auth misconfigured" });
    return;
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    if (!claims.sub) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    req.auth = { userId: claims.sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

The `declare module` block augments Express's `Request` type so handlers can access `req.auth.userId` without casting.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

If you see "Cannot find module 'express-serve-static-core'", change the `declare module` target to `"express"` instead.

- [ ] **Step 3: Stop. Do not commit.**

---

## Task 5: Wheels API router

**Files:**
- Create: `server/wheelsRouter.ts`
- Modify: `server/routes.ts`

**Context:** Four CRUD routes scoped by `req.auth.userId`. Server-side cap check on POST. 404 (not 403) on resources that exist but belong to another user, so the API doesn't leak existence.

- [ ] **Step 1: Create the router**

Create `Z:\QuickWheel\server\wheelsRouter.ts` with:

```ts
import { Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { wheels, insertWheelSchema, MAX_CLOUD_WHEELS } from "@shared/schema";
import { requireClerkAuth } from "./clerkAuth";

export const wheelsRouter = Router();

wheelsRouter.use(requireClerkAuth);

wheelsRouter.get("/", async (req, res) => {
  const userId = req.auth!.userId;
  const rows = await db
    .select()
    .from(wheels)
    .where(eq(wheels.userId, userId))
    .orderBy(desc(wheels.updatedAt));
  res.json(rows);
});

wheelsRouter.post("/", async (req, res) => {
  const userId = req.auth!.userId;

  const parsed = insertWheelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid wheel payload", details: parsed.error.flatten() });
  }

  const countRows = await db
    .select({ id: wheels.id })
    .from(wheels)
    .where(eq(wheels.userId, userId));
  if (countRows.length >= MAX_CLOUD_WHEELS) {
    return res.status(409).json({ error: `Wheel limit reached (${MAX_CLOUD_WHEELS})` });
  }

  const [created] = await db
    .insert(wheels)
    .values({ ...parsed.data, userId })
    .returning();
  res.status(201).json(created);
});

wheelsRouter.put("/:id", async (req, res) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  const parsed = insertWheelSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid wheel payload" });
  }

  const [updated] = await db
    .update(wheels)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(wheels.id, id), eq(wheels.userId, userId)))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Wheel not found" });
  }
  res.json(updated);
});

wheelsRouter.delete("/:id", async (req, res) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  const [deleted] = await db
    .delete(wheels)
    .where(and(eq(wheels.id, id), eq(wheels.userId, userId)))
    .returning({ id: wheels.id });

  if (!deleted) {
    return res.status(404).json({ error: "Wheel not found" });
  }
  res.status(204).end();
});
```

- [ ] **Step 2: Mount the router in `server/routes.ts`**

Open `Z:\QuickWheel\server\routes.ts`. After the imports at the top, add:

```ts
import { wheelsRouter } from "./wheelsRouter";
```

Inside `registerRoutes`, after the existing `app.post("/api/spin", ...)` line, add:

```ts
  app.use("/api/wheels", wheelsRouter);
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

Common failures:
- "Property 'userId' does not exist on type 'Request'" → middleware augmentation wasn't loaded. Ensure `server/clerkAuth.ts` is imported somewhere that runs at startup (`wheelsRouter.ts` imports it transitively, so this should work).
- Drizzle type errors about `set({ ...parsed.data })` → cast or split the partial update. If you hit this, change the `set(...)` line to `.set({ name: parsed.data.name, segments: parsed.data.segments, updatedAt: new Date() } as any)` and report to controller for follow-up.

- [ ] **Step 4: Smoke-test the API with curl**

Start dev server in background, get a Clerk session token, hit the routes.

Start server:
```
npm run dev
```

In a browser at `http://localhost:5000/app`, sign in. Open devtools → Application → Cookies → find `__session` cookie (Clerk's session cookie). Right-click → Copy value.

In a terminal:
```
$TOKEN="<paste-cookie-value>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/wheels
```
Expected: `[]` (empty list, user has no wheels yet).

Create a wheel:
```
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" `
  -d '{"name":"test","segments":[{"id":"a","label":"A","color":"#ff0000","probability":1},{"id":"b","label":"B","color":"#00ff00","probability":1}]}' `
  http://localhost:5000/api/wheels
```
Expected: 201 with the created wheel including `id` and `userId`.

List again:
```
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/wheels
```
Expected: array with one wheel.

Stop server (Ctrl+C or TaskStop).

If the cookie value doesn't work as a Bearer token, Clerk may need a session JWT instead. Open browser console while signed in and run:
```js
await window.Clerk.session.getToken()
```
Use that value as `$TOKEN`. Update the plan note for future runs if so.

- [ ] **Step 5: Stop. Do not commit.**

---

## Task 6: Cloud storage client

**Files:**
- Create: `client/src/lib/cloudWheelStorage.ts`

**Context:** This module is the frontend's HTTP client to `/api/wheels`. It mirrors the existing `localWheelStorage`'s function signatures but returns Promises. It uses Clerk's `getToken()` to attach the auth header on each call.

- [ ] **Step 1: Create the client**

Create `Z:\QuickWheel\client\src\lib\cloudWheelStorage.ts` with:

```ts
import type { LocalWheel } from "./localWheelStorage";

type GetToken = () => Promise<string | null>;

async function authedFetch(
  getToken: GetToken,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  return fetch(`/api/wheels${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

type CloudWheel = {
  id: string;
  userId: string;
  name: string;
  segments: LocalWheel["segments"];
  createdAt: string;
  updatedAt: string;
};

function toLocalShape(w: CloudWheel): LocalWheel {
  return {
    id: w.id,
    name: w.name,
    segments: w.segments,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

export async function listCloudWheels(getToken: GetToken): Promise<LocalWheel[]> {
  const res = await authedFetch(getToken, "");
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const rows: CloudWheel[] = await res.json();
  return rows.map(toLocalShape);
}

export async function saveCloudWheel(
  getToken: GetToken,
  wheel: { name: string; segments: LocalWheel["segments"] }
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const res = await authedFetch(getToken, "", {
    method: "POST",
    body: JSON.stringify(wheel),
  });
  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? "Wheel limit reached" };
  }
  if (!res.ok) return { success: false, error: `Save failed: ${res.status}` };
  const created: CloudWheel = await res.json();
  return { success: true, wheel: toLocalShape(created) };
}

export async function updateCloudWheel(
  getToken: GetToken,
  id: string,
  data: { name?: string; segments?: LocalWheel["segments"] }
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const res = await authedFetch(getToken, `/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.status === 404) return { success: false, error: "Wheel not found" };
  if (!res.ok) return { success: false, error: `Update failed: ${res.status}` };
  const updated: CloudWheel = await res.json();
  return { success: true, wheel: toLocalShape(updated) };
}

export async function deleteCloudWheel(
  getToken: GetToken,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const res = await authedFetch(getToken, `/${id}`, { method: "DELETE" });
  if (res.status === 404) return { success: false, error: "Wheel not found" };
  if (!res.ok) return { success: false, error: `Delete failed: ${res.status}` };
  return { success: true };
}

export async function duplicateCloudWheel(
  getToken: GetToken,
  id: string
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const list = await listCloudWheels(getToken);
  const source = list.find((w) => w.id === id);
  if (!source) return { success: false, error: "Wheel not found" };
  return saveCloudWheel(getToken, {
    name: `${source.name} (Copy)`,
    segments: source.segments.map((s) => ({ ...s, id: crypto.randomUUID() })),
  });
}
```

The `duplicate` implementation is a list-then-save (no dedicated server route — keeps API surface smaller). Acceptable cost at 50-wheel cap.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Stop. Do not commit.**

---

## Task 7: `useWheelStorage` hook

**Files:**
- Create: `client/src/hooks/useWheelStorage.ts`

**Context:** A single hook that returns a unified storage interface. Internally it dispatches to either the cloud client (signed-in) or wraps the synchronous `localWheelStorage` in Promises (signed-out). Consumers don't branch on backend.

- [ ] **Step 1: Create the hook**

Create `Z:\QuickWheel\client\src\hooks\useWheelStorage.ts` with:

```ts
import { useCallback, useMemo } from "react";
import { useAuth, useUser } from "@clerk/react";
import type { LocalWheel } from "@/lib/localWheelStorage";
import * as local from "@/lib/localWheelStorage";
import * as cloud from "@/lib/cloudWheelStorage";

type WheelInput = { name: string; segments: LocalWheel["segments"] };
type Result<T> = { success: boolean; wheel?: T; error?: string };

export interface WheelStorage {
  isCloud: boolean;
  list: () => Promise<LocalWheel[]>;
  save: (wheel: WheelInput) => Promise<Result<LocalWheel>>;
  update: (id: string, data: Partial<WheelInput>) => Promise<Result<LocalWheel>>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  duplicate: (id: string) => Promise<Result<LocalWheel>>;
}

export function useWheelStorage(): WheelStorage {
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();

  const list = useCallback(async (): Promise<LocalWheel[]> => {
    if (isSignedIn) return cloud.listCloudWheels(getToken);
    return local.getLocalWheels();
  }, [isSignedIn, getToken]);

  const save = useCallback(
    async (wheel: WheelInput) => {
      if (isSignedIn) return cloud.saveCloudWheel(getToken, wheel);
      return local.saveWheelToLocal(wheel);
    },
    [isSignedIn, getToken]
  );

  const update = useCallback(
    async (id: string, data: Partial<WheelInput>) => {
      if (isSignedIn) return cloud.updateCloudWheel(getToken, id, data);
      return local.updateLocalWheel(id, data);
    },
    [isSignedIn, getToken]
  );

  const remove = useCallback(
    async (id: string) => {
      if (isSignedIn) return cloud.deleteCloudWheel(getToken, id);
      return local.deleteLocalWheel(id);
    },
    [isSignedIn, getToken]
  );

  const duplicate = useCallback(
    async (id: string) => {
      if (isSignedIn) return cloud.duplicateCloudWheel(getToken, id);
      return local.duplicateLocalWheel(id);
    },
    [isSignedIn, getToken]
  );

  return useMemo(
    () => ({ isCloud: Boolean(isSignedIn), list, save, update, remove, duplicate }),
    [isSignedIn, list, save, update, remove, duplicate]
  );
}
```

The `remove` (not `delete` — reserved word) name matches the existing localWheelStorage `deleteLocalWheel` shape but avoids the keyword.

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 3: Stop. Do not commit.**

---

## Task 8: Refactor `MyWheels.tsx` to use `useWheelStorage`

**Files:**
- Modify: `client/src/pages/MyWheels.tsx`

**Context:** `MyWheels.tsx` currently calls `localWheelStorage` functions directly and synchronously. It's the highest-traffic consumer; switching it first lets us verify the cloud path end-to-end before touching `Home.tsx` and `Embed.tsx`.

The pattern: replace direct calls with React Query (`useQuery` for list, `useMutation` for save/update/delete/duplicate). React Query is already in deps (`@tanstack/react-query@5.60.5`) and a `QueryClientProvider` already wraps the app (`client/src/App.tsx`).

- [ ] **Step 1: Read the current `MyWheels.tsx`**

Read the full file at `Z:\QuickWheel\client\src\pages\MyWheels.tsx`. Note every call to a `*LocalWheel*` function — those are the refactor targets.

- [ ] **Step 2: Replace direct localStorage calls with React Query**

At the top of `MyWheels.tsx`, replace:
```ts
import { getLocalWheels, deleteLocalWheel, duplicateLocalWheel, updateLocalWheel, type LocalWheel } from "@/lib/localWheelStorage";
```
with:
```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWheelStorage } from "@/hooks/useWheelStorage";
import type { LocalWheel } from "@/lib/localWheelStorage";
```

Inside the component, before the JSX, add:
```ts
const storage = useWheelStorage();
const queryClient = useQueryClient();

const wheelsQuery = useQuery<LocalWheel[]>({
  queryKey: ["wheels", storage.isCloud],
  queryFn: () => storage.list(),
});

const wheels = wheelsQuery.data ?? [];
const isLoading = wheelsQuery.isLoading;

const invalidate = () => queryClient.invalidateQueries({ queryKey: ["wheels", storage.isCloud] });

const deleteMutation = useMutation({
  mutationFn: (id: string) => storage.remove(id),
  onSuccess: invalidate,
});

const duplicateMutation = useMutation({
  mutationFn: (id: string) => storage.duplicate(id),
  onSuccess: invalidate,
});

const renameMutation = useMutation({
  mutationFn: ({ id, name }: { id: string; name: string }) =>
    storage.update(id, { name }),
  onSuccess: invalidate,
});
```

Replace any direct `getLocalWheels()` calls with reads from `wheels`.
Replace `deleteLocalWheel(id)` with `await deleteMutation.mutateAsync(id)`.
Replace `duplicateLocalWheel(id)` with `await duplicateMutation.mutateAsync(id)`.
Replace `updateLocalWheel(id, { name })` with `await renameMutation.mutateAsync({ id, name })`.

If the file has its own local React state for the wheels list, remove it — React Query owns that state now.

Add a loading state to the JSX if not present:
```tsx
if (isLoading) {
  return <div className="p-6 text-muted-foreground">Loading wheels...</div>;
}
```

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Smoke-test in browser**

Start dev server, open `http://localhost:5000/app/my-wheels` SIGNED-OUT first.

Expected:
- Page loads, shows your existing localStorage wheels.
- Delete / rename / duplicate still work.
- No console errors.

Sign in via the header. Navigate back to `/my-wheels`.

Expected:
- Page shows an empty state (or only the test wheel from Task 5 if you didn't delete it).
- Save a new wheel from the main `/app` page (via the existing save UI).
- Navigate back to `/my-wheels` — wheel appears.
- Delete it via UI — disappears.
- Refresh page — still gone.
- No console errors.

Stop server.

- [ ] **Step 5: Stop. Do not commit.**

---

## Task 9: Refactor `Home.tsx` and `Embed.tsx` to use `useWheelStorage`

**Files:**
- Modify: `client/src/pages/Home.tsx`
- Modify: `client/src/pages/Embed.tsx`

**Context:** Same pattern as Task 8 but for the other two consumers of `localWheelStorage`. Use `grep -n "LocalWheel\|getLocalWheels\|saveWheelToLocal\|updateLocalWheel\|deleteLocalWheel\|duplicateLocalWheel\|getLocalWheelById" client/src/pages/Home.tsx client/src/pages/Embed.tsx` to enumerate all call sites first.

- [ ] **Step 1: Audit call sites**

Run:
```
grep -n "localWheelStorage\|LocalWheel\|getLocalWheels\|saveWheelToLocal\|updateLocalWheel\|deleteLocalWheel\|duplicateLocalWheel\|getLocalWheelById" Z:/QuickWheel/client/src/pages/Home.tsx Z:/QuickWheel/client/src/pages/Embed.tsx
```

For each file, list every line that calls one of those functions.

- [ ] **Step 2: Refactor each call site**

For each call site:
- If it's reading the list of wheels → use `useQuery`-style hook (or `useWheelStorage().list()` in an effect)
- If it's a save → call `useWheelStorage().save(...)` and await
- If it's an update / delete / duplicate → same pattern
- Preserve all existing UI behavior (toasts, redirects, etc.) — only swap the data layer

For `getLocalWheelById` — note `useWheelStorage` doesn't expose this. Either:
- (a) Use `storage.list()` then `.find(w => w.id === id)` (simpler), OR
- (b) Add a `getById` method to `useWheelStorage` (cleaner but requires re-touching Task 7)

Choose (a) for this task.

`encodeWheelToUrl` and `decodeWheelFromUrl` are pure functions in `localWheelStorage.ts` — they don't need refactoring. Keep importing them from `@/lib/localWheelStorage` for that purpose only.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Smoke-test**

- `/app` (Home): create + edit + save a wheel both signed-out (localStorage) and signed-in (cloud).
- `/app/embed?wheel=<encoded>` (Embed): URL-share still works. Should be unchanged since it relies on URL decoding, not storage.

- [ ] **Step 5: Stop. Do not commit.**

---

## Task 10: Migration prompt component

**Files:**
- Create: `client/src/components/MigrationPrompt.tsx`
- Modify: `client/src/components/WheelHeader.tsx` (mount the prompt)

**Context:** On the first sign-in transition where the user has local wheels and hasn't seen the prompt before, show a modal offering to import. On success, clear migrated wheels from localStorage. On failure, leave the failed wheels in localStorage so they can retry.

- [ ] **Step 1: Create the component**

Create `Z:\QuickWheel\client\src\components\MigrationPrompt.tsx` with:

```tsx
import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { useWheelStorage } from "@/hooks/useWheelStorage";
import {
  getLocalWheels,
  deleteLocalWheel,
  type LocalWheel,
} from "@/lib/localWheelStorage";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FLAG_KEY = "quickwheel_cloud_migration_done";

export function MigrationPrompt() {
  const { isSignedIn } = useUser();
  const storage = useWheelStorage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [localWheels, setLocalWheels] = useState<LocalWheel[]>([]);

  useEffect(() => {
    if (!isSignedIn) return;
    if (localStorage.getItem(FLAG_KEY) === "true") return;
    const found = getLocalWheels();
    if (found.length === 0) {
      localStorage.setItem(FLAG_KEY, "true");
      return;
    }
    setLocalWheels(found);
    setOpen(true);
  }, [isSignedIn]);

  const handleImport = async () => {
    setImporting(true);
    let imported = 0;
    let failed = 0;
    for (const w of localWheels) {
      const result = await storage.save({ name: w.name, segments: w.segments });
      if (result.success) {
        deleteLocalWheel(w.id);
        imported++;
      } else {
        failed++;
      }
    }
    setImporting(false);
    localStorage.setItem(FLAG_KEY, "true");
    setOpen(false);

    if (failed === 0) {
      toast({ title: `Imported ${imported} wheels to your account.` });
    } else {
      toast({
        title: `Imported ${imported} of ${imported + failed}. ${failed} still saved locally.`,
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    localStorage.setItem(FLAG_KEY, "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import your local wheels?</DialogTitle>
          <DialogDescription>
            You have {localWheels.length} {localWheels.length === 1 ? "wheel" : "wheels"} saved on this device.
            Import them to your account so they sync across devices.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={handleSkip} disabled={importing}>
            Skip
          </Button>
          <Button onClick={handleImport} disabled={importing}>
            {importing ? "Importing..." : `Import ${localWheels.length}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Mount the prompt in `WheelHeader.tsx`**

Open `Z:\QuickWheel\client\src\components\WheelHeader.tsx`. At the top of the imports, add:

```tsx
import { MigrationPrompt } from "@/components/MigrationPrompt";
```

Inside the component's JSX, just before the closing `</header>` tag, add:

```tsx
      <MigrationPrompt />
```

`MigrationPrompt` itself manages its own dialog open/close — the parent just needs to render it once anywhere inside the auth context.

- [ ] **Step 3: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 4: Smoke-test migration**

Set up a starting state:
1. Sign out via the header.
2. Open devtools → Application → Local Storage → manually clear `quickwheel_cloud_migration_done` if present.
3. Save 2-3 local wheels via the UI.
4. Confirm via devtools that `quickwheel_saved_wheels` has entries and `quickwheel_cloud_migration_done` does NOT exist.

Now sign in.

Expected:
- Migration prompt appears showing the wheel count.
- Click "Import N" — prompt closes — toast says "Imported N wheels".
- Navigate to `/my-wheels` — the imported wheels appear.
- Check devtools: `quickwheel_saved_wheels` is now empty (or removed), `quickwheel_cloud_migration_done` is `"true"`.

Sign out, save another local wheel, sign back in.

Expected:
- Prompt does NOT appear (flag is set).
- The new local wheel stays in localStorage (no auto-import after first prompt).

This is intentional: the prompt is a one-time on-this-device event. Document in CLAUDE.md if not already noted.

- [ ] **Step 5: Stop. Do not commit.**

---

## Task 11: Update `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the Stack section**

Locate this block in `Z:\QuickWheel\CLAUDE.md`:

```markdown
## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**
- **Auth:** Clerk (`@clerk/react`) — modal sign-in/sign-up, client-side only, no backend verification
- **Storage:** `localStorage` (not tied to auth — auth and storage are deliberately decoupled)
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`
```

Replace with:

```markdown
## Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS v3, shadcn/ui (Radix), Wouter routing, Framer Motion
- **Backend:** Express (TypeScript via tsx), port **5000**; `@clerk/backend` verifies session tokens; Drizzle ORM over Railway Postgres
- **Auth:** Clerk (`@clerk/react`) — modal sign-in/sign-up; server-side token verification on `/api/wheels` routes
- **Storage:** Railway Postgres for signed-in users (50-wheel cap); `localStorage` for signed-out users. `useWheelStorage()` hook dispatches automatically.
- **PWA:** Vite PWA plugin, manifest + service worker in `public/`
```

- [ ] **Step 2: Add a Data Model addition**

Locate the existing `## Data Model (segment)` section. Below it, add a new section:

```markdown
## Data Model (saved wheel)
Cloud:
```ts
{ id: uuid; userId: clerk-user-id; name: string; segments: WheelSegment[]; createdAt; updatedAt }
```
Indexed on `user_id`. 50-wheel-per-user cap enforced server-side.

Local: same shape minus `userId`, IDs are `crypto.randomUUID()` strings.

`MigrationPrompt` (one-time per device) imports local wheels to cloud on first sign-in.
```

- [ ] **Step 3: Note env vars**

Locate the section discussing env or PWA, add (if no env section exists, append at the bottom under a new `## Environment` header):

```markdown
## Environment
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk frontend key (`pk_test_…` / `pk_live_…`)
- `CLERK_SECRET_KEY` — Clerk backend key for token verification (`sk_test_…` / `sk_live_…`)
- `DATABASE_URL` — Postgres connection string (provided by Railway)
```

- [ ] **Step 4: Stop. Do not commit.**

---

## Task 12: Final verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: exit code 0.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: completes without errors, `dist/` populated. Times under ~4min on this codebase historically.

- [ ] **Step 3: End-to-end smoke against dev server**

Run `npm run dev`. Open `http://localhost:5000/app`.

Walk through:
1. Signed out: save a wheel → appears in MyWheels (localStorage path).
2. Sign in: migration prompt shows → Import → wheels appear in cloud.
3. Open the same URL in an incognito window, sign in: same wheels visible (cross-device sync confirmed).
4. Edit a wheel: persists across refresh.
5. Try to save a 51st wheel: see cap error toast.
6. Delete a wheel: disappears, refresh confirms.
7. Sign out: cloud wheels disappear from MyWheels.
8. Sign back in: wheels return.

Stop the server.

- [ ] **Step 4: Git status sanity check**

Run: `git status --short`

Expected: only intended-modified files (no surprises in `dist/`, `node_modules/`, `.env*`).

- [ ] **Step 5: Report completion**

Summarize:
- All tasks committed (list which were committed).
- API surface added: `GET / POST / PUT / DELETE /api/wheels`.
- Frontend abstraction added: `useWheelStorage()` hook.
- Cap: 50 wheels per signed-in user, 10 wheels in localStorage (existing).
- Migration prompt is one-time per device.
- Out of scope, deliberately: sharing, public templates, real-time sync, undo. Each would be a separate spec.

---

## Notes for the executing engineer

- **Don't auto-commit.** User's global preference. Pause after each task's verification, surface the diff, wait for the OK.
- **`.env.local` is sacred.** Never `git add` it. `CLERK_SECRET_KEY` is a backend secret — different security posture from the publishable key. Don't echo it in commit messages or chat.
- **The orphan-process trap.** `npm run dev` spawns a child `tsx` process. `TaskStop` on the npm parent doesn't always kill the child — leaving port 5000 occupied. On EADDRINUSE, find the listening PID with `netstat -ano | findstr "LISTENING.*:5000"` and `powershell.exe -Command "Stop-Process -Id <PID> -Force"`.
- **React Query keys.** All queries use `["wheels", storage.isCloud]` so signing in/out automatically refetches the right list. If you add new queries, follow the same key pattern.
- **Schema changes.** If you ever change `shared/schema.ts` again, rerun `npm run db:push`. The local schema and the Railway DB must agree.
- **First Railway deploy after this work.** The Railway env needs `CLERK_SECRET_KEY` and (Postgres add-on auto-provides) `DATABASE_URL`. Without `CLERK_SECRET_KEY`, the API returns 500 on every wheel route.
