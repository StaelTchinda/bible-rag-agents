import { type FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";

/**
 * MVP embedder: multilingual-e5-small — 384 dims, multilingual (EN+DE), and
 * well-supported in transformers.js. Swappable for EmbeddingGemma later; the
 * index manifest records which model produced it so the runtime can't mismatch.
 */
export const EMBED_MODEL = "Xenova/multilingual-e5-small";
export const EMBED_DIMS = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | undefined;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", EMBED_MODEL);
  }
  return extractorPromise;
}

/** e5 models expect a "query: " / "passage: " task prefix. */
function withPrefix(kind: "query" | "passage", text: string): string {
  return `${kind}: ${text}`;
}

/** Embed a batch of texts into L2-normalized vectors. */
export async function embedBatch(
  texts: string[],
  kind: "query" | "passage",
): Promise<Float32Array[]> {
  const extractor = await getExtractor();
  const tensor = await extractor(
    texts.map((t) => withPrefix(kind, t)),
    { pooling: "mean", normalize: true },
  );
  const data = tensor.data as Float32Array;
  const dims = tensor.dims.at(-1) ?? EMBED_DIMS;
  const out: Float32Array[] = [];
  for (let i = 0; i < texts.length; i++) {
    out.push(Float32Array.from(data.subarray(i * dims, (i + 1) * dims)));
  }
  return out;
}
