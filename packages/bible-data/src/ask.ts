import {
  type EmbeddingKind,
  type EmbeddingProvider,
  StubLLMProvider,
  berean,
  runAgent,
} from "@bible-rag/core";
import { EMBED_DIMS, EMBED_MODEL, embedBatch } from "./embed";
import { loadIndexFromDir } from "./load-index";

/** EmbeddingProvider backed by the Node embedder — same model that built the index. */
const nodeEmbedder: EmbeddingProvider = {
  id: "transformers-node",
  modelId: EMBED_MODEL,
  dimensions: EMBED_DIMS,
  init: () => Promise.resolve(),
  embed: (texts: string[], kind: EmbeddingKind) =>
    embedBatch(texts, kind === "query" ? "query" : "passage"),
};

/**
 * Full end-to-end smoke test (Node, no GPU): real query embedding → real retrieval
 * over the built index → the runtime + a stub LLM. Proves the whole RAG pipeline.
 */
export async function ask(query: string): Promise<void> {
  const store = await loadIndexFromDir();
  for await (const event of runAgent({
    persona: berean,
    query,
    providers: { llm: new StubLLMProvider(), embedder: nodeEmbedder },
    store,
  })) {
    if (event.type === "citations") {
      console.log(`\nThe Berean — retrieved ${event.citations.length} verses for: "${query}"\n`);
      for (const c of event.citations) {
        const langs = [c.translation, ...(c.parallels?.map((p) => p.translation) ?? [])].join("+");
        console.log(`  ${c.score.toFixed(3)} [${langs}] ${c.ref}  ${c.text.slice(0, 80)}`);
      }
    } else if (event.type === "done") {
      console.log(`\nAnswer (stub LLM):\n${event.text}\n`);
    }
  }
}
