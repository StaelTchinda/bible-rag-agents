import {
  type BruteForceVectorStore,
  type ChatMessage,
  type Citation,
  type EmbeddingProvider,
  type LLMProvider,
  type PersonaConfig,
  StubLLMProvider,
  type Translation,
  type Verse,
  loadPrebuiltIndex,
  runAgent,
} from "@bible-rag/core";
import { useCallback, useRef, useState } from "react";
import { EMBED_DIMS, EMBED_MODEL, TransformersEmbeddingProvider } from "../providers/embedding";
import { WebLLMProvider, hasWebGPU } from "../providers/webllm";

/**
 * `?stub` dev mode: a deterministic LLM + a fixed-vector embedder so the chat,
 * references, and chapter reader can be exercised without downloading any model
 * (only the local index loads). Real answers need WebGPU + the on-device model.
 */
const fakeEmbedder: EmbeddingProvider = {
  id: "stub-embed",
  modelId: "stub",
  dimensions: EMBED_DIMS,
  init: () => Promise.resolve(),
  embed: (texts) =>
    Promise.resolve(
      texts.map(() => {
        const v = new Float32Array(EMBED_DIMS);
        v[0] = 1;
        return v;
      }),
    ),
};

export type AgentStatus = "idle" | "loading" | "ready" | "generating" | "error";

export interface ChatTurn {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** Assistant-only: which agent produced this answer. */
  personaName?: string;
  /** Assistant-only: guardrail label (e.g. the Deceiver's warning). */
  label?: string;
  /** Assistant-only: retrieved verses backing the answer. */
  citations?: Citation[];
  /** Assistant-only: still streaming. */
  pending?: boolean;
}

export function useBibleAgent() {
  const [status, setStatus] = useState<AgentStatus>("idle");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  const store = useRef<BruteForceVectorStore | undefined>(undefined);
  const llm = useRef<LLMProvider | undefined>(undefined);
  const embedder = useRef<EmbeddingProvider | undefined>(undefined);
  const turnsRef = useRef<ChatTurn[]>([]);
  const idRef = useRef(0);

  const commit = useCallback((next: ChatTurn[]) => {
    turnsRef.current = next;
    setTurns(next);
  }, []);

  const updateTurn = useCallback(
    (id: number, patch: (turn: ChatTurn) => ChatTurn) => {
      commit(turnsRef.current.map((t) => (t.id === id ? patch(t) : t)));
    },
    [commit],
  );

  const init = useCallback(async () => {
    const stub =
      typeof location !== "undefined" && new URLSearchParams(location.search).has("stub");
    if (!stub && !hasWebGPU()) {
      setError("WebGPU isn't available in this browser. Try a recent Chrome/Edge, or Safari 18+.");
      setStatus("error");
      return;
    }
    try {
      setStatus("loading");
      setProgress("Loading the Scripture index…");
      store.current = await loadPrebuiltIndex("/index", { expectModel: EMBED_MODEL });

      if (stub) {
        embedder.current = fakeEmbedder;
        llm.current = new StubLLMProvider();
        setProgress("");
        setStatus("ready");
        return;
      }

      setProgress("Loading the embedding model…");
      const emb = new TransformersEmbeddingProvider();
      await emb.init();
      embedder.current = emb;

      const model = new WebLLMProvider();
      await model.init((p) =>
        setProgress(p.stage || `Loading model… ${Math.round(p.loaded * 100)}%`),
      );
      llm.current = model;

      setProgress("");
      setStatus("ready");
    } catch (err) {
      setError(String(err));
      setStatus("error");
    }
  }, []);

  const ask = useCallback(
    async (query: string, persona: PersonaConfig) => {
      const s = store.current;
      const l = llm.current;
      const e = embedder.current;
      if (!s || !l || !e) return;

      const history: ChatMessage[] = turnsRef.current.map((t) => ({
        role: t.role,
        content: t.text,
      }));
      const userTurn: ChatTurn = { id: ++idRef.current, role: "user", text: query };
      const assistantId = ++idRef.current;
      const assistantTurn: ChatTurn = {
        id: assistantId,
        role: "assistant",
        personaName: persona.displayName,
        text: "",
        citations: [],
        pending: true,
      };
      commit([...turnsRef.current, userTurn, assistantTurn]);
      setStatus("generating");

      try {
        for await (const event of runAgent({
          persona,
          query,
          history,
          store: s,
          providers: { llm: l, embedder: e },
        })) {
          if (event.type === "label") {
            updateTurn(assistantId, (t) => ({ ...t, label: event.message }));
          } else if (event.type === "citations") {
            updateTurn(assistantId, (t) => ({ ...t, citations: event.citations }));
          } else if (event.type === "token") {
            updateTurn(assistantId, (t) => ({ ...t, text: t.text + event.delta }));
          } else if (event.type === "done") {
            updateTurn(assistantId, (t) => ({ ...t, pending: false }));
          }
        }
      } catch (err) {
        updateTurn(assistantId, (t) => ({
          ...t,
          pending: false,
          text: t.text || `⚠️ ${String(err)}`,
        }));
      } finally {
        setStatus("ready");
      }
    },
    [commit, updateTurn],
  );

  const getChapter = useCallback(
    (book: string, chapter: number, translation: Translation): Verse[] =>
      store.current?.getChapter(book, chapter, translation) ?? [],
    [],
  );

  return { status, progress, error, turns, init, ask, getChapter };
}
