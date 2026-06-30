import { type Translation, type Verse, bookById } from "@bible-rag/core";
import { type MouseEvent, useEffect, useRef } from "react";

export interface ChapterView {
  book: string;
  chapter: number;
  translation: Translation;
  highlightRef: string;
  verses: Verse[];
}

export function ChapterReader({ view, onClose }: { view: ChapterView; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const highlight = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    highlight.current?.scrollIntoView({ block: "center" });
    return () => el?.close();
  }, []);

  // A click whose target is the dialog itself landed on the ::backdrop.
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialog.current) onClose();
  };

  const bookName = bookById(view.book)?.name ?? view.book;

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-label={`${bookName} ${view.chapter}`}
      onClick={onBackdrop}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <h3>
            {bookName} {view.chapter} · {view.translation}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="modal-body">
          {view.verses.length === 0 && <p>Chapter text isn't available in this translation.</p>}
          {view.verses.map((v) => {
            const isHighlight = v.ref === view.highlightRef;
            return (
              <p
                key={v.ref}
                ref={isHighlight ? highlight : undefined}
                className={isHighlight ? "verse highlight" : "verse"}
              >
                <sup className="verse-num">{v.verse}</sup> {v.text}
              </p>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}
