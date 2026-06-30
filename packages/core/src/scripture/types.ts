/** Languages the corpus currently supports. */
export type Lang = "en" | "de";

/** Canonical translation ids used throughout the system. */
export type Translation = "WEB" | "KJV" | "LUTHER1912" | "ELBERFELDER1905";

export interface TranslationMeta {
  id: Translation;
  /** Human-readable name. */
  name: string;
  lang: Lang;
  /** Short label for UI badges. */
  abbreviation: string;
  publicDomain: boolean;
}

/** A single verse in one translation. The atomic unit of retrieval and citation. */
export interface Verse {
  /** Canonical, language-independent reference, e.g. "JHN.3.16". */
  ref: string;
  /** USFM book id, e.g. "JHN". */
  book: string;
  chapter: number;
  verse: number;
  translation: Translation;
  lang: Lang;
  text: string;
}

export const TRANSLATIONS: Record<Translation, TranslationMeta> = {
  WEB: {
    id: "WEB",
    name: "World English Bible",
    lang: "en",
    abbreviation: "WEB",
    publicDomain: true,
  },
  KJV: {
    id: "KJV",
    name: "King James Version",
    lang: "en",
    abbreviation: "KJV",
    publicDomain: true,
  },
  LUTHER1912: {
    id: "LUTHER1912",
    name: "Luther 1912",
    lang: "de",
    abbreviation: "LUT",
    publicDomain: true,
  },
  ELBERFELDER1905: {
    id: "ELBERFELDER1905",
    name: "Elberfelder 1905",
    lang: "de",
    abbreviation: "ELB",
    publicDomain: true,
  },
};
