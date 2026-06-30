import type { Translation, Verse } from "../scripture/types";
import type { SearchHit, VectorStore } from "./vector-store";

export interface ShardData {
  /** int8 vectors, length = verses.length * dimensions, row-major. */
  vectors: Int8Array;
  verses: Verse[];
}

/**
 * Exhaustive cosine search over int8-quantized, L2-normalized vectors.
 *
 * Vectors stay int8 in memory (~1 byte/dim) and the query is a float; the dot
 * product `query · int8vec` is proportional to cosine, so ranking is exact and
 * memory stays low. At ~124k verses this is a few-million-MAC scan — single-digit
 * milliseconds — so no ANN index is needed at this scale.
 */
export class BruteForceVectorStore implements VectorStore {
  readonly dimensions: number;
  readonly size: number;
  private readonly scale: number;
  private readonly vectors: Int8Array;
  private readonly verses: Verse[];

  constructor(dimensions: number, scale: number, shards: ShardData[]) {
    this.dimensions = dimensions;
    this.scale = scale;
    const total = shards.reduce((sum, s) => sum + s.verses.length, 0);
    this.size = total;
    this.vectors = new Int8Array(total * dimensions);
    this.verses = new Array<Verse>(total);

    let row = 0;
    for (const shard of shards) {
      this.vectors.set(shard.vectors, row * dimensions);
      for (const verse of shard.verses) {
        this.verses[row] = verse;
        row++;
      }
    }
  }

  search(query: Float32Array, k: number, filter?: (verse: Verse) => boolean): SearchHit[] {
    const { dimensions: dims, size, vectors, verses, scale } = this;
    const scored: SearchHit[] = [];
    for (let i = 0; i < size; i++) {
      const verse = verses[i] as Verse;
      if (filter && !filter(verse)) continue;
      const base = i * dims;
      let dot = 0;
      for (let d = 0; d < dims; d++) {
        dot += (query[d] as number) * (vectors[base + d] as number);
      }
      scored.push({ verse, score: dot / scale });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  /** All verses of one chapter in one translation, in verse order (for the chapter reader). */
  getChapter(book: string, chapter: number, translation: Translation): Verse[] {
    return this.verses
      .filter((v) => v.book === book && v.chapter === chapter && v.translation === translation)
      .sort((a, b) => a.verse - b.verse);
  }
}
