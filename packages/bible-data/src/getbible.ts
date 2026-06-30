import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { BOOKS, TRANSLATIONS, type Translation, type Verse, makeRef } from "@bible-rag/core";

const API = "https://api.getbible.net/v2";

interface GetBibleVerse {
  chapter: number;
  verse: number;
  name: string;
  text: string;
}
interface GetBibleChapter {
  chapter: number;
  name: string;
  verses: GetBibleVerse[];
}
interface GetBibleBook {
  abbreviation: string;
  lang: string;
  nr: number;
  name: string;
  chapters: GetBibleChapter[];
}

/** Run `fn` over `items` with bounded concurrency, preserving input order. */
async function pMap<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const i = cursor++;
      results[i] = await fn(items[i] as T);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Fetch one book, caching the raw response under `rawDir/<abbr>/<nr>.json`. */
async function fetchBookRaw(abbr: string, nr: number, rawDir: string): Promise<GetBibleBook> {
  const cacheFile = path.join(rawDir, abbr, `${nr}.json`);
  if (existsSync(cacheFile)) {
    return JSON.parse(await readFile(cacheFile, "utf8")) as GetBibleBook;
  }
  const res = await fetch(`${API}/${abbr}/${nr}.json`);
  if (!res.ok) {
    throw new Error(`getbible ${abbr}/${nr}: HTTP ${res.status}`);
  }
  const json = (await res.json()) as GetBibleBook;
  await mkdir(path.dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, JSON.stringify(json));
  return json;
}

/** Download a full translation from getbible and flatten it into canonical verses. */
export async function fetchTranslation(
  id: Translation,
  abbr: string,
  rawDir: string,
): Promise<Verse[]> {
  const meta = TRANSLATIONS[id];
  const perBook = await pMap(BOOKS, 8, (book) => fetchBookRaw(abbr, book.nr, rawDir));

  const verses: Verse[] = [];
  for (let i = 0; i < BOOKS.length; i++) {
    const book = BOOKS[i] as (typeof BOOKS)[number];
    const raw = perBook[i] as GetBibleBook;
    for (const ch of raw.chapters) {
      for (const v of ch.verses) {
        const text = v.text.trim().replace(/\s+/g, " ");
        if (!text) continue;
        verses.push({
          ref: makeRef(book.id, ch.chapter, v.verse),
          book: book.id,
          chapter: ch.chapter,
          verse: v.verse,
          translation: id,
          lang: meta.lang,
          text,
        });
      }
    }
  }
  return verses;
}
