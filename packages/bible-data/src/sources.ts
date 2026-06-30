import type { Translation } from "@bible-rag/core";

/** A translation sourced from the getbible.net v2 API. */
export interface GetBibleSource {
  id: Translation;
  /** getbible.net translation abbreviation. */
  abbr: string;
}

/**
 * MVP corpus: one English + one German text, both public domain and both served
 * by getbible's unified API (one parser).
 *
 * Post-MVP additions:
 *   - KJV ("kjv") — available on getbible.
 *   - Luther 1912 — NOT on getbible (only luther1545); needs a dedicated source
 *     + parser. Tracked as a follow-up.
 */
export const MVP_SOURCES: readonly GetBibleSource[] = [
  { id: "WEB", abbr: "web" },
  { id: "ELBERFELDER1905", abbr: "elberfelder1905" },
];
