import { BOOKS, makeRef } from "./books";

export interface TextSegment {
  type: "text";
  value: string;
}
export interface RefSegment {
  type: "ref";
  ref: string;
  label: string;
}
export type InlineSegment = TextSegment | RefSegment;

const NAME_TO_ID = new Map(BOOKS.map((b) => [b.name, b.id]));

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest names first so "1 John" wins over "John", "Song of Solomon" matches whole.
const NAMES = BOOKS.map((b) => b.name).sort((a, b) => b.length - a.length);
const REF_RE = new RegExp(`\\b(${NAMES.map(escapeRegExp).join("|")})\\s+(\\d+):(\\d+)\\b`, "g");

/**
 * Split text into plain segments and detected verse references (e.g. "John 3:16").
 * Matches English book names only; unmatched text passes through untouched.
 */
export function parseInlineRefs(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let last = 0;
  REF_RE.lastIndex = 0;
  let m = REF_RE.exec(text);
  while (m !== null) {
    const full = m[0] ?? "";
    const name = m[1];
    const chap = m[2];
    const vers = m[3];
    const id = name ? NAME_TO_ID.get(name) : undefined;
    if (id && chap && vers) {
      if (m.index > last) segments.push({ type: "text", value: text.slice(last, m.index) });
      segments.push({ type: "ref", ref: makeRef(id, Number(chap), Number(vers)), label: full });
      last = m.index + full.length;
    }
    m = REF_RE.exec(text);
  }
  if (last < text.length) segments.push({ type: "text", value: text.slice(last) });
  return segments;
}
