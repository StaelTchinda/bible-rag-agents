# Overview

A pragmatic tour of **why** this project exists, **how** it's built, and **where** it's going. For the user-facing pitch see the [README](../README.md).

---

## Origin & motivation

Three ideas drove this project:

1. **Scripture, not vibes.** General chatbots answer Bible questions from a blurry memory of the text and routinely invent references. Grounding every answer in *retrieved, citable* verses keeps it honest — and makes disagreement legible.

2. **The dialectic.** Truth gets sharper against a foil. **The Deceiver** deliberately does what bad teaching does — cherry-picks isolated verses to "prove" anything — while **The Berean** reads the whole counsel of Scripture in context (Acts 17:11). Seeing them side by side teaches discernment better than a single confident answer ever could. The other agents (Historian, Moralist, Comforter, Jester) cover the other ways people actually come to Scripture: for facts, for guidance, for comfort, and for joy.

3. **Free and private by default.** Faith tools shouldn't require an account, a subscription, or shipping your questions to someone's server. Modern browsers can run a capable language model and a vector search entirely on-device, so the default experience costs **nothing** and keeps everything **local**.

## Architecture at a glance

One monorepo, a shared isomorphic core, and a hard line between build-time data work and runtime.

```
                       ┌───────────────────────── packages/core (isomorphic) ─────────────────────────┐
  apps/web  ──────────▶│  AgentRuntime ─ retrieve → assemble prompt → stream → post-process            │
  (Vite+React,         │      │              │                 │                                        │
   browser inference)  │  RAG retriever   PersonaConfig    LLMProvider / EmbeddingProvider (interfaces) │
  apps/server ────────▶│  (brute-force      (data, per-       ├─ WebLLM (browser)                       │
  (Hono, optional)     │   cosine over      agent)           ├─ Ollama (local)                          │
  apps/cli  ──────────▶│   int8 index)                        ├─ cloud (free-tier, backend-only)        │
                       │                                      └─ backend-proxy (UI → server SSE)        │
                       └──────────────────────────────────────────────────────────────────────────────┘
                                              ▲
             packages/bible-data (build-time) │ ships a prebuilt static index (verses + embeddings)
             parse → normalize → align → chunk → embed → int8 quantize
```

**Key decisions:**

- **`core` is isomorphic** — no DOM-only and no Node-only imports — so the *same* `AgentRuntime` runs in a browser Web Worker, the Hono server, and the CLI. That identity is what makes "UI standalone" and "UI + backend" behave the same.
- **Inference is a provider interface.** `LLMProvider` and `EmbeddingProvider` each have one streaming method; the UI picks one (`auto` falls back: backend → WebGPU browser → Ollama → cloud) and the rest of the system is oblivious to which.
- **Personas are data, not code.** Each agent is a `PersonaConfig` (system prompt + retrieval params + guardrails). Adding an agent is a new config file + a registry entry — no runtime changes.
- **RAG is precomputed and shipped.** Embedding the whole Bible is done once, offline, in `bible-data`; the browser only loads a compact int8 index (~32 MB in memory) and does brute-force cosine search (single-digit milliseconds — no vector DB needed at this scale).
- **Guardrails are layered, especially for the Deceiver.** A mandatory non-dismissible label (injected at the runtime level, so it survives even raw API use), a bounded domain (doctrinal argument only — it refuses real-world-harm framings), automatic pairing with the Berean's rebuttal in Council mode, and a red-team set as a release gate.

For the full design rationale, interface signatures, and risk analysis, see the approved plan at `~/.claude/plans/` (or ask a maintainer).

## Development setup

```bash
corepack enable && corepack prepare pnpm@9.15.0 --activate   # one-time: get pnpm 9
pnpm install                                                  # install all workspaces

pnpm build-index     # fetch public-domain Bibles → normalize → embed → write the index
pnpm dev             # run the web app (Vite) and, if present, the backend (Hono)

pnpm typecheck       # tsc --noEmit across packages
pnpm lint            # Biome (lint + format check)
pnpm test            # Vitest across packages
```

**Tooling:** pnpm workspaces + Turborepo (task graph & caching), TypeScript (strict, ESM, internal-packages pattern — packages are consumed as source, no separate build step), Biome (one tool for lint + format), Vitest.

**Rebuilding the index** (after changing the embedding model, corpus, or chunking) is a single cached Turborepo task; the index manifest records the embedding model and dimensions, and the runtime refuses to load a mismatched index.

## Roadmap

Built as a **vertical slice first** — one agent end-to-end — then broadened.

| Phase | Scope | Status |
|---|---|---|
| 0 | Monorepo scaffold, tooling, CI, docs | ✅ done |
| 1 | Bible ingestion → normalized verse JSON (WEB + Elberfelder 1905) | ✅ done |
| 2 | Chunking + embedding index (int8) + brute-force retrieval | ✅ done |
| 3 | Provider interfaces + `AgentRuntime` + retriever | ✅ done |
| 4 | **The Berean** persona | ✅ done |
| 5 | **MVP:** standalone browser UI (Vite + React) | ✅ builds & serves¹ |
| 6 | Optional Hono backend + CLI (decoupling parity) | later |
| 7 | Remaining agents + Council mode + the Deceiver & guardrails | later |
| 8 | Eval harness (retrieval hit-rate, citation verification, persona judge, red-team) | later |

¹ The UI builds and serves the index standalone and reuses the Node-verified runtime/retrieval; live on-device generation needs a WebGPU browser to exercise.

**MVP status:** The Berean retrieves and cites real Scripture over WEB + Elberfelder 1905 — verified end-to-end in Node for both English and German questions (`pnpm --filter @bible-rag/bible-data ask "…"`). The browser app builds, serves the int8 index with cross-origin-isolation headers, and runs the same runtime; the on-device model itself needs a WebGPU browser.

### Notes & deviations from the original plan

- **German MVP text is Elberfelder 1905, not Luther 1912.** The unified getbible source carries WEB, KJV, Elberfelder 1905, and Luther 1545 — but not Luther 1912. Elberfelder 1905 (also a chosen text, also public domain) gave one clean source to start. Luther 1912 needs a dedicated source + parser — tracked follow-up.
- **Embedder is multilingual-e5-small** (proven in transformers.js), not EmbeddingGemma. The `EmbeddingProvider` interface and the index manifest (which records the model + dimensions) make swapping it a localized change.
- **Concrete browser providers (WebLLM, transformers.js) live in `apps/web`,** not `core`, keeping `core` truly isomorphic (no browser/WASM deps). `core` holds the provider interfaces plus a dependency-free stub LLM used in tests.
- **Inference runs on the main thread for now;** moving the model + embedder into Web Workers is the next UI step.

### Known limitations / open questions

- **Browser inference quality is capped** by what a ~2 GB on-device model can do; nuanced theology benefits from the optional Ollama/cloud tiers.
- **Same-language retrieval bias:** a German query currently surfaces German verses (English → English). The dedup-by-ref merge attaches the other translation as a parallel when scores compete; true cross-lingual recall is a metric for the eval harness (and a reason to evaluate EmbeddingGemma).
- **Bundle size:** the web build is large (~7 MB JS + ~21 MB WASM); code-splitting + workers are planned.
- **The Deceiver** ships last, only once the guardrail eval harness exists.
