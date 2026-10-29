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
  const escaped = "&lt;a href=&quot;https://evil.example&quot;&gt;click&lt;/a&gt;";

  it("escapes the injected name on accept (keeps its own legit links)", () => {
    const html = applicationStatusEmail(payload, true);
    // the user-supplied payload must appear only in escaped form
    expect(html).not.toContain(payload);
    expect(html).toContain(escaped);
  });

  it("escapes the injected name on reject", () => {
    const html = applicationStatusEmail(payload, false);
    expect(html).not.toContain(payload);
    expect(html).toContain(escaped);
  });
});
