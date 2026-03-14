import { pgTable, text, varchar, timestamp, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wheels = pgTable("wheels", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  segments: jsonb("segments").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWheelSchema = createInsertSchema(wheels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWheel = z.infer<typeof insertWheelSchema>;
export type Wheel = typeof wheels.$inferSelect;

export const spinRequestSchema = z.object({
  probabilities: z.array(z.number().int().min(0).max(100)).min(2).max(20),
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

export const MIN_SEGMENTS = 2;
export const MAX_SEGMENTS = 20;
export const MAX_LABEL_LENGTH = 25;
