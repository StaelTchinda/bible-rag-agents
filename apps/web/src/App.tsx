import { type Citation, type PersonaConfig, berean, parseRef } from "@bible-rag/core";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ChapterReader, type ChapterView } from "./components/ChapterReader";
import { ChatMessage } from "./components/ChatMessage";
import { PersonaPicker } from "./components/PersonaPicker";
import { ProviderBadge } from "./components/ProviderBadge";
import { useBibleAgent } from "./hooks/useBibleAgent";
import { DEFAULT_WEBLLM_MODEL } from "./providers/webllm";

export function App() {
  const { status, progress, error, turns, init, ask, getChapter } = useBibleAgent();
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<PersonaConfig>(berean);
  const [chapter, setChapter] = useState<ChapterView | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest message in view as the conversation grows and streams.
  useEffect(() => {
    if (turns.length > 0) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns]);

  const started = status === "ready" || status === "generating";
  const generating = status === "generating";

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (query && status === "ready") {
      setInput("");
      void ask(query, persona);
    }
  };

  const openChapter = (citation: Citation) => {
    const parsed = parseRef(citation.ref);
    if (!parsed) return;
    setChapter({
      book: parsed.book,
      chapter: parsed.chapter,
      translation: citation.translation,
      highlightRef: citation.ref,
      verses: getChapter(parsed.book, parsed.chapter, citation.translation),
    });
  };

  return (
    <main className="app">
      <header className="header">
        <h1>📖 Bible RAG Agents</h1>
        <p className="tagline">Six agents, one Scripture-grounded engine — in your browser.</p>
      </header>

      {status === "idle" && (
        <section className="persona">
          <h2>Chat with six very different agents</h2>
          <p>
            The Berean, Historian, Moralist, Comforter, Jester, and the Deceiver — each answers from
            real, cited Scripture. Everything runs locally; nothing leaves your browser.
          </p>
          <button type="button" className="primary" onClick={() => void init()}>
            Load model &amp; Scripture index (one-time · runs locally)
          </button>
        </section>
      )}

      {status === "loading" && (
        <p className="status">
          <span className="spinner" /> {progress}
        </p>
      )}

      {status === "error" && <p className="error">⚠️ {error}</p>}

      {started && (
        <section className="chat">
          <PersonaPicker selectedId={persona.id} onSelect={setPersona} disabled={generating} />
          <p className="persona-hint">{persona.description}</p>
          <ProviderBadge modelId={DEFAULT_WEBLLM_MODEL} />
          <div className="messages">
            {turns.length === 0 && (
              <p className="empty">
                Ask {persona.displayName} anything — e.g. “What does the Bible say about worry?”
              </p>
            )}
            {turns.map((turn) => (
              <ChatMessage key={turn.id} turn={turn} onOpenChapter={openChapter} />
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit} className="ask">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                generating ? `${persona.displayName} is replying…` : `Ask ${persona.displayName}…`
              }
              disabled={generating}
            />
            <button type="submit" className="primary" disabled={generating || input.trim() === ""}>
              {generating ? "…" : "Send"}
            </button>
          </form>
        </section>
      )}

      {chapter && <ChapterReader view={chapter} onClose={() => setChapter(null)} />}
    </main>
  );
}
