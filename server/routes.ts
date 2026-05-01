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

function selectWeightedWinner(probabilities: number[], excludedIndices: number[] = []): number {
  const available = probabilities
    .map((prob, i) => ({ prob, i }))
    .filter(({ i }) => !excludedIndices.includes(i));

  if (available.length === 0) return 0;

  const total = available.reduce((sum, { prob }) => sum + prob, 0);

  if (total === 0) {
    return available[Math.floor(Math.random() * available.length)].i;
  }

  const random = Math.random() * total;
  let cumulative = 0;
  for (const { prob, i } of available) {
    cumulative += prob;
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
      return res.status(400).json({ error: "Invalid probabilities" });
    }

    const { probabilities, excludedIndices = [] } = parsed.data;
    const total = probabilities.reduce((a, b) => a + b, 0);

    if (total !== 0 && total !== 100) {
      return res.status(400).json({ error: "Probabilities must total 100% or all be 0" });
    }

    const winnerIndex = selectWeightedWinner(probabilities, excludedIndices);

    return res.json({ winnerIndex });
  });

  return httpServer;
}
