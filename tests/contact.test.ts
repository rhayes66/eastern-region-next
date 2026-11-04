import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/validation";
import { contactEmail } from "@/lib/email";

describe("contactSchema", () => {
  const ok = { name: "Ama", email: "ama@x.fi", subject: "Hi", message: "Hello" };
  it("accepts a valid message", () => {
    expect(contactSchema.safeParse(ok).success).toBe(true);
  });
  it("rejects a bad email and blanks", () => {
    expect(contactSchema.safeParse({ ...ok, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: " " }).success).toBe(false);
  });
});

describe("contactEmail", () => {
  it("escapes HTML in user input", () => {
    const html = contactEmail("<script>", "a@b.fi", "x", "y & z <b>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("y &amp; z");
  });
});
