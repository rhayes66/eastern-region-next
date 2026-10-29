import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  applicationSchema,
  duesSchema,
  benefitSchema,
  eventSchema,
  resetPasswordSchema,
} from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(r.success).toBe(true);
  });
  it("rejects a malformed email", () => {
    const r = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(r.success).toBe(false);
  });
  it("rejects an empty password", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
  });
});

describe("registerSchema password policy", () => {
  const base = { email: "a@b.com" };
  it("accepts a strong password with matching confirmation", () => {
    const r = registerSchema.safeParse({
      ...base,
      password: "Str0ng!pw",
      confirmPassword: "Str0ng!pw",
    });
    expect(r.success).toBe(true);
  });
  it("rejects a weak password (no symbol/number)", () => {
    const r = registerSchema.safeParse({
      ...base,
      password: "password",
      confirmPassword: "password",
    });
    expect(r.success).toBe(false);
  });
  it("rejects when confirmation does not match", () => {
    const r = registerSchema.safeParse({
      ...base,
      password: "Str0ng!pw",
      confirmPassword: "Different1!",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true
      );
    }
  });
});

describe("applicationSchema (requirement 8 fields)", () => {
  const valid = {
    firstname: "Kwame",
    lastname: "Mensah",
    gender: "Male",
    address: "Helsinki 10",
    ghanacity: "Kumasi",
    finlandContact: "+358401234567",
    email: "kwame@example.com",
    password: "Str0ng!pw",
    confirmPassword: "Str0ng!pw",
  };
  it("accepts a complete application", () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });
  it("requires the Finland contact number", () => {
    const { finlandContact, ...rest } = valid;
    void finlandContact;
    expect(applicationSchema.safeParse(rest).success).toBe(false);
  });
  it("requires the Ghana home town", () => {
    const { ghanacity, ...rest } = valid;
    void ghanacity;
    expect(applicationSchema.safeParse(rest).success).toBe(false);
  });
  it("rejects an invalid gender enum", () => {
    expect(
      applicationSchema.safeParse({ ...valid, gender: "Unknown" }).success
    ).toBe(false);
  });
  it("requires an email (it is the login identity)", () => {
    const { email, ...rest } = valid;
    void email;
    expect(applicationSchema.safeParse(rest).success).toBe(false);
  });
  it("requires a strong password", () => {
    expect(
      applicationSchema.safeParse({
        ...valid,
        password: "weak",
        confirmPassword: "weak",
      }).success
    ).toBe(false);
  });
  it("rejects mismatched password confirmation", () => {
    expect(
      applicationSchema.safeParse({ ...valid, confirmPassword: "Other1!" })
        .success
    ).toBe(false);
  });
});

describe("duesSchema", () => {
  const valid = {
    member: "m1",
    amount: 20,
    month: "january",
    year: "2026",
    duesType: "Monthly",
  };
  it("accepts valid monthly dues", () => {
    expect(duesSchema.safeParse(valid).success).toBe(true);
  });
  it("coerces a numeric string amount", () => {
    const r = duesSchema.safeParse({ ...valid, amount: "20" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.amount).toBe(20);
  });
  it("rejects a non-positive amount", () => {
    expect(duesSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
  });
  it("rejects a bad year format", () => {
    expect(duesSchema.safeParse({ ...valid, year: "26" }).success).toBe(false);
  });
  it("rejects an invalid month enum", () => {
    expect(duesSchema.safeParse({ ...valid, month: "Smarch" }).success).toBe(
      false
    );
  });
});

describe("benefitSchema", () => {
  it("accepts a valid benefit", () => {
    const r = benefitSchema.safeParse({
      member: "m1",
      category: "Medical",
      amount: 100,
    });
    expect(r.success).toBe(true);
  });
  it("rejects an invalid category", () => {
    const r = benefitSchema.safeParse({
      member: "m1",
      category: "Lottery",
      amount: 100,
    });
    expect(r.success).toBe(false);
  });
});

describe("eventSchema", () => {
  it("accepts a valid event", () => {
    const r = eventSchema.safeParse({
      title: "AGM",
      eventType: "Meeting",
      startDate: "2026-12-01",
    });
    expect(r.success).toBe(true);
  });
  it("requires a start date", () => {
    const r = eventSchema.safeParse({ title: "AGM", eventType: "Meeting" });
    expect(r.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts a token with a matching strong password", () => {
    const r = resetPasswordSchema.safeParse({
      token: "abc",
      password: "Str0ng!pw",
      confirmPassword: "Str0ng!pw",
    });
    expect(r.success).toBe(true);
  });
  it("rejects a missing token", () => {
    const r = resetPasswordSchema.safeParse({
      token: "",
      password: "Str0ng!pw",
      confirmPassword: "Str0ng!pw",
    });
    expect(r.success).toBe(false);
  });
});
