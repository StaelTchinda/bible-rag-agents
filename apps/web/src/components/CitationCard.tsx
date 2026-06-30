import type { Citation } from "@bible-rag/core";
import { ScriptureReference } from "./ScriptureReference";

function snippet(text: string, max = 96): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** One retrieved verse: an interactive reference plus a short preview of the text. */
export function CitationCard({
  citation,
  onOpenChapter,
}: {
  citation: Citation;
  onOpenChapter: (citation: Citation) => void;
}) {
  return (
    <li className="citation">
      <ScriptureReference citation={citation} onOpenChapter={onOpenChapter} />
      <span className="citation-snippet">{snippet(citation.text)}</span>
    </li>
  );
}
