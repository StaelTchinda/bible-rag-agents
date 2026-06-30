import type { Citation } from "@bible-rag/core";
import type { ChatTurn } from "../hooks/useBibleAgent";
import { CitationCard } from "./CitationCard";
import { InlineAnswer } from "./InlineAnswer";

export function ChatMessage({
  turn,
  onOpenChapter,
}: {
  turn: ChatTurn;
  onOpenChapter: (citation: Citation) => void;
}) {
  if (turn.role === "user") {
    return <div className="bubble user">{turn.text}</div>;
  }

  // Inline references default to the English (WEB) chapter.
  const openRef = (ref: string) => onOpenChapter({ ref, translation: "WEB", text: "", score: 0 });
  const hasCitations = turn.citations && turn.citations.length > 0;

  return (
    <div className="bubble assistant">
      {turn.personaName && <div className="persona-name">{turn.personaName}</div>}
      {turn.label && <div className="deceiver-banner">{turn.label}</div>}
      <div className="bubble-text">
        <InlineAnswer text={turn.text} onOpenRef={openRef} />
        {turn.pending && <span className="caret" aria-hidden="true" />}
      </div>
      {hasCitations && (
        <ul className="citations">
          {turn.citations?.map((c) => (
            <CitationCard key={c.ref} citation={c} onOpenChapter={onOpenChapter} />
          ))}
        </ul>
      )}
    </div>
  );
}
