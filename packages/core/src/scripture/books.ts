export interface BookMeta {
  /** 1-based canonical order (Protestant); matches getbible book numbers. */
  nr: number;
  /** USFM book id, e.g. "JHN". */
  id: string;
  /** English display name. */
  name: string;
  testament: "OT" | "NT";
}

/** The 66-book Protestant canon in order. `nr` aligns with getbible's book numbering. */
export const BOOKS: readonly BookMeta[] = [
  { nr: 1, id: "GEN", name: "Genesis", testament: "OT" },
  { nr: 2, id: "EXO", name: "Exodus", testament: "OT" },
  { nr: 3, id: "LEV", name: "Leviticus", testament: "OT" },
  { nr: 4, id: "NUM", name: "Numbers", testament: "OT" },
  { nr: 5, id: "DEU", name: "Deuteronomy", testament: "OT" },
  { nr: 6, id: "JOS", name: "Joshua", testament: "OT" },
  { nr: 7, id: "JDG", name: "Judges", testament: "OT" },
  { nr: 8, id: "RUT", name: "Ruth", testament: "OT" },
  { nr: 9, id: "1SA", name: "1 Samuel", testament: "OT" },
  { nr: 10, id: "2SA", name: "2 Samuel", testament: "OT" },
  { nr: 11, id: "1KI", name: "1 Kings", testament: "OT" },
  { nr: 12, id: "2KI", name: "2 Kings", testament: "OT" },
  { nr: 13, id: "1CH", name: "1 Chronicles", testament: "OT" },
  { nr: 14, id: "2CH", name: "2 Chronicles", testament: "OT" },
  { nr: 15, id: "EZR", name: "Ezra", testament: "OT" },
  { nr: 16, id: "NEH", name: "Nehemiah", testament: "OT" },
  { nr: 17, id: "EST", name: "Esther", testament: "OT" },
  { nr: 18, id: "JOB", name: "Job", testament: "OT" },
  { nr: 19, id: "PSA", name: "Psalms", testament: "OT" },
  { nr: 20, id: "PRO", name: "Proverbs", testament: "OT" },
  { nr: 21, id: "ECC", name: "Ecclesiastes", testament: "OT" },
  { nr: 22, id: "SNG", name: "Song of Solomon", testament: "OT" },
  { nr: 23, id: "ISA", name: "Isaiah", testament: "OT" },
  { nr: 24, id: "JER", name: "Jeremiah", testament: "OT" },
  { nr: 25, id: "LAM", name: "Lamentations", testament: "OT" },
  { nr: 26, id: "EZK", name: "Ezekiel", testament: "OT" },
  { nr: 27, id: "DAN", name: "Daniel", testament: "OT" },
  { nr: 28, id: "HOS", name: "Hosea", testament: "OT" },
  { nr: 29, id: "JOL", name: "Joel", testament: "OT" },
  { nr: 30, id: "AMO", name: "Amos", testament: "OT" },
  { nr: 31, id: "OBA", name: "Obadiah", testament: "OT" },
  { nr: 32, id: "JON", name: "Jonah", testament: "OT" },
  { nr: 33, id: "MIC", name: "Micah", testament: "OT" },
  { nr: 34, id: "NAM", name: "Nahum", testament: "OT" },
  { nr: 35, id: "HAB", name: "Habakkuk", testament: "OT" },
  { nr: 36, id: "ZEP", name: "Zephaniah", testament: "OT" },
  { nr: 37, id: "HAG", name: "Haggai", testament: "OT" },
  { nr: 38, id: "ZEC", name: "Zechariah", testament: "OT" },
  { nr: 39, id: "MAL", name: "Malachi", testament: "OT" },
  { nr: 40, id: "MAT", name: "Matthew", testament: "NT" },
  { nr: 41, id: "MRK", name: "Mark", testament: "NT" },
  { nr: 42, id: "LUK", name: "Luke", testament: "NT" },
  { nr: 43, id: "JHN", name: "John", testament: "NT" },
  { nr: 44, id: "ACT", name: "Acts", testament: "NT" },
  { nr: 45, id: "ROM", name: "Romans", testament: "NT" },
  { nr: 46, id: "1CO", name: "1 Corinthians", testament: "NT" },
  { nr: 47, id: "2CO", name: "2 Corinthians", testament: "NT" },
  { nr: 48, id: "GAL", name: "Galatians", testament: "NT" },
  { nr: 49, id: "EPH", name: "Ephesians", testament: "NT" },
  { nr: 50, id: "PHP", name: "Philippians", testament: "NT" },
  { nr: 51, id: "COL", name: "Colossians", testament: "NT" },
  { nr: 52, id: "1TH", name: "1 Thessalonians", testament: "NT" },
  { nr: 53, id: "2TH", name: "2 Thessalonians", testament: "NT" },
  { nr: 54, id: "1TI", name: "1 Timothy", testament: "NT" },
  { nr: 55, id: "2TI", name: "2 Timothy", testament: "NT" },
  { nr: 56, id: "TIT", name: "Titus", testament: "NT" },
  { nr: 57, id: "PHM", name: "Philemon", testament: "NT" },
  { nr: 58, id: "HEB", name: "Hebrews", testament: "NT" },
  { nr: 59, id: "JAS", name: "James", testament: "NT" },
  { nr: 60, id: "1PE", name: "1 Peter", testament: "NT" },
  { nr: 61, id: "2PE", name: "2 Peter", testament: "NT" },
  { nr: 62, id: "1JN", name: "1 John", testament: "NT" },
  { nr: 63, id: "2JN", name: "2 John", testament: "NT" },
  { nr: 64, id: "3JN", name: "3 John", testament: "NT" },
  { nr: 65, id: "JUD", name: "Jude", testament: "NT" },
  { nr: 66, id: "REV", name: "Revelation", testament: "NT" },
];

const BY_NR = new Map<number, BookMeta>(BOOKS.map((b) => [b.nr, b]));
const BY_ID = new Map<string, BookMeta>(BOOKS.map((b) => [b.id, b]));

export function bookByNr(nr: number): BookMeta | undefined {
  return BY_NR.get(nr);
}

export function bookById(id: string): BookMeta | undefined {
  return BY_ID.get(id);
}

/** Build a canonical reference like "JHN.3.16". */
export function makeRef(bookId: string, chapter: number, verse: number): string {
  return `${bookId}.${chapter}.${verse}`;
}

export interface ParsedRef {
  book: string;
  chapter: number;
  verse: number;
}

/** Parse a canonical reference; returns undefined if malformed. */
export function parseRef(ref: string): ParsedRef | undefined {
  const parts = ref.split(".");
  if (parts.length !== 3) return undefined;
  const [book, c, v] = parts;
  const chapter = Number(c);
  const verse = Number(v);
  if (!book || !Number.isInteger(chapter) || !Number.isInteger(verse)) return undefined;
  return { book, chapter, verse };
}

/** Human-friendly reference, e.g. "JHN.3.16" → "John 3:16". */
export function formatRef(ref: string): string {
  const parsed = parseRef(ref);
  if (!parsed) return ref;
  return `${BY_ID.get(parsed.book)?.name ?? parsed.book} ${parsed.chapter}:${parsed.verse}`;
}
