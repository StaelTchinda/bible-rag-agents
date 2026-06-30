import type { Translation } from "../scripture/types";

export type Quantization = "int8" | "float32";

export interface ShardMeta {
  translation: Translation;
  count: number;
  /** Vector blob filename, relative to the index dir. */
  vectors: string;
  /** Verses JSON filename (same row order as the vectors), relative to the index dir. */
  verses: string;
}

/**
 * Describes a prebuilt embedding index. The runtime checks `embeddingModel` and
 * `dimensions` against the active embedder at load time and refuses a mismatch,
 * so a stale index can never silently corrupt retrieval.
 */
export interface PrebuiltIndexManifest {
  embeddingModel: string;
  dimensions: number;
  /** Vectors are L2-normalized, so cosine similarity equals the dot product. */
  normalized: true;
  quantization: Quantization;
  /** int8 dequantization: floatValue = int8Value / scale. */
  scale: number;
  shards: ShardMeta[];
}
