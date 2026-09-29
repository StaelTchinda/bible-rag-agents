import { describe, expect, it } from "vitest";
import { tier2Examples, validateTier2Examples } from "./tier2";

describe("Tier 2 evaluation dataset", () => {
  it("contains structurally valid examples", () => {
    expect(() => validateTier2Examples(tier2Examples)).not.toThrow();
  });

  it("covers answerable, unanswerable, natural, and cross-lingual questions", () => {
    expect(tier2Examples.some((example) => example.answerable)).toBe(true);
    expect(tier2Examples.some((example) => !example.answerable)).toBe(true);
    expect(tier2Examples.some((example) => example.intent === "pastoral")).toBe(true);
    expect(tier2Examples.some((example) => example.intent === "historical")).toBe(true);
    expect(tier2Examples.some((example) => example.language === "de")).toBe(true);
  });

  it("gives answerable examples evidence and answer requirements", () => {
    for (const example of tier2Examples.filter((item) => item.answerable)) {
      expect(example.expectedRefs.length, example.id).toBeGreaterThan(0);
      expect(example.requiredAnswerProperties.length, example.id).toBeGreaterThan(0);
    }
  });

  it("does not assign evidence to unanswerable examples", () => {
    for (const example of tier2Examples.filter((item) => !item.answerable)) {
      expect(example.expectedRefs, example.id).toEqual([]);
      expect(example.requiredAnswerProperties.length, example.id).toBeGreaterThan(0);
    }
  });

  it("rejects duplicate IDs and invalid reference annotations", () => {
    expect(() =>
      validateTier2Examples([
        {
          ...tier2Examples[0]!,
          id: "duplicate",
        },
        {
          ...tier2Examples[1]!,
          id: "duplicate",
        },
      ]),
    ).toThrow("duplicate id");

    expect(() =>
      validateTier2Examples([
        {
          ...tier2Examples[0]!,
          relevant: ["JHN.3.16"],
          expectedRefs: ["ROM.5.8"],
        },
      ]),
    ).toThrow("expectedRefs must be included in relevant");
  });
});
