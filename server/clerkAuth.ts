import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string };
  }
}

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Server auth misconfigured" });
    return;
  }

  try {
    const claims = await verifyToken(token, { secretKey });
    if (!claims.sub) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    req.auth = { userId: claims.sub };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
