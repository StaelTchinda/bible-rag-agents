import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PrebuiltIndexManifest, ShardMeta } from "@bible-rag/core";
import { EMBED_DIMS, EMBED_MODEL, embedBatch } from "./embed";
import { normalizedPath } from "./normalize";
import { DIST_INDEX_DIR, WEB_INDEX_DIR } from "./paths";
import { INT8_SCALE, quantizeInt8 } from "./quantize";
import type { NormalizedBible } from "./schema";
import { MVP_SOURCES } from "./sources";

const BATCH = 64;

/** Embed every verse, quantize to int8, and write the shipped static index. */
export async function buildIndex(): Promise<void> {
  await mkdir(DIST_INDEX_DIR, { recursive: true });
  const shards: ShardMeta[] = [];

  for (const src of MVP_SOURCES) {
    const bible = JSON.parse(await readFile(normalizedPath(src.id), "utf8")) as NormalizedBible;
    const n = bible.verses.length;
    const quantized = new Int8Array(n * EMBED_DIMS);

    process.stdout.write(`Embedding ${src.id} (${n} verses) `);
    for (let start = 0; start < n; start += BATCH) {
      const batch = bible.verses.slice(start, start + BATCH);
      const vecs = await embedBatch(
        batch.map((v) => v.text),
        "passage",
      );
      for (let j = 0; j < vecs.length; j++) {
        quantized.set(quantizeInt8(vecs[j] as Float32Array), (start + j) * EMBED_DIMS);
      }
      if (start % (BATCH * 20) === 0) process.stdout.write(".");
    }
    process.stdout.write(" done\n");

    const id = src.id.toLowerCase();
    const vectorsFile = `vectors.${id}.bin`;
    const versesFile = `verses.${id}.json`;
    await writeFile(path.join(DIST_INDEX_DIR, vectorsFile), Buffer.from(quantized.buffer));
    await writeFile(path.join(DIST_INDEX_DIR, versesFile), JSON.stringify(bible.verses));
    shards.push({ translation: src.id, count: n, vectors: vectorsFile, verses: versesFile });
  }

  const manifest: PrebuiltIndexManifest = {
    embeddingModel: EMBED_MODEL,
    dimensions: EMBED_DIMS,
    normalized: true,
    quantization: "int8",
    scale: INT8_SCALE,
    shards,
  };
  await writeFile(path.join(DIST_INDEX_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  // Ship the index into the web app's static assets so it loads standalone.
  await mkdir(WEB_INDEX_DIR, { recursive: true });
  await cp(DIST_INDEX_DIR, WEB_INDEX_DIR, { recursive: true });
  console.log(
    `Index written to ${path.relative(process.cwd(), DIST_INDEX_DIR)} and copied to the web app.`,
  );
}
