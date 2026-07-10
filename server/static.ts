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

  // Root-relative assets referenced by the marketing pages (robots.txt,
  // sitemap.xml, favicon, og:image, Organization schema logo). express.static
  // is only mounted at /app below, so these 404'd at the domain root without
  // this — search engines fetch /robots.txt and /sitemap.xml at the root by
  // convention regardless of what's inside robots.txt.
  const rootAssets = ["favicon-32x32.png", "robots.txt", "sitemap.xml", "og-image.png", "logo.png"];
  for (const asset of rootAssets) {
    app.get(`/${asset}`, (_req, res) => {
      res.sendFile(path.resolve(distPath, asset));
    });
  }

  // Serve React app static assets under /app
  app.use("/app", express.static(distPath));

  // SPA fallback for /app/* routes
  app.get("/app/*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
