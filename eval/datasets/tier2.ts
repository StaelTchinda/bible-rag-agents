import type { RetrievalEvalExample } from "../../packages/core/eval/rag/evaluation";

export type Tier2Intent =
  | "direct"
  | "thematic"
  | "pastoral"
  | "historical"
  | "ambiguous"
  | "cross-lingual"
  | "unanswerable";

export interface Tier2EvalExample extends RetrievalEvalExample {
  persona: "berean" | "comforter" | "historian";
  intent: Tier2Intent;
  expectedRefs: string[];
  requiredAnswerProperties: string[];
}

const answerableProperties = ["answer the question", "cite the supporting verses"];

export const tier2Examples: Tier2EvalExample[] = [
  {
    id: "natural-gods-love",
    query: "I keep wondering whether God really loves people. Is there a passage that speaks to that?",
    relevant: ["JHN.3.16", "ROM.5.8"],
    hardNegatives: ["1CO.13.4"],
    language: "en",
    category: "thematic",
    difficulty: "medium",
    answerable: true,
    persona: "comforter",
    intent: "pastoral",
    expectedRefs: ["JHN.3.16", "ROM.5.8"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "acknowledge the emotional concern without making promises beyond the text",
    ],
  },
  {
    id: "natural-anxiety",
    query: "I feel anxious and do not know what to do. What guidance can I find in the Bible?",
    relevant: ["PHP.4.6", "PHP.4.7", "MAT.6.25"],
    hardNegatives: ["PSA.23.1"],
    language: "en",
    category: "thematic",
    difficulty: "medium",
    answerable: true,
    persona: "comforter",
    intent: "pastoral",
    expectedRefs: ["PHP.4.6", "PHP.4.7"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "respond compassionately",
      "avoid presenting scripture as a substitute for professional care",
    ],
  },
  {
    id: "natural-enemy-response",
    query: "Someone has treated me badly. Does Jesus say how I should respond to an enemy?",
    relevant: ["MAT.5.44"],
    hardNegatives: ["ROM.12.20"],
    language: "en",
    category: "thematic",
    difficulty: "medium",
    answerable: true,
    persona: "berean",
    intent: "pastoral",
    expectedRefs: ["MAT.5.44"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "distinguish forgiveness or prayer from approving abuse",
    ],
  },
  {
    id: "natural-faith-and-actions",
    query: "How should I understand the relationship between faith and what I actually do?",
    relevant: ["JAS.2.17", "JAS.2.18", "EPH.2.8"],
    hardNegatives: ["ROM.3.28"],
    language: "en",
    category: "thematic",
    difficulty: "hard",
    answerable: true,
    persona: "berean",
    intent: "ambiguous",
    expectedRefs: ["JAS.2.17", "JAS.2.18", "EPH.2.8"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "acknowledge that the passages address related but distinct aspects of faith",
    ],
  },
  {
    id: "historical-creation-opening",
    query: "What does the Bible's opening line tell us about its view of creation?",
    relevant: ["GEN.1.1"],
    hardNegatives: ["JHN.1.1"],
    language: "en",
    category: "direct",
    difficulty: "easy",
    answerable: true,
    persona: "historian",
    intent: "historical",
    expectedRefs: ["GEN.1.1"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "separate what the verse states from broader historical interpretation",
    ],
  },
  {
    id: "historical-word-beginning",
    query: "Are Genesis 1:1 and John 1:1 making the same claim when they begin with 'in the beginning'?",
    relevant: ["GEN.1.1", "JHN.1.1"],
    hardNegatives: ["PSA.23.1"],
    language: "en",
    category: "thematic",
    difficulty: "hard",
    answerable: true,
    persona: "historian",
    intent: "historical",
    expectedRefs: ["GEN.1.1", "JHN.1.1"],
    requiredAnswerProperties: [
      ...answerableProperties,
      "compare the passages without claiming more historical certainty than the text provides",
    ],
  },
  {
    id: "german-natural-anxiety",
    query: "Ich bin oft sehr unruhig. Welche Hoffnung und welchen Rat gibt mir die Bibel?",
    relevant: ["PHP.4.6", "PHP.4.7", "MAT.6.25"],
    hardNegatives: ["PSA.23.1"],
    language: "de",
    category: "cross-lingual",
    difficulty: "medium",
    answerable: true,
    persona: "comforter",
    intent: "cross-lingual",
    expectedRefs: ["PHP.4.6", "PHP.4.7"],
    requiredAnswerProperties: [
      "answer in German or clearly acknowledge the language",
      "cite the supporting verses",
      "respond compassionately",
    ],
  },
  {
    id: "unanswerable-election-outcome",
    query: "I need to know what the Bible says about the exact results of the 2026 Canadian election.",
    relevant: [],
    hardNegatives: [],
    language: "en",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
    persona: "historian",
    intent: "unanswerable",
    expectedRefs: [],
    requiredAnswerProperties: [
      "state that the supplied Bible context cannot establish those modern election results",
      "avoid inventing a biblical prediction or factual result",
    ],
  },
  {
    id: "unanswerable-quantum",
    query: "Can you show me the biblical passage that explains quantum entanglement?",
    relevant: [],
    hardNegatives: [],
    language: "en",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
    persona: "berean",
    intent: "unanswerable",
    expectedRefs: [],
    requiredAnswerProperties: [
      "state that the Bible context does not explain quantum entanglement",
      "avoid presenting a metaphor as a scientific explanation",
    ],
  },
  {
    id: "german-unanswerable-technology",
    query: "Welche Bibelstelle erklärt, wie moderne Quantencomputer funktionieren?",
    relevant: [],
    hardNegatives: [],
    language: "de",
    category: "unanswerable",
    difficulty: "hard",
    answerable: false,
    persona: "historian",
    intent: "unanswerable",
    expectedRefs: [],
    requiredAnswerProperties: [
      "state that the Bible context does not explain quantum computers",
      "avoid inventing a citation",
    ],
  },
];

export function validateTier2Examples(examples: Tier2EvalExample[]): void {
  const ids = new Set<string>();

  for (const example of examples) {
    if (ids.has(example.id)) {
      throw new Error(`Tier 2 dataset has duplicate id: ${example.id}`);
    }
    ids.add(example.id);

    if (!example.query.trim()) {
      throw new Error(`Tier 2 example ${example.id} has an empty query`);
    }
    if (example.requiredAnswerProperties.length === 0) {
      throw new Error(`Tier 2 example ${example.id} has no answer requirements`);
    }
    if (!example.answerable && example.expectedRefs.length > 0) {
      throw new Error(`Unanswerable example ${example.id} must not have expectedRefs`);
    }

    const relevant = new Set(example.relevant);
    if (example.expectedRefs.some((ref) => !relevant.has(ref))) {
      throw new Error(`Example ${example.id}: expectedRefs must be included in relevant`);
    }
  }
}

validateTier2Examples(tier2Examples);
