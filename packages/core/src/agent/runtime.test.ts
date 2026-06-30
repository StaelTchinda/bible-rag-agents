import { describe, expect, it } from "vitest";
import { berean } from "../personas/berean";
import { StubLLMProvider } from "../providers/stub.provider";
import type { EmbeddingProvider } from "../providers/types";
import { BruteForceVectorStore } from "../rag/brute-force-store";
import type { Verse } from "../scripture/types";
import { type AgentEvent, runAgent } from "./runtime";

const DIMS = 3;

function makeVerse(ref: string, book: string, chapter: number, verse: number, text: string): Verse {
  return { ref, book, chapter, verse, translation: "WEB", lang: "en", text };
}

// Three orthogonal unit vectors quantized to int8, aligned with the verses below.
const vectors = new Int8Array([127, 0, 0, 0, 127, 0, 0, 0, 127]);
const verses: Verse[] = [
  makeVerse("GEN.1.1", "GEN", 1, 1, "In the beginning God created the heavens and the earth."),
  makeVerse(
    "JHN.3.16",
    "JHN",
    3,
    16,
    "For God so loved the world, that he gave his one and only Son.",
  ),
  makeVerse("PSA.23.1", "PSA", 23, 1, "Yahweh is my shepherd; I shall lack nothing."),
];
const store = new BruteForceVectorStore(DIMS, 127, [{ vectors, verses }]);

// Fake embedder: every query points along the second axis → nearest is JHN.3.16.
const embedder: EmbeddingProvider = {
  id: "fake",
  modelId: "fake",
  dimensions: DIMS,
  init: () => Promise.resolve(),
  embed: (texts) => Promise.resolve(texts.map(() => new Float32Array([0, 1, 0]))),
};

describe("runAgent", () => {
  it("retrieves grounding verses, then streams a grounded answer", async () => {
    const events: AgentEvent[] = [];
    for await (const event of runAgent({
      persona: berean,
      query: "What is God's love?",
      providers: { llm: new StubLLMProvider(), embedder },
      store,
    })) {
      events.push(event);
    }

    const citations = events.find((e) => e.type === "citations");
    expect(citations?.type).toBe("citations");
    if (citations?.type === "citations") {
      expect(citations.citations[0]?.ref).toBe("JHN.3.16");
    }

    const last = events.at(-1);
    expect(last?.type).toBe("done");
    if (last?.type === "done") {
      expect(last.text.length).toBeGreaterThan(0);
    }

    // Citations are emitted before any generated token.
    const citationsIdx = events.findIndex((e) => e.type === "citations");
    const firstTokenIdx = events.findIndex((e) => e.type === "token");
    expect(citationsIdx).toBeLessThan(firstTokenIdx);

    // The Berean carries no guardrail label.
    expect(events.some((e) => e.type === "label")).toBe(false);
  });
});
