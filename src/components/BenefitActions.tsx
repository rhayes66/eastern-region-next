"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Admin controls to move a benefit through its lifecycle or delete it. */
export default function BenefitActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (init: RequestInit, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/benefits/${id}`, init);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (next: string, confirmText?: string) =>
    run(
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      },
      confirmText
    );

  const btn =
    "rounded-md px-2.5 py-1 text-xs text-white disabled:opacity-60";

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {status === "Requested" && (
        <button
          onClick={() => setStatus("Approved")}
          disabled={busy}
          className={`${btn} bg-green-700 hover:bg-green-800`}
        >
          Approve
        </button>
      )}
      {(status === "Requested" || status === "Approved") && (
        <>
          <button
            onClick={() => setStatus("Disbursed")}
            disabled={busy}
            className={`${btn} bg-emerald-600 hover:bg-emerald-700`}
          >
            Mark disbursed
          </button>
          <button
            onClick={() => setStatus("Rejected", "Reject this benefit?")}
            disabled={busy}
            className={`${btn} bg-amber-600 hover:bg-amber-700`}
          >
            Reject
          </button>
        </>
      )}
      <button
        onClick={() =>
          run({ method: "DELETE" }, "Delete this benefit record? This cannot be undone.")
        }
        disabled={busy}
        className={`${btn} bg-red-600/90 hover:bg-red-700`}
      >
        Delete
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
    </span>
  );
}
