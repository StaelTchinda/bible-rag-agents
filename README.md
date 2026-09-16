# Bible RAG Agents

> Ask questions inspired by the Bible and get **scripture-grounded** answers — from six very different agents. Runs **in your browser, for free**, with no account and no data leaving your device.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Status: early](https://img.shields.io/badge/status-early%20WIP-orange.svg)](./docs/OVERVIEW.md)

> ⚠️ **Early work in progress.** The RAG pipeline works end-to-end — **The Berean** retrieves and cites real Scripture (verified for English & German questions). The browser UI builds and runs the same engine; on-device generation needs a WebGPU browser. The other five agents are next. See the [roadmap](./docs/OVERVIEW.md#roadmap).

---

## What is this?

A small open-source app where AI "agents" answer Bible-inspired questions. Each agent retrieves real verses from a public-domain Bible (Retrieval-Augmented Generation) and **cites them**, so answers stay anchored to the text instead of being made up.

The twist: the agents disagree on purpose. One builds a deliberately one-sided case; another tests it against the whole counsel of Scripture. You can ask one agent, or convene a **Council** and watch them answer side by side.

## The agents

| Agent | What it does |
|---|---|
| 😈 **The Deceiver** | Builds a one-sided, proof-texted case for *any* position — a teaching demo of how Scripture gets twisted out of context. Always labeled, always rebutted. |
| 📖 **The Berean** | A balanced, gospel-centered answer that reads verses in context (Acts 17:11). The honest counterpart to the Deceiver. |
| 🏺 **The Historian** | Factual, contextual answers — authorship, dates, culture, geography. |
| ⚖️ **The Moralist** | Practical guidance on how to act, feel, relate, and help. |
| 🕊️ **The Comforter** | Pastoral comfort rooted in your identity in Christ and the promises of God. |
| 🃏 **The Jester** | Light, respectful, faith-affirming humor. |

## How it works

- **Runs locally in your browser** via [WebLLM](https://github.com/mlc-ai/web-llm) (WebGPU) for generation and [transformers.js](https://huggingface.co/docs/transformers.js) for embeddings — **$0 to run, fully private, works offline** after the first load.
- **Hybrid by design.** Prefer more powerful models? The same UI can talk to a **local [Ollama](https://ollama.com)** or a **free-tier cloud API** — chosen behind one pluggable interface.
- **Public-domain Scripture only.** World English Bible + King James Version (English), Luther 1912 + Elberfelder 1905 (German). Cross-lingual: a German question can surface the matching English verse.
- **One repo, two halves.** A static **UI** and an optional **backend** that are fully decoupled — use either alone, or together.

## Quickstart

**Prerequisites:** Node ≥ 20, [pnpm](https://pnpm.io) 9 (`corepack enable && corepack prepare pnpm@9.15.0 --activate`), and a **WebGPU-capable browser** (recent Chrome/Edge, or Safari 18+) for in-browser inference.

```bash
pnpm install            # install workspace dependencies
pnpm ingest             # download public-domain Bibles (first run only) 
pnpm build-index        # build the embedding index (first run only)
pnpm dev                # start the web app (and backend, if running)
```

Then open the app, pick an agent, and ask away. The first question downloads the model (~1–2 GB, cached afterward); retrieval and later questions are fast.

## Project structure

```
packages/core         # isomorphic brain: agents, RAG, providers, shared types
packages/bible-data   # CLI to fetch/normalize Bibles and build the embedding index
apps/web              # Vite + React UI — runs 100% standalone
apps/server           # optional Hono backend (HTTP/SSE) mirroring core
apps/cli              # terminal client
eval                  # evaluation harness (retrieval, citations, persona, guardrails)
```

## Privacy & cost

By default, **nothing leaves your browser** — the model and the Bible index run on your machine, so there are no API keys, no accounts, and no per-question cost. The cloud option is opt-in and clearly indicated.

## Contributing & license

Source code is [MIT licensed](./LICENSE). The bundled Bible translations are public domain. See [`docs/OVERVIEW.md`](./docs/OVERVIEW.md) for architecture and development setup.
