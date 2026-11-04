"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_SIDE = 512;
const ACCEPT = "image/jpeg,image/png,image/webp";

/** Downscale to MAX_SIDE and re-encode as JPEG so uploads stay small. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85
    )
  );
}

export default function ProfileImageUpload({
  picture,
  name,
}: {
  picture?: string;
  name: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const blob = await downscale(file);
      const body = new FormData();
      body.append("file", blob, "profile.jpg");
      const res = await fetch("/api/profile/image", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    if (!confirm("Remove your profile photo?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/image", { method: "DELETE" });
      if (!res.ok) throw new Error("Could not remove the photo.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the photo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={picture}
          alt={`Profile photo of ${name}`}
          className="h-24 w-24 rounded-full border border-black/10 object-cover dark:border-white/15"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-3xl font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-200"
        >
          {name.charAt(0).toUpperCase() || "?"}
        </div>
      )}
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          onChange={onPick}
          className="sr-only"
          aria-label="Choose profile photo"
          id="profile-photo"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-md bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800 disabled:opacity-60"
          >
            {busy ? "Working…" : picture ? "Change photo" : "Upload photo"}
          </button>
          {picture && (
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/10"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-500">JPEG, PNG or WebP. Resized automatically.</p>
        {error && (
          <p role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
