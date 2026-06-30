import { embedBatch } from "./embed";
import { loadIndexFromDir } from "./load-index";

/** Retrieval smoke test: embed a query and print the nearest verses (any language). */
export async function search(query: string, k = 8): Promise<void> {
  const store = await loadIndexFromDir();
  const [qv] = await embedBatch([query], "query");
  if (!qv) throw new Error("Failed to embed query");
  const hits = store.search(qv, k);
  console.log(`Query: "${query}"  (index: ${store.size} verses)\n`);
  for (const h of hits) {
    console.log(
      `  ${h.score.toFixed(3)}  [${h.verse.translation}] ${h.verse.ref}  ${h.verse.text.slice(0, 90)}`,
    );
  }
}
