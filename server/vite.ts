import { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // SPA HTML fallback for the React app. This MUST run before vite.middlewares,
  // which otherwise 404s deep links like /app/my-wheels on a direct load or
  // refresh. We only intercept actual page navigations (Accept: text/html and
  // not a file/module request); everything else falls through to Vite so HMR,
  // /src modules, and /@vite assets keep working.
  const serveAppHtml = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  };

  app.get(/^\/app(\/.*)?$/, (req: Request, res: Response, next: NextFunction) => {
    const accept = req.headers.accept || "";
    const isHtmlNav = accept.includes("text/html");
    const looksLikeAsset =
      /\.[a-zA-Z0-9]+$/.test(req.path) ||
      req.path.startsWith("/app/src/") ||
      req.path.startsWith("/app/@") ||
      req.path.startsWith("/app/node_modules");
    if (isHtmlNav && !looksLikeAsset) return serveAppHtml(req, res, next);
    return next();
  });

  app.use(vite.middlewares);

  // Serve landing page at root
  app.get("/", async (_req, res, next) => {
    try {
      const landingPath = path.resolve(
        __dirname,
        "..",
        "client",
        "landing.html",
      );
      let template = await fs.promises.readFile(landingPath, "utf-8");
      const page = await vite.transformIndexHtml("/", template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Serve standalone legal pages
  app.get("/terms", async (_req, res, next) => {
    try {
      const termsPath = path.resolve(
        __dirname,
        "..",
        "client",
        "terms.html",
      );
      let template = await fs.promises.readFile(termsPath, "utf-8");
      const page = await vite.transformIndexHtml("/terms", template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  app.get("/privacy", async (_req, res, next) => {
    try {
      const privacyPath = path.resolve(
        __dirname,
        "..",
        "client",
        "privacy.html",
      );
      let template = await fs.promises.readFile(privacyPath, "utf-8");
      const page = await vite.transformIndexHtml("/privacy", template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  // Note: the React app's HTML routes (/app and /app/*) are handled by the
  // serveAppHtml guard registered above, before vite.middlewares.
}
