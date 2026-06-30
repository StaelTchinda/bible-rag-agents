import react from "@vitejs/plugin-react";
import { type Plugin, defineConfig } from "vite";

/**
 * COOP/COEP headers turn on cross-origin isolation, which browsers require
 * before threaded WASM (transformers.js, WebLLM) can use SharedArrayBuffer.
 */
function crossOriginIsolation(): Plugin {
  const headers = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
  };
  return {
    name: "cross-origin-isolation",
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
  worker: { format: "es" },
});
