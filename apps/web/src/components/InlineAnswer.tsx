import { parseInlineRefs } from "@bible-rag/core";

/** Render answer text with detected verse references turned into clickable links. */
export function InlineAnswer({
  text,
  onOpenRef,
}: {
  text: string;
  onOpenRef: (ref: string) => void;
}) {
  const segments = parseInlineRefs(text);
  let offset = 0;
  return (
    <>
      {segments.map((seg) => {
        const key = `${offset}`;
        offset += seg.type === "text" ? seg.value.length : seg.label.length;
        if (seg.type === "text") return <span key={key}>{seg.value}</span>;
        return (
          <button key={key} type="button" className="inline-ref" onClick={() => onOpenRef(seg.ref)}>
            {seg.label}
          </button>
        );
      })}
    </>
  );
}
