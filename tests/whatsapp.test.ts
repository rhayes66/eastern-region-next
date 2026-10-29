import { describe, it, expect } from "vitest";
import { debtMessage } from "@/lib/whatsapp";

describe("debtMessage", () => {
  it("includes the member name, amount, month and year", () => {
    const msg = debtMessage("Ama", 25, "March", "2026");
    expect(msg).toContain("Ama");
    expect(msg).toContain("€25.00");
    expect(msg).toContain("March 2026");
    expect(msg).toContain("GERAF");
  });

  it("formats the amount to two decimals", () => {
    expect(debtMessage("X", 5, "May", "2026")).toContain("€5.00");
    expect(debtMessage("X", 12.5, "May", "2026")).toContain("€12.50");
  });
});
