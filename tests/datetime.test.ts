import { describe, it, expect } from "vitest";
import { finlandLocalToUTCISO } from "@/lib/datetime";
import { debtTemplateVariables } from "@/lib/whatsapp";

describe("finlandLocalToUTCISO", () => {
  it("converts winter (EET, UTC+2) wall-clock to UTC", () => {
    // 18:00 Helsinki in December = 16:00 UTC
    expect(finlandLocalToUTCISO("2026-12-05T18:00")).toBe("2026-12-05T16:00:00.000Z");
  });

  it("converts summer (EEST, UTC+3) wall-clock to UTC", () => {
    // 18:00 Helsinki in July = 15:00 UTC
    expect(finlandLocalToUTCISO("2026-07-05T18:00")).toBe("2026-07-05T15:00:00.000Z");
  });

  it("returns empty string for empty input", () => {
    expect(finlandLocalToUTCISO("")).toBe("");
  });
});

describe("debtTemplateVariables", () => {
  it("maps name/month/year/amount to positional template variables", () => {
    expect(debtTemplateVariables("Ama", 25, "March", "2026")).toEqual({
      "1": "Ama",
      "2": "March",
      "3": "2026",
      "4": "25.00",
    });
  });
});
