import { describe, it, expect } from "vitest";
import { escapeHtml, applicationStatusEmail } from "@/lib/email";

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;"
    );
  });
  it("leaves a plain name untouched", () => {
    expect(escapeHtml("Kwame Mensah")).toBe("Kwame Mensah");
  });
});

describe("applicationStatusEmail escapes user-supplied name", () => {
  const payload = `<a href="https://evil.example">click</a>`;

  it("does not emit the raw injected markup on accept", () => {
    const html = applicationStatusEmail(payload, true);
    expect(html).not.toContain("<a href=");
    expect(html).toContain("&lt;a href=");
  });

  it("does not emit the raw injected markup on reject", () => {
    const html = applicationStatusEmail(payload, false);
    expect(html).not.toContain("<a href=");
    expect(html).toContain("&lt;a href=");
  });
});
