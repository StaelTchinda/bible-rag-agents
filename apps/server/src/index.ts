import { serve } from "@hono/node-server";
import { Hono } from "hono";

/**
 * Optional backend — mirrors @bible-rag/core over HTTP so the UI (or CLI) can
 * delegate inference instead of running it in the browser. Endpoints for chat,
 * council, retrieve, and personas are added in Phase 6; for now it just reports health.
 */
const app = new Hono();

app.get("/v1/health", (c) => c.json({ status: "ok", service: "bible-rag-server" }));

const port = Number(process.env.PORT ?? 8787);

if (process.env.NODE_ENV !== "test") {
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`bible-rag server listening on http://localhost:${info.port}`);
  });
}

export { app };
