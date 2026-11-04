import { describe, it, expect } from "vitest";
import { detectImageType } from "@/lib/image-sniff";

const bytes = (...n: number[]) => Uint8Array.from(n);

describe("detectImageType", () => {
  it("detects jpeg", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
  });
  it("detects png", () => {
    expect(
      detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))
    ).toBe("image/png");
  });
  it("detects webp", () => {
    const b = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
    expect(detectImageType(b)).toBe("image/webp");
  });
  it("rejects svg, html and empty input", () => {
    expect(detectImageType(new TextEncoder().encode("<svg xmlns="))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("<html>"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
