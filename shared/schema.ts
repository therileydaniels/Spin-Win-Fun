import { pgTable, text, varchar, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type WheelSegment = {
  id: string;
  label: string;
  color: string;
  probability: number;
};

// Wheel size limits — shared by the client UI and the server-side API so both
// enforce the same rules. Declared here (above the schemas that reference them)
// to avoid a temporal-dead-zone error at module load.
export const MIN_SEGMENTS = 2;
export const MAX_SEGMENTS = 20;
export const MAX_LABEL_LENGTH = 25;
// SUPERSEDED: the per-user wheel cap is now tier-aware — see `maxWheels` in
// shared/entitlements.ts (FREE 3 / PRO 50). Kept only for backward reference;
// not used for enforcement.
export const MAX_CLOUD_WHEELS = 50;

// Validates a single segment inside a wheel payload. The client already
// enforces these limits in the UI, but the API must enforce them too — a
// signed-in user could otherwise POST an oversized or malformed wheel directly.
export const wheelSegmentSchema = z.object({
  id: z.string(),
  label: z.string().max(MAX_LABEL_LENGTH),
  color: z.string(),
  probability: z.number().finite().nonnegative(),
});

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

export const insertWheelSchema = createInsertSchema(wheels, {
  name: z.string().min(1).max(255),
  segments: z.array(wheelSegmentSchema).min(MIN_SEGMENTS).max(MAX_SEGMENTS),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWheel = z.infer<typeof insertWheelSchema>;
export type Wheel = typeof wheels.$inferSelect;

export const spinRequestSchema = z.object({
  probabilities: z.array(z.number().int().min(0).max(100)).min(2).max(20),
  excludedIndices: z.array(z.number().int().min(0)).optional(),
});

export type SpinRequest = z.infer<typeof spinRequestSchema>;

export const spinResponseSchema = z.object({
  winnerIndex: z.number().int().min(0),
});

export type SpinResponse = z.infer<typeof spinResponseSchema>;

export const customSegmentSchema = z.object({
  id: z.string(),
  label: z.string().max(25),
  color: z.string(),
});

export type CustomSegment = z.infer<typeof customSegmentSchema>;
