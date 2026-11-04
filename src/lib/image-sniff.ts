export const MAX_PROFILE_IMAGE_BYTES = 400 * 1024;

export type ImageType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Identify an image from its magic bytes. We never trust the client-declared
 * type or filename, and deliberately do not accept SVG (script-capable).
 */
export function detectImageType(buf: Uint8Array): ImageType | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => buf[i] === b)
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    String.fromCharCode(...buf.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...buf.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}
