# @bible-rag/bible-data

This package owns the Scripture ingest and index-building pipeline for the project.

It is responsible for:

- fetching public-domain Bible translations from getbible.net
- normalizing them into canonical verse records
- embedding each verse with the project embedding model
- quantizing vectors to int8 for fast browser retrieval
- outputting a static index that the web app can load locally

## Scope

This package is intentionally narrow: it does not contain the app UI or the agent runtime. It only prepares the Bible data that the rest of the monorepo consumes.

## Runtime flow

1. `ingest` downloads raw translation dumps from getbible.net and stores them under `data/raw/`.
2. `normalize` converts each book/chapter/verse structure into canonical `Verse` objects and writes `data/normalized/*.json`.
3. `build-index` embeds every verse, quantizes vectors, and writes `dist-index/` plus a copy under `apps/web/public/index/`.
4. Retrieval in the app loads this static index and searches by embedding similarity.

## Included sources

The current MVP source list is defined in `src/sources.ts` and contains:

- `WEB` — World English Bible
- `ELBERFELDER1905` — German public-domain translation

This is intentionally the minimal set for the current working pipeline.

## Commands

Run these from the repo root or from this package directory:

```bash
pnpm install
pnpm --filter @bible-rag/bible-data ingest
pnpm --filter @bible-rag/bible-data build-index
pnpm --filter @bible-rag/bible-data verify
pnpm --filter @bible-rag/bible-data search "love your enemies"
pnpm --filter @bible-rag/bible-data ask "How should I treat my enemies?"
```

Equivalent package scripts are also available:

```bash
cd packages/bible-data
pnpm ingest
pnpm build-index
pnpm verify
pnpm search "love your enemies"
pnpm ask "How should I treat my enemies?"
```

## CLI behavior

The package CLI is defined in `src/cli.ts` and supports:

- `ingest` — fetch and normalize Bible data
- `build-index` — build the static embedding index
- `verify` — sanity-check total verse counts and 66-book coverage
- `search <query>` — run a retrieval-only search against the local index
- `ask <query>` — smoke-test the full RAG flow with a stub LLM

## Data layout

```text
packages/bible-data/
├── data/
│   ├── raw/             # cached raw API responses (gitignored)
│   └── normalized/      # canonical verse JSON files (gitignored)
├── dist-index/          # generated int8 embedding index (gitignored)
├── src/
│   ├── cli.ts           # entrypoint for the package CLI
│   ├── getbible.ts      # fetches translation data from getbible.net
│   ├── normalize.ts     # converts raw source data to canonical verse JSON
│   ├── build-index.ts   # embeds + quantizes + writes the shipped index
│   ├── load-index.ts    # loads the local index from disk
│   ├── search.ts        # retrieval-only demo
│   ├── ask.ts           # end-to-end RAG smoke test
│   ├── schema.ts        # normalized Bible schema
│   ├── sources.ts       # translation source config
│   ├── paths.ts         # local storage paths
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

## Output contracts

The generated index is expected to match the shared types from `@bible-rag/core`:

- a manifest with `embeddingModel`, `dimensions`, `normalized`, `quantization`, and `scale`
- a per-translation vector file (`vectors.<id>.bin`)
- a per-translation verse file (`verses.<id>.json`)

The app consumes these files as a static prebuilt index.

## Notes

- This package relies on the shared `@bible-rag/core` package for translation metadata, references, and the verse model.
- The package intentionally writes machine-generated data into local directories rather than a database.
- The generated index is copied into `apps/web/public/index/` so the browser can load it standalone.

## Typical workflow

For a fresh clone, the usual order is:

```bash
pnpm install
pnpm --filter @bible-rag/bible-data ingest
pnpm --filter @bible-rag/bible-data build-index
pnpm dev
```

This gives the app a local, fully bundled Bible index to query without a backend.
