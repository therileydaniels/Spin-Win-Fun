import { Router } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import { wheels, insertWheelSchema } from "@shared/schema";
import { entitlementsFor, canSaveWheel, isSegmentCountAllowed } from "@shared/entitlements";
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

wheelsRouter.get("/:id", async (req, res) => {
  const userId = req.auth!.userId;
  const { id } = req.params;
  const [row] = await db
    .select()
    .from(wheels)
    .where(and(eq(wheels.id, id), eq(wheels.userId, userId)));
  if (!row) {
    return res.status(404).json({ error: "Wheel not found" });
  }
  res.json(row);
});

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

wheelsRouter.put("/:id", async (req, res) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  const parsed = insertWheelSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid wheel payload" });
  }

  if (parsed.data.segments && !isSegmentCountAllowed(parsed.data.segments.length, entitlementsFor(req.auth!.isPro))) {
    return res.status(422).json({ error: "Segment limit exceeded for your plan." });
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
