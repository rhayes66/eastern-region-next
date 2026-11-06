import { describe, it, expect } from "vitest";
import {
  BENEFIT_CATEGORIES,
  LEGACY_BENEFIT_CATEGORIES,
  BENEFIT_CATEGORY_ENUM,
} from "@/lib/constants";

describe("benefit category enums", () => {
  it("does NOT offer the legacy Bereavement category in new submissions", () => {
    expect(BENEFIT_CATEGORIES).not.toContain("Bereavement");
  });

  it("keeps Bereavement valid for persistence/validation of old records", () => {
    // The model validates against the full enum, so pre-split records can
    // still be saved (approved/disbursed/rejected) without failing.
    expect(BENEFIT_CATEGORY_ENUM).toContain("Bereavement");
    expect(LEGACY_BENEFIT_CATEGORIES).toContain("Bereavement");
  });

  it("offers the four specific Demise categories", () => {
    for (const c of [
      "Demise Father",
      "Demise Mother",
      "Demise Spouse",
      "Demise Child",
    ]) {
      expect(BENEFIT_CATEGORIES).toContain(c);
    }
  });

  it("full enum is the union of offered + legacy with no omissions", () => {
    for (const c of BENEFIT_CATEGORIES) expect(BENEFIT_CATEGORY_ENUM).toContain(c);
    for (const c of LEGACY_BENEFIT_CATEGORIES)
      expect(BENEFIT_CATEGORY_ENUM).toContain(c);
  });
});
