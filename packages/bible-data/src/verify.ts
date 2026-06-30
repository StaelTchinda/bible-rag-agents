import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { BOOKS } from "@bible-rag/core";
import { normalizedPath } from "./normalize";
import type { NormalizedBible } from "./schema";
import { MVP_SOURCES } from "./sources";

/** Sanity-check normalized files: verse counts and full 66-book coverage. */
export async function verify(): Promise<boolean> {
  let ok = true;
  for (const src of MVP_SOURCES) {
    const file = normalizedPath(src.id);
    if (!existsSync(file)) {
      console.log(`✗ ${src.id}: missing (run \`pnpm ingest\` first)`);
      ok = false;
      continue;
    }
    const bible = JSON.parse(await readFile(file, "utf8")) as NormalizedBible;
    const books = new Set(bible.verses.map((v) => v.book));
    const missing = BOOKS.filter((b) => !books.has(b.id)).map((b) => b.id);
    const healthy =
      bible.verseCount === bible.verses.length && missing.length === 0 && bible.verseCount > 30_000;
    ok &&= healthy;
    const missingNote = missing.length ? `, missing: ${missing.join(", ")}` : "";
    console.log(
      `${healthy ? "✓" : "✗"} ${src.id}: ${bible.verseCount} verses, ${books.size}/66 books${missingNote}`,
    );
  }
  return ok;
}
