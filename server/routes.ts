import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { spinRequestSchema, signupSchema, loginSchema, MIN_SEGMENTS, MAX_SEGMENTS, MAX_LABEL_LENGTH } from "@shared/schema";

const SALT_ROUNDS = 12;
const MAX_WHEEL_NAME_LENGTH = 100;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

interface SegmentData {
  segments: Array<{ id: string; label: string; color: string }>;
  probabilities: number[];
}

function validateSegments(segments: unknown): { valid: true; data: SegmentData } | { valid: false; error: string } {
  if (!segments || typeof segments !== "object") {
    return { valid: false, error: "Segments data is required" };
  }
  
  const data = segments as SegmentData;
  
  if (!Array.isArray(data.segments) || !Array.isArray(data.probabilities)) {
    return { valid: false, error: "Segments data is required" };
  }
  
  if (data.segments.length < MIN_SEGMENTS || data.segments.length > MAX_SEGMENTS) {
    return { valid: false, error: `Wheel must have between ${MIN_SEGMENTS} and ${MAX_SEGMENTS} segments` };
  }
  
  for (const segment of data.segments) {
    if (!segment.label || typeof segment.label !== "string") {
      return { valid: false, error: "Each segment must have a label" };
    }
    if (segment.label.length > MAX_LABEL_LENGTH) {
      return { valid: false, error: `Segment label cannot exceed ${MAX_LABEL_LENGTH} characters` };
    }
    if (!segment.color || !HEX_COLOR_REGEX.test(segment.color)) {
      return { valid: false, error: "Invalid segment color format" };
    }
  }
  
  if (data.probabilities.length !== data.segments.length) {
    return { valid: false, error: "Probabilities must match segment count" };
  }
  
  return { valid: true, data };
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  
  next();
}

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
        return res.status(400).json({ error: "Unable to create account. Please try again or sign in." });
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

  const FREE_WHEEL_LIMIT = 2;

  app.get("/api/wheels", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const wheels = await storage.getWheelsByUserId(req.session.userId);
      return res.json({ wheels });
    } catch (error) {
      console.error("Get wheels error:", error);
      return res.status(500).json({ error: "Failed to get wheels" });
    }
  });

  app.get("/api/wheels/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const wheelId = parseInt(req.params.id);
      if (isNaN(wheelId)) {
        return res.status(400).json({ error: "Invalid wheel ID" });
      }
      
      const wheel = await storage.getWheelById(wheelId);
      if (!wheel) {
        return res.status(404).json({ error: "Wheel not found" });
      }
      
      if (wheel.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      return res.json({ wheel });
    } catch (error) {
      console.error("Get wheel error:", error);
      return res.status(500).json({ error: "Failed to get wheel" });
    }
  });

  app.post("/api/wheels", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      if (user.role !== "admin") {
        const count = await storage.getWheelCountByUserId(req.session.userId);
        if (count >= FREE_WHEEL_LIMIT) {
          return res.status(403).json({ 
            error: "Free limit reached",
            message: "You've reached the free limit (2 wheels). Upgrade to save unlimited wheels."
          });
        }
      }
      
      const { name, segments } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Wheel name is required" });
      }
      
      if (name.trim().length > MAX_WHEEL_NAME_LENGTH) {
        return res.status(400).json({ error: `Wheel name cannot exceed ${MAX_WHEEL_NAME_LENGTH} characters` });
      }
      
      const segmentValidation = validateSegments(segments);
      if (!segmentValidation.valid) {
        return res.status(400).json({ error: segmentValidation.error });
      }
      
      const wheel = await storage.createWheel({
        userId: req.session.userId,
        name: name.trim(),
        segments: segmentValidation.data,
      });
      
      return res.json({ wheel });
    } catch (error) {
      console.error("Create wheel error:", error);
      return res.status(500).json({ error: "Failed to save wheel" });
    }
  });

  app.put("/api/wheels/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const wheelId = parseInt(req.params.id);
      if (isNaN(wheelId)) {
        return res.status(400).json({ error: "Invalid wheel ID" });
      }
      
      const { name, segments } = req.body;
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Wheel name is required" });
      }
      
      if (name.trim().length > MAX_WHEEL_NAME_LENGTH) {
        return res.status(400).json({ error: `Wheel name cannot exceed ${MAX_WHEEL_NAME_LENGTH} characters` });
      }
      
      const segmentValidation = validateSegments(segments);
      if (!segmentValidation.valid) {
        return res.status(400).json({ error: segmentValidation.error });
      }
      
      const wheel = await storage.updateWheel(wheelId, req.session.userId, {
        name: name.trim(),
        segments: segmentValidation.data,
      });
      
      if (!wheel) {
        return res.status(404).json({ error: "Wheel not found" });
      }
      
      return res.json({ wheel });
    } catch (error) {
      console.error("Update wheel error:", error);
      return res.status(500).json({ error: "Failed to update wheel" });
    }
  });

  app.delete("/api/wheels/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const wheelId = parseInt(req.params.id);
      if (isNaN(wheelId)) {
        return res.status(400).json({ error: "Invalid wheel ID" });
      }
      
      const deleted = await storage.deleteWheel(wheelId, req.session.userId);
      if (!deleted) {
        return res.status(404).json({ error: "Wheel not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete wheel error:", error);
      return res.status(500).json({ error: "Failed to delete wheel" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      return res.json(stats);
    } catch (error) {
      console.error("Admin stats error:", error);
      return res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      
      const result = await storage.getAllUsersWithWheelCount(page, limit, search);
      return res.json(result);
    } catch (error) {
      console.error("Admin users error:", error);
      return res.status(500).json({ error: "Failed to get users" });
    }
  });

  app.put("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const { role } = req.body;
      if (!role || !['free', 'paid', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }
      
      const user = await storage.updateUserRole(userId, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`[ADMIN] User ${req.session.userId} changed user ${userId} role to: ${role}`);
      return res.json({ success: true, user: storage.getSafeUser(user) });
    } catch (error) {
      console.error("Admin role change error:", error);
      return res.status(500).json({ error: "Failed to change role" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      if (userId === req.session.userId) {
        return res.status(400).json({ error: "Cannot delete yourself" });
      }
      
      const deleted = await storage.deleteUserAndWheels(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      
      console.log(`[ADMIN] User ${req.session.userId} deleted user ${userId}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("Admin delete user error:", error);
      return res.status(500).json({ error: "Failed to delete user" });
    }
  });

  return httpServer;
}
