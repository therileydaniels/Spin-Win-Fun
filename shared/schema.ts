import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
