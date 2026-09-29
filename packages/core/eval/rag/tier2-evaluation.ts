export type Tier2Score = 0 | 1 | 2 | 3;
export type ClaimStatus = "supported" | "partially_supported" | "unsupported" | "contradicted";

export interface Tier2EvalExample {
  id: string;
  query: string;
  language: string;
  category: string;
  difficulty: string;
  answerable: boolean;
  persona: string;
  intent: string;
}

export interface CitationJudgeResult {
  ref: string;
  score: Tier2Score;
}

export interface ClaimJudgeResult {
  text: string;
  status: ClaimStatus;
  supportingRefs: string[];
  citationCorrect: boolean;
}

export interface Tier2JudgeResult {
  context: {
    overallScore: Tier2Score;
    sufficient: boolean;
    citations: CitationJudgeResult[];
  };
  faithfulness: {
    overallScore: Tier2Score;
    claims: ClaimJudgeResult[];
  };
  answer: {
    overallScore: Tier2Score;
    directlyAnswers: boolean;
    abstentionCorrect: boolean;
  };
}

export interface Tier2ExampleResult {
  id: string;
  category: string;
  language: string;
  difficulty: string;
  answerable: boolean;
  persona: string;
  intent: string;
  contextRelevance: number;
  sufficientContext: number;
  faithfulness: number;
  supportedClaimRate: number;
  partiallySupportedClaimRate: number;
  unsupportedClaimRate: number;
  contradictedClaimRate: number;
  citationCorrectness: number;
  answerRelevance: number;
  directAnswerRate: number;
  abstentionCorrectRate: number;
}

export interface Tier2Slice {
  count: number;
  contextRelevance: number;
  sufficientContext: number;
  faithfulness: number;
  supportedClaimRate: number;
  unsupportedClaimRate: number;
  citationCorrectness: number;
  answerRelevance: number;
  directAnswerRate: number;
  abstentionCorrectRate: number;
}

export interface Tier2Report extends Tier2Slice {
  examples: Tier2ExampleResult[];
  byCategory: Record<string, Tier2Slice>;
}

const CLAIM_WEIGHTS: Record<ClaimStatus, number> = {
  supported: 1,
  partially_supported: 0.5,
  unsupported: 0,
  contradicted: 0,
};

export function validateTier2JudgeResult(result: Tier2JudgeResult, citationRefs: string[]): void {
  const knownRefs = new Set(citationRefs);
  validateScore(result.context.overallScore);
  validateScore(result.faithfulness.overallScore);
  validateScore(result.answer.overallScore);

  const seenRefs = new Set<string>();
  for (const citation of result.context.citations) {
    validateScore(citation.score);
    if (!knownRefs.has(citation.ref)) {
      throw new Error(`unknown citation reference: ${citation.ref}`);
    }
    if (seenRefs.has(citation.ref)) {
      throw new Error(`duplicate citation judgment: ${citation.ref}`);
    }
    seenRefs.add(citation.ref);
  }
  for (const ref of knownRefs) {
    if (!seenRefs.has(ref)) {
      throw new Error(`missing citation judgment: ${ref}`);
    }
  }

  for (const claim of result.faithfulness.claims) {
    if (!claim.text.trim()) throw new Error("claim text must not be empty");
    for (const ref of claim.supportingRefs) {
      if (!knownRefs.has(ref)) throw new Error(`unknown citation reference: ${ref}`);
    }
  }
}

export function parseTier2JudgeResult(input: string, citationRefs: string[]): Tier2JudgeResult {
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new Error("Tier 2 judge output is not valid JSON");
  }

  if (!isRecord(value)) throw new Error("Tier 2 judge output must be an object");
  const context = readContext(value.context);
  const faithfulness = readFaithfulness(value.faithfulness);
  const answer = readAnswer(value.answer);
  const result = { context, faithfulness, answer };
  validateTier2JudgeResult(result, citationRefs);
  return result;
}

export function scoreTier2Example(
  example: Tier2EvalExample,
  judge: Tier2JudgeResult,
  citationRefs: string[] = judge.context.citations.map((citation) => citation.ref),
): Tier2ExampleResult {
  validateTier2JudgeResult(judge, citationRefs);

  const citationScores = judge.context.citations.map((citation) => citation.score);
  const claims = judge.faithfulness.claims;
  const claimCount = claims.length;

  return {
    id: example.id,
    category: example.category,
    language: example.language,
    difficulty: example.difficulty,
    answerable: example.answerable,
    persona: example.persona,
    intent: example.intent,
    contextRelevance: average(citationScores) / 3,
    sufficientContext: Number(judge.context.sufficient),
    faithfulness:
      claimCount === 0
        ? Number(!example.answerable && judge.answer.abstentionCorrect)
        : average(claims.map((claim) => CLAIM_WEIGHTS[claim.status])),
    supportedClaimRate: ratio(claims, (claim) => claim.status === "supported"),
    partiallySupportedClaimRate: ratio(
      claims,
      (claim) => claim.status === "partially_supported",
    ),
    unsupportedClaimRate: ratio(claims, (claim) => claim.status === "unsupported"),
    contradictedClaimRate: ratio(claims, (claim) => claim.status === "contradicted"),
    citationCorrectness: ratio(claims, (claim) => claim.citationCorrect),
    answerRelevance: judge.answer.overallScore / 3,
    directAnswerRate: Number(judge.answer.directlyAnswers),
    abstentionCorrectRate: Number(judge.answer.abstentionCorrect),
  };
}

export function buildTier2Report(results: Tier2ExampleResult[]): Tier2Report {
  const ids = new Set<string>();
  for (const result of results) {
    if (ids.has(result.id)) throw new Error(`duplicate result id: ${result.id}`);
    ids.add(result.id);
  }

  const overall = summarize(results);
  const byCategory: Record<string, Tier2Slice> = {};
  for (const result of results) {
    const categoryResults = results.filter((item) => item.category === result.category);
    byCategory[result.category] = summarize(categoryResults);
  }

  return { ...overall, examples: results, byCategory };
}

function summarize(results: Tier2ExampleResult[]): Tier2Slice {
  return {
    count: results.length,
    contextRelevance: average(results.map((result) => result.contextRelevance)),
    sufficientContext: average(results.map((result) => result.sufficientContext)),
    faithfulness: average(results.map((result) => result.faithfulness)),
    supportedClaimRate: average(results.map((result) => result.supportedClaimRate)),
    unsupportedClaimRate: average(results.map((result) => result.unsupportedClaimRate)),
    citationCorrectness: average(results.map((result) => result.citationCorrectness)),
    answerRelevance: average(results.map((result) => result.answerRelevance)),
    directAnswerRate: average(results.map((result) => result.directAnswerRate)),
    abstentionCorrectRate: average(results.map((result) => result.abstentionCorrectRate)),
  };
}

function ratio<T>(values: T[], predicate: (value: T) => boolean): number {
  return values.length === 0 ? 0 : values.filter(predicate).length / values.length;
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function validateScore(score: number): void {
  if (!Number.isInteger(score) || score < 0 || score > 3) {
    throw new Error("score must be between 0 and 3");
  }
}

function readContext(value: unknown): Tier2JudgeResult["context"] {
  if (!isRecord(value) || !Array.isArray(value.citations)) {
    throw new Error("Tier 2 judge context is incomplete");
  }
  return {
    overallScore: readScore(value.overallScore),
    sufficient: readBoolean(value.sufficient, "context.sufficient"),
    citations: value.citations.map((citation) => {
      if (!isRecord(citation)) throw new Error("invalid citation judgment");
      return {
        ref: readString(citation.ref, "citation.ref"),
        score: readScore(citation.score),
      };
    }),
  };
}

function readFaithfulness(value: unknown): Tier2JudgeResult["faithfulness"] {
  if (!isRecord(value) || !Array.isArray(value.claims)) {
    throw new Error("Tier 2 judge faithfulness is incomplete");
  }
  return {
    overallScore: readScore(value.overallScore),
    claims: value.claims.map((claim) => {
      if (!isRecord(claim) || !Array.isArray(claim.supportingRefs)) {
        throw new Error("invalid claim judgment");
      }
      return {
        text: readString(claim.text, "claim.text"),
        status: readClaimStatus(claim.status),
        supportingRefs: claim.supportingRefs.map((ref) => readString(ref, "claim.supportingRefs")),
        citationCorrect: readBoolean(claim.citationCorrect, "claim.citationCorrect"),
      };
    }),
  };
}

function readAnswer(value: unknown): Tier2JudgeResult["answer"] {
  if (!isRecord(value)) throw new Error("Tier 2 judge answer is incomplete");
  return {
    overallScore: readScore(value.overallScore),
    directlyAnswers: readBoolean(value.directlyAnswers, "answer.directlyAnswers"),
    abstentionCorrect: readBoolean(value.abstentionCorrect, "answer.abstentionCorrect"),
  };
}

function readScore(value: unknown): Tier2Score {
  if (value !== 0 && value !== 1 && value !== 2 && value !== 3) {
    throw new Error("score must be between 0 and 3");
  }
  return value;
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value;
}

function readBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${field} must be a boolean`);
  return value;
}

function readClaimStatus(value: unknown): ClaimStatus {
  if (
    value !== "supported" &&
    value !== "partially_supported" &&
    value !== "unsupported" &&
    value !== "contradicted"
  ) {
    throw new Error(`invalid claim status: ${String(value)}`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
