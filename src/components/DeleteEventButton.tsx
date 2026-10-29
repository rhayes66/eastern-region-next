"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onDelete = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="rounded-md bg-red-600/90 px-2.5 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-60"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}
