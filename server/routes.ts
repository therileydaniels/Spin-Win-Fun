import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { spinRequestSchema, signupSchema, loginSchema } from "@shared/schema";

const SALT_ROUNDS = 12;

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

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

  app.post("/api/auth/signup", authLimiter, async (req, res) => {
    try {
      const parsed = signupSchema.safeParse(req.body);
      
      if (!parsed.success) {
        const firstError = parsed.error.errors[0];
        return res.status(400).json({ error: firstError.message });
      }
      
      const { email, password, name } = parsed.data;
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name: name || null,
      });
      
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Session error" });
        }
        
        req.session.userId = user.id;
        
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ error: "Session error" });
          }
          
          return res.json({ user: storage.getSafeUser(user) });
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email or password" });
      }
      
      const { email, password } = parsed.data;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ error: "Session error" });
        }
        
        req.session.userId = user.id;
        
        req.session.save((err) => {
          if (err) {
            return res.status(500).json({ error: "Session error" });
          }
          
          return res.json({ user: storage.getSafeUser(user) });
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.json({ user: null });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.json({ user: null });
      }
      
      return res.json({ user: storage.getSafeUser(user) });
    } catch (error) {
      console.error("Get user error:", error);
      return res.json({ user: null });
    }
  });

  return httpServer;
}
