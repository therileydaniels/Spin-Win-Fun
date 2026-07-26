import { z } from "zod";

// Field names follow the Weighted Probability Pattern
// (Z:\0000 Documents\App Docs\WEIGHTED_PROBABILITY_PATTERN.md) — QuickWheel
// uses weighted mode only (no exact-pick) over independent items (wheel
// segments), so the fair default is always flat 100/n.
export type WheelSegment = {
  id: string;
  label: string;
  color: string;
  weight: number;
};

// Migrates a persisted segment that may still carry the legacy `probability`
// field (pre weighted-probability-pattern) to the current `weight` field.
// Safe to call on already-migrated segments — it's a no-op there.
export function migrateSegment(seg: {
  id: string;
  label: string;
  color: string;
  weight?: number;
  probability?: number;
}): WheelSegment {
  return {
    id: seg.id,
    label: seg.label,
    color: seg.color,
    weight:
      typeof seg.weight === "number"
        ? seg.weight
        : typeof seg.probability === "number"
          ? seg.probability
          : 0,
  };
}

// Wheel size limits — shared by the client UI and the server-side API so both
// enforce the same rules. Declared here (above the schemas that reference them)
// to avoid a temporal-dead-zone error at module load.
export const MIN_SEGMENTS = 2;
export const MAX_SEGMENTS = 20;
export const MAX_LABEL_LENGTH = 25;

// Validates a single segment inside a wheel payload. The client already
// enforces these limits in the UI, but the API must enforce them too — a
// signed-in user could otherwise POST an oversized or malformed wheel directly.
export const wheelSegmentSchema = z.object({
  id: z.string(),
  label: z.string().max(MAX_LABEL_LENGTH),
  color: z.string(),
  weight: z.number().finite().nonnegative(),
});

export const spinRequestSchema = z.object({
  weights: z.array(z.number().finite().min(0).max(100)).min(2).max(20),
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
