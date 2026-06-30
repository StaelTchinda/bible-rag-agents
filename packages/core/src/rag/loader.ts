import type { Verse } from "../scripture/types";
import { BruteForceVectorStore, type ShardData } from "./brute-force-store";
import type { PrebuiltIndexManifest } from "./index-format";

export interface LoadIndexOptions {
  /** If set, throw when the index was built with a different embedding model. */
  expectModel?: string;
  fetchImpl?: typeof fetch;
  onProgress?: (loaded: number, total: number) => void;
}

/** Load a prebuilt index over HTTP (browser) into an in-memory brute-force store. */
export async function loadPrebuiltIndex(
  baseUrl: string,
  opts: LoadIndexOptions = {},
): Promise<BruteForceVectorStore> {
  const f = opts.fetchImpl ?? fetch;
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  const manifest = (await (await f(`${base}manifest.json`)).json()) as PrebuiltIndexManifest;
  if (opts.expectModel && manifest.embeddingModel !== opts.expectModel) {
    throw new Error(
      `Index/embedder mismatch: index built with "${manifest.embeddingModel}", runtime expects "${opts.expectModel}".`,
    );
  }

  const shards: ShardData[] = [];
  const total = manifest.shards.length;
  for (let i = 0; i < total; i++) {
    const shard = manifest.shards[i] as PrebuiltIndexManifest["shards"][number];
    const [buf, verses] = await Promise.all([
      f(`${base}${shard.vectors}`).then((r) => r.arrayBuffer()),
      f(`${base}${shard.verses}`).then((r) => r.json() as Promise<Verse[]>),
    ]);
    shards.push({ vectors: new Int8Array(buf), verses });
    opts.onProgress?.(i + 1, total);
  }
  return new BruteForceVectorStore(manifest.dimensions, manifest.scale, shards);
}
