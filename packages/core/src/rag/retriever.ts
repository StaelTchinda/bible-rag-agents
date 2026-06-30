import type { EmbeddingProvider } from "../providers/types";
import type { Translation, Verse } from "../scripture/types";
import type { VectorStore } from "./vector-store";

export interface ParallelVerse {
  translation: Translation;
  text: string;
}

export interface Citation {
  ref: string;
  translation: Translation;
  text: string;
  /** Cosine-like similarity; higher is better. */
  score: number;
  /** Same verse in other translations (cross-lingual merge), for side-by-side display. */
  parallels?: ParallelVerse[];
}

export interface RetrievalParams {
  k: number;
  /** Restrict to these translations (default: all in the store). */
  translations?: Translation[];
  /** Verses of context to include around each hit when assembling the prompt. */
  windowSize?: number;
  /** Allow hits in any language (default true). */
  crossLingual?: boolean;
  /** Arbitrary extra predicate (e.g. NT-only). */
  filter?: (verse: Verse) => boolean;
}

/**
 * Embed the query, search the store, and merge duplicate refs across translations
 * into a single citation (keeping the best-scoring text, attaching the rest as
 * parallels). Returns up to `k` distinct verses.
 */
export async function retrieve(
  query: string,
  embedder: EmbeddingProvider,
  store: VectorStore,
  params: RetrievalParams,
): Promise<Citation[]> {
  const [queryVec] = await embedder.embed([query], "query");
  if (!queryVec) return [];

  const allowed = params.translations ? new Set(params.translations) : undefined;
  const filter = (verse: Verse): boolean => {
    if (allowed && !allowed.has(verse.translation)) return false;
    if (params.filter && !params.filter(verse)) return false;
    return true;
  };

  // Over-fetch so that after merging duplicate refs we still have ~k distinct verses.
  const overFetch = Math.max(params.k * 4, params.k + 8);
  const hits = store.search(queryVec, overFetch, filter);

  const byRef = new Map<string, Citation>();
  for (const hit of hits) {
    const existing = byRef.get(hit.verse.ref);
    if (!existing) {
      byRef.set(hit.verse.ref, {
        ref: hit.verse.ref,
        translation: hit.verse.translation,
        text: hit.verse.text,
        score: hit.score,
      });
    } else {
      existing.parallels ??= [];
      existing.parallels.push({
        translation: hit.verse.translation,
        text: hit.verse.text,
      });
    }
  }

  return [...byRef.values()].sort((a, b) => b.score - a.score).slice(0, params.k);
}
