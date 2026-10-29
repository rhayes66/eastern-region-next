"use client";

import { useState } from "react";

export default function RemindButton({ duesId }: { duesId: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onRemind = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/dues/${duesId}/remind`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: json.sent, text: json.message ?? "Done." });
      } else {
        setMsg({ ok: false, text: json.error ?? "Could not send reminder." });
      }
    } catch {
      setMsg({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={onRemind}
        disabled={busy}
        title="Send a WhatsApp debt reminder"
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "…" : "Remind via WhatsApp"}
      </button>
      {msg && (
        <span className={`text-xs ${msg.ok ? "text-green-600" : "text-amber-600"}`}>
          {msg.text}
        </span>
      )}
    </span>
  );
}
