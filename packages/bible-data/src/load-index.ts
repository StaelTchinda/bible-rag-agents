import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  BruteForceVectorStore,
  type PrebuiltIndexManifest,
  type ShardData,
  type Verse,
} from "@bible-rag/core";
import { DIST_INDEX_DIR } from "./paths";

/** Load the prebuilt index from a directory (Node-side, for the CLI and eval). */
export async function loadIndexFromDir(
  dir: string = DIST_INDEX_DIR,
): Promise<BruteForceVectorStore> {
  const manifest = JSON.parse(
    await readFile(path.join(dir, "manifest.json"), "utf8"),
  ) as PrebuiltIndexManifest;

  const shards: ShardData[] = [];
  for (const shard of manifest.shards) {
    const buf = await readFile(path.join(dir, shard.vectors));
    const verses = JSON.parse(await readFile(path.join(dir, shard.verses), "utf8")) as Verse[];
    shards.push({
      vectors: new Int8Array(buf.buffer, buf.byteOffset, buf.byteLength),
      verses,
    });
  }
  return new BruteForceVectorStore(manifest.dimensions, manifest.scale, shards);
}
