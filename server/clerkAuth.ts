import type { Request, Response, NextFunction } from "express";
import { createClerkClient } from "@clerk/backend";
import { PRO_PLAN } from "@shared/entitlements";

declare module "express-serve-static-core" {
  interface Request {
    auth?: { userId: string; isPro: boolean };
  }
}

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

// Created once at module load. authenticateRequest needs both keys.
const clerkClient =
  secretKey && publishableKey
    ? createClerkClient({ secretKey, publishableKey })
    : null;

// In production, restrict which origins' tokens we accept (azp claim) to harden
// against CSRF. Left unset in dev so local origins/ports aren't rejected.
const authorizedParties =
  process.env.NODE_ENV === "production" ? ["https://quickwheel.co"] : undefined;

// Build a Fetch API Request carrying just the Authorization header, which is all
// authenticateRequest needs to validate a Bearer session token.
function toFetchRequest(req: Request): globalThis.Request {
  const headers = new Headers();
  const auth = req.headers.authorization;
  if (auth) headers.set("authorization", auth);
  return new globalThis.Request(`http://localhost${req.originalUrl}`, { headers });
}

export async function requireClerkAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!clerkClient) {
    res.status(500).json({ error: "Server auth misconfigured" });
    return;
  }

  try {
    const requestState = await clerkClient.authenticateRequest(
      toFetchRequest(req),
      authorizedParties ? { authorizedParties } : undefined
    );
    const auth = requestState.toAuth();

    if (!auth || !("userId" in auth) || !auth.userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.auth = { userId: auth.userId, isPro: auth.has({ plan: PRO_PLAN }) };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
