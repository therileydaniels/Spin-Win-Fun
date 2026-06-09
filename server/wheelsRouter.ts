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
    .values({ ...parsed.data, userId } as any)
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
    .set({ ...parsed.data, updatedAt: new Date() } as any)
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
