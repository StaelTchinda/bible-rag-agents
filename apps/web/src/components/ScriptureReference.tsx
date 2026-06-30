import { type Citation, formatRef } from "@bible-rag/core";

/**
 * A compact, interactive verse reference:
 * - hover (or keyboard-focus) reveals the full verse text + any parallel translations,
 * - click opens the full chapter in the reader.
 */
export function ScriptureReference({
  citation,
  onOpenChapter,
}: {
  citation: Citation;
  onOpenChapter: (citation: Citation) => void;
}) {
  const label = formatRef(citation.ref);
  return (
    <span className="scripture-ref">
      <button
        type="button"
        className="scripture-ref-btn"
        onClick={() => onOpenChapter(citation)}
        title="Open the full chapter"
      >
        {label} <span className="scripture-ref-trans">{citation.translation}</span>
      </button>
      <span className="scripture-tooltip" role="tooltip">
        <strong className="scripture-tooltip-head">
          {label} · {citation.translation}
        </strong>
        <span className="scripture-tooltip-text">{citation.text}</span>
        {citation.parallels?.map((p) => (
          <span key={p.translation} className="scripture-tooltip-parallel">
            <em>{p.translation}:</em> {p.text}
          </span>
        ))}
        <span className="scripture-tooltip-hint">Click to read the full chapter →</span>
      </span>
    </span>
  );
}
