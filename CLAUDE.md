# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install                          # Install workspace dependencies
pnpm build-index                      # Build Bible embedding index (first-run only)
pnpm dev                              # Start web app + optional backend
pnpm typecheck                        # Type-check all packages
pnpm lint                             # Biome lint check
pnpm test                             # Run tests across packages
pnpm --filter @bible-rag/bible-data ask "..."  # Ask Bible questions via CLI
```

## Architecture Overview

**Monorepo Structure (Turbopack):**
- `packages/core/` — Isomorphic shared code (agents, personas, RAG, providers) — runs in browser Web Workers, Hono server, and CLI. Exports: `@bible-rag/core`
- `packages/bible-data/` — Bible text fetching, normalization, chunking, embedding, int8 quantization, index building. Runs via CLI: `pnpm --filter @bible-rag/bible-data build-index`
- `apps/web/` — Vite + React UI (standalone, can load index and run inference in browser)
- `apps/server/` — Optional Hono backend (HTTP/SSE), currently health-check only; Phase 6 will add chat/council endpoints
- `apps/cli/` — Terminal client stub; Phase 6 implementation pending
- `eval/` — Evaluation harness for retrieval hit-rate, citation verification, persona judging

**Runtime Flow:**
1. UI calls `useBibleAgent()` hook which loads the index (`loadPrebuiltIndex("/index", ...)`) and embedding model (`TransformersEmbeddingProvider`) + LLM (`WebLLMProvider`)
2. For each turn: retrieve verses via RAG (`runAgent` → `retrieve`) → assemble persona-specific prompt → stream generation
3. Provider interface allows swapping between WebGPU browser inference, Ollama local, or cloud API

**Key Isomorphic Modules:**
- `packages/core/src/agent/runtime.ts` — orchestrates retrieval + generation with events (label → citations → token → done)
- `packages/core/src/personas/*.ts` — persona configs (system prompt, retrieval params, guardrails) exported as registry
- `packages/core/src/rag/retriever.ts` + `brute-force-store.ts` — cosine search over int8 vectors

**Persona Configs:**
```typescript
interface PersonaConfig {
  id: string;
  displayName: string;
  description: string;
  systemPrompt: string; // includes CITATION_RULES, NO_FABRICATION fragments
  retrieval: { k: number; windowSize: number; crossLingual: boolean };
  generation: { temperature: number; maxTokens: number };
  output: { requireCitations: boolean; minCitations: number; sections: string[] };
  guardrail?: { alwaysLabel: string }; // for The Deceiver
}
```

**Current State (MVP):**
- ✅ The Berean persona implemented and tested (English/German)
- ✅ RAG retrieval working with public-domain Bibles (WEB, KJV, Elberfelder 1905, Luther 1545)
- ✅ Web UI builds and serves; on-device generation requires WebGPU browser
- ❌ The Deceiver guardrails + council mode: Phase 7
- ❌ Server endpoints beyond health-check: Phase 6
- ❌ CLI commands beyond stub: Phase 6

## Big-Picture Implementation Patterns

**Adding a New Persona:**
1. Create `packages/core/src/personas/<name>.ts` with `PersonaConfig` export
2. Register it in `packages/core/src/personas/index.ts` (add to `ALL` array and `PERSONAS` record)
3. No runtime changes needed — plug-and-play

**Adding a New LLM Provider:**
1. Implement `LLMProvider` interface from `packages/core/src/providers/types.ts`
2. Export in `packages/core/src/providers/index.ts`
3. In apps/web: instantiate via provider selection UI (currently hardcoded to `WebLLMProvider`)

## Testing

```bash
pnpm test                            # Run all tests
pnpm test --filter @bible-rag/core   # Test core package only
pnpm test runAgent                  # Run specific test file
```

**Stub Mode for Dev:** Add `?stub` to URL to bypass model download and use fake embedder + StubLLMProvider.
