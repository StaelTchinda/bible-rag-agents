import type { Verse } from "../scripture/types";

export interface SearchHit {
  verse: Verse;
  /** Cosine-like similarity in roughly [-1, 1]; higher is better. */
  score: number;
}

export interface VectorStore {
  readonly size: number;
  readonly dimensions: number;
  /**
   * Return the top-`k` verses for a normalized float query vector.
   * `filter` can restrict candidates (e.g. by translation or testament).
   */
  search(query: Float32Array, k: number, filter?: (verse: Verse) => boolean): SearchHit[];
}
