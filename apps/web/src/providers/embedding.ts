import type { EmbeddingKind, EmbeddingProvider } from "@bible-rag/core";
import { type FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";

/** Must match the model the shipped index was built with (see manifest.embeddingModel). */
export const EMBED_MODEL = "Xenova/multilingual-e5-small";
export const EMBED_DIMS = 384;

/** Browser embedder via transformers.js. Mirrors the build-time embedder exactly. */
export class TransformersEmbeddingProvider implements EmbeddingProvider {
  readonly id = "transformers";
  readonly modelId = EMBED_MODEL;
  readonly dimensions = EMBED_DIMS;
  private extractor: FeatureExtractionPipeline | undefined;

  async init(): Promise<void> {
    // transformers.js `pipeline` has a massive overload union that trips TS2590 when
    // options are passed; narrow it to the one shape we use. fp32 matches the index build.
    const createPipeline = pipeline as unknown as (
      task: "feature-extraction",
      model: string,
      options: { dtype: string },
    ) => Promise<FeatureExtractionPipeline>;
    this.extractor = await createPipeline("feature-extraction", EMBED_MODEL, { dtype: "fp32" });
  }

  async embed(texts: string[], kind: EmbeddingKind): Promise<Float32Array[]> {
    if (!this.extractor) throw new Error("TransformersEmbeddingProvider not initialized");
    const prefix = kind === "query" ? "query: " : "passage: ";
    const tensor = await this.extractor(
      texts.map((t) => prefix + t),
      { pooling: "mean", normalize: true },
    );
    const data = tensor.data as Float32Array;
    const dims = tensor.dims.at(-1) ?? EMBED_DIMS;
    return texts.map((_, i) => Float32Array.from(data.subarray(i * dims, (i + 1) * dims)));
  }
}
