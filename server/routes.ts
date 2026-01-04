import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { spinRequestSchema } from "@shared/schema";

function selectWeightedWinner(probabilities: number[]): number {
  const total = probabilities.reduce((a, b) => a + b, 0);
  
  if (total === 0) {
    return Math.floor(Math.random() * probabilities.length);
  }
  
  const random = Math.random() * total;
  
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (random < cumulative) {
      return i;
    }
  }
  
  return probabilities.length - 1;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/spin", (req, res) => {
    const parsed = spinRequestSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid probabilities" });
    }
    
    const { probabilities } = parsed.data;
    const total = probabilities.reduce((a, b) => a + b, 0);
    
    if (total !== 0 && total !== 100) {
      return res.status(400).json({ error: "Probabilities must total 100% or all be 0" });
    }
    
    const winnerIndex = selectWeightedWinner(probabilities);
    
    return res.json({ winnerIndex });
  });

  return httpServer;
}
