import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { embedBatch } from "../packages/bible-data/src/embed";
import { loadIndexFromDir } from "../packages/bible-data/src/load-index";
import {
  type EmbeddingProvider,
  retrieve,
} from "../packages/core/src/index";
import {
  buildRetrievalReport,
  buildTier2Report,
  parseTier2JudgeResult,
  scoreRetrievalExample,
  scoreTier2Example,
} from "../packages/core/eval/rag";
import { retrievalExamples } from "./datasets/retrieval";
import { tier2Examples } from "./datasets/tier2";

const { outputPath, tier2Directory } = readArguments(process.argv.slice(2));
const store = await loadIndexFromDir();
const embedder: EmbeddingProvider = {
  id: "multilingual-e5-small",
  modelId: "Xenova/multilingual-e5-small",
  dimensions: 384,
  init: () => Promise.resolve(),
  embed: (texts, kind) => embedBatch(texts, kind === "query" ? "query" : "passage"),
};

const results = [];
for (const example of retrievalExamples) {
  const citations = await retrieve(example.query, embedder, store, {
    k: 8,
    crossLingual: true,
  });
  results.push(scoreRetrievalExample(example, citations));
}

const report = buildRetrievalReport(retrievalExamples, results);
console.log(`Retrieval evaluation (${report.count} examples)`);
console.log(`  hit rate:             ${(report.hitRate * 100).toFixed(1)}%`);
console.log(`  answerable hit rate:  ${(report.answerableHitRate * 100).toFixed(1)}%`);
console.log(`  mean reciprocal rank: ${report.meanReciprocalRank.toFixed(3)}`);
console.log(`  mean recall:           ${(report.meanRecall * 100).toFixed(1)}%`);
console.log(`  mean precision:       ${(report.meanPrecision * 100).toFixed(1)}%`);
console.log(`  false-positive rate:  ${(report.falsePositiveRate * 100).toFixed(1)}%`);

for (const result of report.examples.filter((item) => !item.hit || item.falsePositive)) {
  console.log(`  FAIL ${result.id}: ${result.returned.join(", ") || "(none)"}`);
}

if (outputPath) {
  const tier2Report = tier2Directory
    ? await runTier2Evaluation(tier2Directory, embedder, store)
    : undefined;
  await writeFile(
    outputPath,
    `${JSON.stringify(tier2Report ? { retrieval: report, tier2: tier2Report } : report, null, 2)}\n`,
    "utf8",
  );
  console.log(`Wrote ${outputPath}`);
} else if (tier2Directory) {
  await runTier2Evaluation(tier2Directory, embedder, store);
}

if (!outputPath && !tier2Directory) {
  console.log("Tier 2 evaluation skipped; provide --tier2-dir <directory> with recorded judge JSON.");
}

async function runTier2Evaluation(
  directory: string,
  tier2Embedder: EmbeddingProvider,
  tier2Store: Awaited<ReturnType<typeof loadIndexFromDir>>,
) {
  const results = [];
  for (const example of tier2Examples) {
    const citations = await retrieve(example.query, tier2Embedder, tier2Store, {
      k: 8,
      crossLingual: true,
    });
    const judgePath = join(directory, `${example.id}.json`);
    let judgeInput: string;
    try {
      judgeInput = await readFile(judgePath, "utf8");
    } catch (error) {
      throw new Error(
        `Missing Tier 2 judge fixture for ${example.id}: ${judgePath}`,
        { cause: error },
      );
    }
    const judge = parseTier2JudgeResult(
      judgeInput,
      citations.map((citation) => citation.ref),
    );
    results.push(scoreTier2Example(example, judge, citations.map((citation) => citation.ref)));
  }

  const report = buildTier2Report(results);
  console.log(`Tier 2 evaluation (${report.count} examples)`);
  console.log(`  C|Q context relevance: ${(report.contextRelevance * 100).toFixed(1)}%`);
  console.log(`  A|C faithfulness:      ${(report.faithfulness * 100).toFixed(1)}%`);
  console.log(`  A|Q answer relevance:  ${(report.answerRelevance * 100).toFixed(1)}%`);
  console.log(`  unsupported claims:    ${(report.unsupportedClaimRate * 100).toFixed(1)}%`);
  return report;
}

function readArguments(args: string[]): { outputPath?: string; tier2Directory?: string } {
  const positional: string[] = [];
  let tier2Directory: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--tier2-dir") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--tier2-dir requires a directory path");
      }
      tier2Directory = value;
      index += 1;
    } else if (arg?.startsWith("--")) {
      throw new Error(`Unknown eval option: ${arg}`);
    } else if (arg) {
      positional.push(arg);
    }
  }

  if (positional.length > 1) {
    throw new Error("Expected at most one output path");
  }
  return { outputPath: positional[0], tier2Directory };
}
