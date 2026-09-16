# `@bible-rag/web`

**Last updated:** 2026-09-16

This package is the standalone Vite + React browser client for Bible RAG Agents.
It loads the retrieval index from its own static assets, runs embedding and
generation in the browser, and renders streamed answers with Scripture
citations.

## Package boundaries

- [src/main.tsx](./src/main.tsx) mounts the React application at `#root`.
- [src/App.tsx](./src/App.tsx) owns the page-level UI: initialization, persona
  selection, chat input, streamed messages, citations, and chapter reading.
- [src/hooks/useBibleAgent.ts](./src/hooks/useBibleAgent.ts) connects the UI to
  the shared agent runtime and manages loading, chat turns, and errors.
- [src/providers/embedding.ts](./src/providers/embedding.ts) loads the
  `Xenova/multilingual-e5-small` embedding model.
- [src/providers/webllm.ts](./src/providers/webllm.ts) loads the default
  WebLLM model and streams generated tokens.
- [public/index/](./public/index/) contains the retrieval index served by the
  browser at `/index`.

## Input and initialization flow

When the user selects **Load model & Scripture index**, the application:

1. Loads the prebuilt vector index from `/index` using the manifest's embedding
   model and dimensions.
2. Loads the browser embedding model through
   [TransformersEmbeddingProvider](./src/providers/embedding.ts).
3. Loads `gemma-2-2b-it-q4f16_1-MLC` through
   [WebLLMProvider](./src/providers/webllm.ts).
4. Switches the UI to the ready state, allowing questions to be submitted.

The normal browser path requires WebGPU. The Vite configuration also adds
Cross-Origin Opener Policy and Cross-Origin Embedder Policy headers so browser
WASM and `SharedArrayBuffer`-based execution can work:
[vite.config.ts](./vite.config.ts).

### User inputs

- A free-form question entered in the chat form.
- A persona selected in [PersonaPicker.tsx](./src/components/PersonaPicker.tsx).
- An optional `stub` URL query parameter, for example `?stub`.

The selected persona and the conversation history are passed with each question
to the shared `runAgent` runtime from [useBibleAgent.ts](./src/hooks/useBibleAgent.ts).

### Stub mode

Opening the app with `?stub` skips WebGPU, the embedding model, and WebLLM.
The app still loads the local Scripture index, then uses a deterministic
embedding and `StubLLMProvider`. This is intended to exercise the chat UI,
citation rendering, and chapter reader without downloading browser models; it
is not a substitute for real answer quality.

## Static retrieval input

The browser serves the files in [public/index/](./public/index/) unchanged:

- [manifest.json](./public/index/manifest.json) describes the embedding model,
  vector dimensions, translations, and shard files.
- `vectors.*.bin` contains quantized vectors.
- `verses.*.json` contains the verse records used for citations and chapter
  reading.

The application expects the manifest to match
`Xenova/multilingual-e5-small` with 384 dimensions. The index is loaded by
`loadPrebuiltIndex("/index", ...)` in
[useBibleAgent.ts](./src/hooks/useBibleAgent.ts).

## Output flow

For each submitted question, the hook creates a user turn and an assistant
turn. Events from the shared runtime update the assistant turn as they arrive:

- `label` adds a persona or guardrail label.
- `citations` attaches retrieved Scripture references.
- `token` appends streamed answer text.
- `done` marks the assistant turn complete.

The resulting state is rendered by:

- [ChatMessage.tsx](./src/components/ChatMessage.tsx) for the answer and
  citations.
- [CitationCard.tsx](./src/components/CitationCard.tsx) for individual
  references.
- [ChapterReader.tsx](./src/components/ChapterReader.tsx) for the selected
  chapter, read from the loaded index.

No package-local server endpoint receives questions. In the normal browser
configuration, retrieval, embedding, and generation stay in the browser; the
package exposes the resulting UI through the Vite application.

## Package commands

Run these from the repository root:

```bash
pnpm --filter @bible-rag/web dev
pnpm --filter @bible-rag/web typecheck
pnpm --filter @bible-rag/web build
pnpm --filter @bible-rag/web preview
```

The production build is emitted to the package's Vite `dist/` directory.
