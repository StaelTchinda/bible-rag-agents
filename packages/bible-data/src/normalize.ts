import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchTranslation } from "./getbible";
import { NORMALIZED_DIR, RAW_DIR } from "./paths";
import type { NormalizedBible } from "./schema";
import { MVP_SOURCES } from "./sources";

/** Path of the normalized JSON file for a translation id. */
export function normalizedPath(id: string): string {
  return path.join(NORMALIZED_DIR, `${id.toLowerCase()}.json`);
}

/** Fetch + normalize every MVP source into canonical verse JSON on disk. */
export async function ingest(): Promise<void> {
  await mkdir(NORMALIZED_DIR, { recursive: true });
  for (const src of MVP_SOURCES) {
    process.stdout.write(`Fetching ${src.id} (getbible:${src.abbr}) … `);
    const verses = await fetchTranslation(src.id, src.abbr, RAW_DIR);
    const bible: NormalizedBible = {
      translation: src.id,
      lang: verses[0]?.lang ?? "en",
      verseCount: verses.length,
      verses,
    };
    const out = normalizedPath(src.id);
    await writeFile(out, JSON.stringify(bible));
    console.log(`${verses.length} verses → ${path.relative(process.cwd(), out)}`);
  }
}
