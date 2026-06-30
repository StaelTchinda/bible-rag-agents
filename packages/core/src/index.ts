/**
 * @bible-rag/core — the isomorphic brain.
 *
 * Holds the agent runtime, persona configs, RAG pipeline, provider abstraction,
 * and shared types. No DOM-only and no Node-only imports, so the same code runs
 * in a browser Web Worker, the Hono server, and the CLI.
 *
 * Modules are exported here as phases land — see docs/OVERVIEW.md for the roadmap.
 */
export const CORE_VERSION = "0.0.0";

export * from "./agent";
export * from "./personas";
export * from "./providers";
export * from "./rag";
export * from "./scripture";
