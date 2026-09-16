import type { Citation } from "./retriever";

export interface RetrievalEvalExample {
  id: string;
  query: string;
  relevant: string[];
  hardNegatives?: string[];
  language: "en" | "de";
  category: "direct" | "thematic" | "cross-lingual" | "unanswerable";
  difficulty: "easy" | "medium" | "hard";
  answerable: boolean;
}

export interface RetrievalExampleResult {
  id: string;
  hit: boolean;
  reciprocalRank: number;
  precision: number;
  falsePositive: boolean;
  returned: string[];
}

export interface RetrievalEvalReport {
  count: number;
  hitRate: number;
  meanReciprocalRank: number;
  meanPrecision: number;
  falsePositiveRate: number;
  byCategory: Record<string, { count: number; hitRate: number; precision: number }>;
  examples: RetrievalExampleResult[];
}

export function scoreRetrievalExample(
  example: RetrievalEvalExample,
  citations: Pick<Citation, "ref">[],
): RetrievalExampleResult {
  const returned = citations.map((citation) => citation.ref);
  const relevant = new Set(example.relevant);
  const firstRelevant = returned.findIndex((ref) => relevant.has(ref));
  const relevantReturned = returned.filter((ref) => relevant.has(ref)).length;
  const hit = firstRelevant >= 0;

  return {
    id: example.id,
    hit: example.answerable ? hit : !hit,
    reciprocalRank: example.answerable && hit ? 1 / (firstRelevant + 1) : 0,
    precision: example.answerable
      ? relevantReturned / Math.max(returned.length, 1)
      : returned.length === 0
        ? 1
        : 0,
    falsePositive: !example.answerable && returned.length > 0,
    returned,
  };
}

export function buildRetrievalReport(
  examples: RetrievalEvalExample[],
  results: RetrievalExampleResult[],
): RetrievalEvalReport {
  if (examples.length !== results.length) {
    throw new Error("Examples and results must have the same length");
  }

  const byCategory = new Map<string, RetrievalExampleResult[]>();
  for (const [index, example] of examples.entries()) {
    const result = results[index];
    if (!result) throw new Error(`Missing result for example ${example.id}`);
    const group = byCategory.get(example.category) ?? [];
    group.push(result);
    byCategory.set(example.category, group);
  }

  const categoryReport: RetrievalEvalReport["byCategory"] = {};
  for (const [category, categoryResults] of byCategory) {
    categoryReport[category] = {
      count: categoryResults.length,
      hitRate: average(categoryResults.map((result) => Number(result.hit))),
      precision: average(categoryResults.map((result) => result.precision)),
    };
  }

  const unanswerableResults = results.filter((_, index) => examples[index]?.answerable === false);

  return {
    count: results.length,
    hitRate: average(results.map((result) => Number(result.hit))),
    meanReciprocalRank: average(results.map((result) => result.reciprocalRank)),
    meanPrecision: average(results.map((result) => result.precision)),
    falsePositiveRate: average(unanswerableResults.map((result) => Number(result.falsePositive))),
    byCategory: categoryReport,
    examples: results,
  };
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}
