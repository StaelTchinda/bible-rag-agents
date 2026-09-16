import { writeFile } from "node:fs/promises";
import { embedBatch } from "../packages/bible-data/src/embed";
import { loadIndexFromDir } from "../packages/bible-data/src/load-index";
import {
  type EmbeddingProvider,
  buildRetrievalReport,
  retrieve,
  scoreRetrievalExample,
} from "../packages/core/src/index";
import { retrievalExamples } from "./datasets/retrieval";

const outputPath = process.argv[2];
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
console.log(`  mean reciprocal rank: ${report.meanReciprocalRank.toFixed(3)}`);
console.log(`  mean precision:       ${(report.meanPrecision * 100).toFixed(1)}%`);
console.log(`  false-positive rate:  ${(report.falsePositiveRate * 100).toFixed(1)}%`);

for (const result of report.examples.filter((item) => !item.hit || item.falsePositive)) {
  console.log(`  FAIL ${result.id}: ${result.returned.join(", ") || "(none)"}`);
}

if (outputPath) {
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath}`);
}
