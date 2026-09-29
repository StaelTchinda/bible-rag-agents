import { describe, expect, it } from "vitest";
import {
  buildTier2Report,
  parseTier2JudgeResult,
  scoreTier2Example,
  validateTier2JudgeResult,
  type Tier2EvalExample,
  type Tier2JudgeResult,
} from "../../eval/rag/tier2-evaluation";

const example: Tier2EvalExample = {
  id: "anxiety",
  query: "What can I do when I am anxious?",
  language: "en",
  category: "thematic",
  difficulty: "medium",
  answerable: true,
  persona: "comforter",
  intent: "pastoral",
};

const judge: Tier2JudgeResult = {
  context: {
    overallScore: 3,
    sufficient: true,
    citations: [
      { ref: "PHP.4.6", score: 3 },
      { ref: "GEN.1.1", score: 0 },
    ],
  },
  faithfulness: {
    overallScore: 3,
    claims: [
      {
        text: "Paul tells believers to bring requests to God in prayer.",
        status: "supported",
        supportingRefs: ["PHP.4.6"],
        citationCorrect: true,
      },
      {
        text: "The Bible explains quantum physics.",
        status: "unsupported",
        supportingRefs: [],
        citationCorrect: false,
      },
    ],
  },
  answer: {
    overallScore: 2,
    directlyAnswers: true,
    abstentionCorrect: true,
  },
};

describe("Tier 2 evaluation", () => {
  it("scores context, faithfulness, and answer relevance independently", () => {
    const result = scoreTier2Example(example, judge);

    expect(result).toMatchObject({
      id: "anxiety",
      contextRelevance: 1 / 2,
      sufficientContext: 1,
      faithfulness: 0.5,
      supportedClaimRate: 0.5,
      unsupportedClaimRate: 0.5,
      answerRelevance: 2 / 3,
      directAnswerRate: 1,
      abstentionCorrectRate: 1,
    });
  });

  it("handles empty claim lists as a valid abstention", () => {
    const abstention: Tier2JudgeResult = {
      context: { overallScore: 0, sufficient: false, citations: [] },
      faithfulness: { overallScore: 0, claims: [] },
      answer: { overallScore: 3, directlyAnswers: true, abstentionCorrect: true },
    };

    expect(scoreTier2Example({ ...example, answerable: false }, abstention)).toMatchObject({
      faithfulness: 1,
      answerRelevance: 1,
      abstentionCorrectRate: 1,
    });
  });

  it("validates citation references and score ranges", () => {
    expect(() =>
      validateTier2JudgeResult(
        {
          ...judge,
          context: {
            ...judge.context,
            citations: [{ ref: "UNKNOWN.1.1", score: 2 }],
          },
        },
        ["PHP.4.6"],
      ),
    ).toThrow("unknown citation reference");

    expect(() =>
      validateTier2JudgeResult(
        { ...judge, answer: { ...judge.answer, overallScore: 4 } },
        ["PHP.4.6", "GEN.1.1"],
      ),
    ).toThrow("score must be between 0 and 3");

    expect(() => validateTier2JudgeResult(judge, ["PHP.4.6", "GEN.1.1", "PSA.23.1"])).toThrow(
      "missing citation judgment",
    );

    expect(() => scoreTier2Example(example, judge, ["PHP.4.6", "GEN.1.1", "PSA.23.1"])).toThrow(
      "missing citation judgment",
    );
  });

  it("parses recorded judge JSON and rejects malformed payloads", () => {
    const parsed = parseTier2JudgeResult(JSON.stringify(judge), ["PHP.4.6", "GEN.1.1"]);
    expect(parsed).toEqual(judge);

    expect(() => parseTier2JudgeResult("{", [])).toThrow("not valid JSON");
    expect(() =>
      parseTier2JudgeResult(
        JSON.stringify({
          ...judge,
          faithfulness: {
            ...judge.faithfulness,
            claims: [
              {
                ...judge.faithfulness.claims[0],
                status: "guess",
              },
            ],
          },
        }),
        ["PHP.4.6", "GEN.1.1"],
      ),
    ).toThrow("invalid claim status");
    expect(() =>
      parseTier2JudgeResult(JSON.stringify({ context: judge.context }), ["PHP.4.6"]),
    ).toThrow("faithfulness is incomplete");
  });

  it("aggregates overall and category reports", () => {
    const first = scoreTier2Example(example, judge);
    const second = scoreTier2Example(
      { ...example, id: "direct", category: "direct" },
      {
        ...judge,
        context: {
          overallScore: 3,
          sufficient: true,
          citations: [{ ref: "PHP.4.6", score: 3 }],
        },
        faithfulness: {
          overallScore: 3,
          claims: [
            {
              text: "Supported claim",
              status: "supported",
              supportingRefs: ["PHP.4.6"],
              citationCorrect: true,
            },
          ],
        },
        answer: { overallScore: 3, directlyAnswers: true, abstentionCorrect: true },
      },
    );

    const report = buildTier2Report([first, second]);
    expect(report.count).toBe(2);
    expect(report.byCategory.thematic?.count).toBe(1);
    expect(report.byCategory.direct?.answerRelevance).toBe(1);
    expect(report.faithfulness).toBe(0.75);
  });

  it("rejects duplicate result IDs", () => {
    const result = scoreTier2Example(example, judge);
    expect(() => buildTier2Report([result, result])).toThrow("duplicate result id");
  });
});
