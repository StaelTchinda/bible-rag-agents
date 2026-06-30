import type { ChatMessage, EmbeddingProvider, LLMProvider } from "../providers/types";
import { type Citation, type RetrievalParams, retrieve } from "../rag/retriever";
import type { VectorStore } from "../rag/vector-store";
import type { PersonaConfig } from "./persona";
import { assembleMessages } from "./prompt-assembler";

export interface AgentProviders {
  llm: LLMProvider;
  embedder: EmbeddingProvider;
}

export interface AgentRunRequest {
  persona: PersonaConfig;
  query: string;
  history?: ChatMessage[];
  providers: AgentProviders;
  store: VectorStore;
  overrides?: Partial<RetrievalParams>;
}

export type AgentEvent =
  | { type: "label"; message: string }
  | { type: "citations"; citations: Citation[] }
  | { type: "token"; delta: string }
  | { type: "done"; text: string };

/**
 * Run one agent turn: emit any guardrail label, retrieve grounding verses (emitted
 * as data before generation so the UI can render citations immediately), then
 * stream the model's answer. The same generator drives the browser, server, and CLI.
 */
export async function* runAgent(req: AgentRunRequest): AsyncGenerator<AgentEvent> {
  const { persona, providers, store } = req;

  if (persona.guardrail?.alwaysLabel) {
    yield { type: "label", message: persona.guardrail.alwaysLabel };
  }

  const citations = await retrieve(req.query, providers.embedder, store, {
    ...persona.retrieval,
    ...req.overrides,
  });
  yield { type: "citations", citations };

  const messages = assembleMessages(persona, req.query, citations, req.history ?? []);

  let text = "";
  for await (const chunk of providers.llm.stream({
    messages,
    temperature: persona.generation.temperature,
    maxTokens: persona.generation.maxTokens,
  })) {
    if (chunk.delta) {
      text += chunk.delta;
      yield { type: "token", delta: chunk.delta };
    }
    if (chunk.done) break;
  }

  yield { type: "done", text };
}
