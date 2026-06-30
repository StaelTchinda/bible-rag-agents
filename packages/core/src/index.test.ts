import { describe, expect, it } from "vitest";
import { CORE_VERSION } from "./index";

describe("@bible-rag/core", () => {
  it("exposes a version string", () => {
    expect(CORE_VERSION).toBe("0.0.0");
  });
});
