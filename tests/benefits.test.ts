import { describe, it, expect } from "vitest";
import { totalBenefitsReceived } from "@/lib/benefits";

describe("totalBenefitsReceived", () => {
  it("counts Approved and Disbursed, not Requested or Rejected", () => {
    expect(
      totalBenefitsReceived([
        { amount: 500, status: "Approved" },
        { amount: 200, status: "Disbursed" },
        { amount: 100, status: "Requested" },
        { amount: 50, status: "Rejected" },
      ])
    ).toBe(700);
  });
  it("is 0 with no benefits", () => {
    expect(totalBenefitsReceived([])).toBe(0);
  });
});
