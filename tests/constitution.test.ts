import { describe, it, expect } from "vitest";
import { CONSTITUTION } from "@/lib/constitution";

describe("CONSTITUTION data", () => {
  it("has unique section ids and all expected sections", () => {
    const ids = CONSTITUTION.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["aims", "benefits", "contributions", "dissolution"]) {
      expect(ids).toContain(id);
    }
  });
  it("every section has a title and some content", () => {
    for (const s of CONSTITUTION) {
      expect(s.title).toBeTruthy();
      expect((s.items?.length ?? 0) + (s.paragraphs?.length ?? 0)).toBeGreaterThan(0);
    }
  });
});
