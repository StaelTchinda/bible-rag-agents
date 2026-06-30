import { PERSONA_LIST, type PersonaConfig } from "@bible-rag/core";

const ICONS: Record<string, string> = {
  berean: "📖",
  historian: "🏺",
  moralist: "⚖️",
  comforter: "🕊️",
  jester: "🃏",
  deceiver: "😈",
};

export function PersonaPicker({
  selectedId,
  onSelect,
  disabled,
}: {
  selectedId: string;
  onSelect: (persona: PersonaConfig) => void;
  disabled?: boolean;
}) {
  return (
    <div className="persona-picker" role="tablist" aria-label="Choose an agent">
      {PERSONA_LIST.map((persona) => (
        <button
          key={persona.id}
          type="button"
          role="tab"
          aria-selected={persona.id === selectedId}
          className={persona.id === selectedId ? "persona-tab active" : "persona-tab"}
          onClick={() => onSelect(persona)}
          disabled={disabled}
          title={persona.description}
        >
          <span aria-hidden="true">{ICONS[persona.id] ?? "•"}</span> {persona.displayName}
        </button>
      ))}
    </div>
  );
}
