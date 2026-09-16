import { describe, expect, it } from "vitest";
import type { EmbeddingProvider } from "../providers/types";
import type { Translation, Verse } from "../scripture/types";
import { BruteForceVectorStore } from "./brute-force-store";
import {
  type RetrievalEvalExample,
  buildRetrievalReport,
  scoreRetrievalExample,
} from "./evaluation";
import { retrieve } from "./retriever";

const embedder: EmbeddingProvider = {
  id: "fixture",
  modelId: "fixture",
  dimensions: 2,
  init: () => Promise.resolve(),
  embed: (texts) =>
    Promise.resolve(
      texts.map((text) =>
        text === "german" ? new Float32Array([0, 1]) : new Float32Array([1, 0]),
      ),
    ),
};

function verse(ref: string, translation: Translation, text = ref): Verse {
  return {
    ref,
    book: ref.slice(0, 3),
    chapter: 1,
    verse: 1,
    translation,
    lang: translation === "WEB" || translation === "KJV" ? "en" : "de",
    text,
  };
}

describe("retrieve", () => {
  it("ranks hits, merges translations, and limits distinct references", async () => {
    const store = new BruteForceVectorStore(2, 127, [
      {
        vectors: new Int8Array([127, 0, 127, 0, 0, 127]),
        verses: [verse("JHN.3.16", "WEB"), verse("JHN.3.16", "KJV"), verse("PSA.23.1", "WEB")],
      },
    ]);

    const citations = await retrieve("english", embedder, store, { k: 1 });

    expect(citations).toHaveLength(1);
    expect(citations[0]?.ref).toBe("JHN.3.16");
    expect(citations[0]?.parallels).toEqual([{ translation: "KJV", text: "JHN.3.16" }]);
  });

  it("honors translation and custom filters", async () => {
    const store = new BruteForceVectorStore(2, 127, [
      {
        vectors: new Int8Array([127, 0, 127, 0]),
        verses: [verse("JHN.3.16", "WEB"), verse("JHN.3.16", "LUTHER1912")],
      },
    ]);

    const citations = await retrieve("english", embedder, store, {
      k: 2,
      translations: ["LUTHER1912"],
      filter: (candidate) => candidate.book === "JHN",
    });

    expect(citations).toHaveLength(1);
    expect(citations[0]?.translation).toBe("LUTHER1912");
  });

  it("returns no citations when the embedder returns no vector", async () => {
    const emptyEmbedder = { ...embedder, embed: () => Promise.resolve([]) };
    const store = new BruteForceVectorStore(2, 127, []);

    await expect(retrieve("anything", emptyEmbedder, store, { k: 3 })).resolves.toEqual([]);
  });
});

describe("retrieval evaluation metrics", () => {
  const answerable: RetrievalEvalExample = {
    id: "answerable",
    query: "query",
    relevant: ["JHN.3.16"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
  };
  const unanswerable: RetrievalEvalExample = {
    id: "unanswerable",
    query: "query",
    relevant: [],
    language: "en",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
  };

  it("calculates hit, reciprocal rank, precision, and false positives", () => {
    const relevantResult = scoreRetrievalExample(answerable, [
      { ref: "PSA.23.1" },
      { ref: "JHN.3.16" },
    ]);
    const emptyResult = scoreRetrievalExample(unanswerable, []);
    const falsePositiveResult = scoreRetrievalExample(unanswerable, [{ ref: "GEN.1.1" }]);

    expect(relevantResult).toMatchObject({
      hit: true,
      reciprocalRank: 0.5,
      precision: 0.5,
      falsePositive: false,
    });
    expect(emptyResult).toMatchObject({ hit: true, precision: 1, falsePositive: false });
    expect(falsePositiveResult).toMatchObject({ hit: true, precision: 0, falsePositive: true });
  });

  it("aggregates overall and category metrics", () => {
    const results = [
      scoreRetrievalExample(answerable, [{ ref: "JHN.3.16" }]),
      scoreRetrievalExample(unanswerable, []),
    ];
    const report = buildRetrievalReport([answerable, unanswerable], results);

    expect(report).toMatchObject({
      count: 2,
      hitRate: 1,
      meanReciprocalRank: 0.5,
      meanPrecision: 1,
      falsePositiveRate: 0,
    });
    expect(report.byCategory.direct?.hitRate).toBe(1);
    expect(report.byCategory.unanswerable?.hitRate).toBe(1);
  });

  it("rejects mismatched examples and results", () => {
    expect(() => buildRetrievalReport([answerable], [])).toThrow(
      "Examples and results must have the same length",
    );
  });
});
