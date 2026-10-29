"use client";

import { useState } from "react";

export default function ResetPasswordAction({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: `Password updated for ${name}.` });
        setPassword("");
        setOpen(false);
        return;
      }
      const json = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: json.error ?? "Reset failed." });
    } catch {
      setMsg({ ok: false, text: "Could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => {
            setOpen(true);
            setMsg(null);
          }}
          className="rounded-md bg-black/5 px-3 py-1.5 text-sm hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          Reset password
        </button>
        {msg && (
          <span className={`text-xs ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <input
          type="text"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-44 rounded-md border border-black/15 bg-white px-2 py-1.5 text-sm outline-none focus:border-green-600 dark:border-white/20 dark:bg-zinc-900"
        />
        <button
          onClick={submit}
          disabled={busy || password.length === 0}
          className="rounded-md bg-green-700 px-3 py-1.5 text-sm text-white hover:bg-green-800 disabled:opacity-60"
        >
          {busy ? "…" : "Set"}
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setPassword("");
          }}
          className="rounded-md px-2 py-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
      <span className="text-xs text-zinc-500">
        6+ chars, upper, lower, number & symbol
      </span>
      {msg && !msg.ok && <span className="text-xs text-red-600">{msg.text}</span>}
    </div>
  );
}
