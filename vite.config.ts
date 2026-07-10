import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyStaticPages(): Plugin {
  return {
    name: "copy-static-pages",
    closeBundle() {
      const pages = ["landing.html", "terms.html", "privacy.html"];
      for (const page of pages) {
        const src = path.resolve(__dirname, "client", page);
        const dest = path.resolve(import.meta.dirname, "dist/public", page);
        fs.copyFileSync(src, dest);
      }
    },
  };
}

export default defineConfig({
  base: "/app/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    copyStaticPages(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-tooltip", "@radix-ui/react-popover", "@radix-ui/react-toast", "@radix-ui/react-alert-dialog"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // The project lives on a network drive (NAS). Native file-system events
    // are unreliable there and crash the dev server with ETIMEDOUT. Poll
    // instead so HMR stays stable on the network share.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
