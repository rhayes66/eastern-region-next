"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemindButton({ duesId }: { duesId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const onDelete = async () => {
    if (!confirm("Delete this dues record? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/dues/${duesId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setMsg({ ok: false, text: json.error ?? "Could not delete the record." });
      }
    } catch {
      setMsg({ ok: false, text: "Could not reach the server." });
    } finally {
      setDeleting(false);
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
      {msg && !msg.ok && (
        <button
          onClick={onDelete}
          disabled={deleting || busy}
          title="Delete this dues record"
          className="rounded-md bg-red-600/90 px-2.5 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "…" : "Delete"}
        </button>
      )}
    </span>
  );
}
