import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { spinRequestSchema } from "@shared/schema";

const spinLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 spins per minute (generous but prevents abuse)
  message: { error: "Too many spins, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

function selectWeightedIndex(weights: number[], excludedIndices: number[] = []): number {
  const available = weights
    .map((w, i) => ({ w, i }))
    .filter(({ i }) => !excludedIndices.includes(i));

  if (available.length === 0) return 0;

  const total = available.reduce((sum, { w }) => sum + w, 0);

  if (total === 0) {
    return available[Math.floor(Math.random() * available.length)].i;
  }

  const random = Math.random() * total;
  let cumulative = 0;
  for (const { w, i } of available) {
    cumulative += w;
    if (random < cumulative) return i;
  }

  return available[available.length - 1].i;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/spin", spinLimiter, (req, res) => {
    const parsed = spinRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      console.error("Rejected /api/spin request: schema validation failed", parsed.error.flatten());
      return res.status(400).json({ error: "Invalid request" });
    }

    const { weights, excludedIndices = [] } = parsed.data;
    const total = weights.reduce((a, b) => a + b, 0);

    // The slider UI auto-normalizes on every drag, so it can no longer
    // produce an invalid total — this is a defensive check on the API
    // boundary only, not something a normal user should ever trigger. A
    // rejection here means bad/tampered data got in some other way.
    if (total !== 0 && Math.abs(total - 100) > 1) {
      console.error(`Rejected /api/spin request: weights summed to ${total}, expected 0 or ~100`, weights);
      return res.status(400).json({ error: "Invalid request" });
    }

    const winnerIndex = selectWeightedIndex(weights, excludedIndices);

    return res.json({ winnerIndex });
  });

  return httpServer;
}
