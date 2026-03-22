import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Landing page at root
  const landingPath = path.resolve(distPath, "landing.html");
  const termsPath = path.resolve(distPath, "terms.html");
  const privacyPath = path.resolve(distPath, "privacy.html");

  app.get("/", (_req, res) => {
    res.sendFile(landingPath);
  });

  app.get("/terms", (_req, res) => {
    res.sendFile(termsPath);
  });

  app.get("/privacy", (_req, res) => {
    res.sendFile(privacyPath);
  });

  // Serve React app static assets under /app
  app.use("/app", express.static(distPath));

  // SPA fallback for /app/* routes
  app.get("/app/*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
