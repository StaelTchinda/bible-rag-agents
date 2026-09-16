# @bible-rag/bible-data

This package is the data-preparation layer for the Bible RAG app. It downloads public-domain translations, normalizes them into canonical verse objects, embeds them, and writes the static index that the browser loads at runtime.

## Package responsibility

This package is intentionally narrow. It does not contain the UI or the agent runtime; it only prepares the scripture corpus consumed by the rest of the monorepo.

Relevant files:

- [package.json](./package.json) — package scripts and dependencies
- [src/cli.ts](./src/cli.ts) — CLI entrypoint for ingest/build-index/verify/search/ask
- [src/getbible.ts](./src/getbible.ts) — fetches translation data from getbible.net
- [src/normalize.ts](./src/normalize.ts) — normalizes raw API output to canonical verse JSON
- [src/build-index.ts](./src/build-index.ts) — embeds verses, quantizes vectors, and emits the shipped index
- [src/schema.ts](./src/schema.ts) — normalized Bible schema
- [src/sources.ts](./src/sources.ts) — translation source config
- [src/paths.ts](./src/paths.ts) — local storage paths for raw, normalized, and index files
- [src/load-index.ts](./src/load-index.ts) — loads the generated index from disk
- [src/search.ts](./src/search.ts) and [src/ask.ts](./src/ask.ts) — package-local retrieval and smoke-test flows
- [../core](../core) — shared Bible metadata and runtime types used by this package

## Data flow

1. [src/cli.ts](./src/cli.ts) dispatches commands.
2. [src/sources.ts](./src/sources.ts) defines the active translation set.
3. [src/getbible.ts](./src/getbible.ts) fetches each book from the API and flattens it into verse objects.
4. [src/normalize.ts](./src/normalize.ts) writes the canonical output to [data/normalized](./data) (generated locally).
5. [src/build-index.ts](./src/build-index.ts) embeds those verses, compresses them to int8, and writes the index under [dist-index](./dist-index) and the web app's public index directory.
6. [src/load-index.ts](./src/load-index.ts) reads that generated data for retrieval or local tests.

## Source set

The current MVP source list is defined in [src/sources.ts](./src/sources.ts):

- `WEB` — World English Bible
- `ELBERFELDER1905` — Elberfelder 1905 German translation

This is intentionally minimal and focused on the current working corpus.

## Local directories

The package stores generated data in local folders, not a database:

- [data/raw](./data/raw) — cached getbible.net responses
- [data/normalized](./data/normalized) — canonical verse JSON files, one per translation
- [dist-index](./dist-index) — generated static index files
- [../../apps/web/public/index](../../apps/web/public/index) — copy of the shipped index used by the browser app

These locations are configured in [src/paths.ts](./src/paths.ts).

## Commands

From inside this package:

```bash
cd packages/bible-data
pnpm ingest
pnpm build-index
pnpm verify
pnpm search "love your enemies"
pnpm ask "How should I treat my enemies?"
```

## Command behavior

The package CLI in [src/cli.ts](./src/cli.ts) supports:

- `ingest` — fetch and normalize data into canonical verse files
- `build-index` — embed, quantize, and write the shipped prebuilt index
- `verify` — check verse counts and 66-book coverage sanity
- `search <query>` — run a retrieval-only lookup against the local index
- `ask <query>` — smoke-test the end-to-end RAG flow using the stub LLM

## Output contract

The generated index is designed to match the shared structures in [../core](../core), with per-translation artifacts such as:

- `manifest.json` — embedding metadata and shard definitions
- `vectors.<id>.bin` — int8-quantized embeddings
- `verses.<id>.json` — canonical verse records for the shard

This is the static index the app loads as a local prebuilt corpus.

## Implementation notes

- [src/getbible.ts](./src/getbible.ts) preserves book/verse ordering while flattening the raw API response.
- [src/normalize.ts](./src/normalize.ts) writes a canonical shape used downstream by the embedding pipeline.
- [src/build-index.ts](./src/build-index.ts) is the place where the embedding model and quantization are applied.
- [src/verify.ts](./src/verify.ts) is the package-level validation command for checking the downloaded corpus.
- [src/paths.ts](./src/paths.ts) keeps all generated data under the package's local filesystem rather than a service database.

## Typical package workflow

For a fresh clone, the usual sequence is:

```bash
pnpm install
pnpm --filter @bible-rag/bible-data ingest
pnpm --filter @bible-rag/bible-data build-index
pnpm dev
```

This produces the local Bible index used by the app without needing any backend service.
