import type { Lang, Translation, Verse } from "@bible-rag/core";

/** On-disk shape written by `ingest` and consumed by `build-index`. */
export interface NormalizedBible {
  translation: Translation;
  lang: Lang;
  verseCount: number;
  verses: Verse[];
}
