import { describe, expect, it } from "vitest";
import { type RefSegment, parseInlineRefs } from "./inline-refs";

describe("parseInlineRefs", () => {
  it("detects a simple reference", () => {
    expect(parseInlineRefs("As John 3:16 says, God loves the world.")).toEqual([
      { type: "text", value: "As " },
      { type: "ref", ref: "JHN.3.16", label: "John 3:16" },
      { type: "text", value: " says, God loves the world." },
    ]);
  });

  it("handles numbered books and multiple refs", () => {
    const refs = parseInlineRefs("See 1 John 4:8 and Psalms 23:1.").filter(
      (s): s is RefSegment => s.type === "ref",
    );
    expect(refs).toEqual([
      { type: "ref", ref: "1JN.4.8", label: "1 John 4:8" },
      { type: "ref", ref: "PSA.23.1", label: "Psalms 23:1" },
    ]);
  });

  it("returns plain text when there are no references", () => {
    expect(parseInlineRefs("No references here.")).toEqual([
      { type: "text", value: "No references here." },
    ]);
  });
});
