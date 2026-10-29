"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MONTHS, DUES_TYPES, BENEFIT_CATEGORIES } from "@/lib/constants";
import { Field, SelectField } from "@/components/FormField";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const thisYear = new Date().getFullYear().toString();

export default function MemberManage({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"dues" | "benefit" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const post = async (
    kind: "dues" | "benefit",
    url: string,
    payload: Record<string, unknown>
  ) => {
    if (busy !== null) return false; // a submission is already in flight
    setBusy(kind);
    setMsg(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, member: memberId }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Saved." });
        router.refresh();
        return true;
      }
      const json = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: json.error ?? "Save failed." });
      return false;
    } catch {
      setMsg({ ok: false, text: "Could not reach the server. Please try again." });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const onDues = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await post("dues", "/api/admin/dues", {
      amount: f.get("amount"),
      month: f.get("month"),
      year: f.get("year"),
      duesType: f.get("duesType"),
      description: f.get("description") || undefined,
      paid: f.get("paid") === "on",
    });
    if (ok) (e.target as HTMLFormElement).reset();
  };

  const onBenefit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const ok = await post("benefit", "/api/admin/benefits", {
      category: f.get("category"),
      amount: f.get("amount"),
      description: f.get("description") || undefined,
    });
    if (ok) (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div
          className={`rounded-md border p-3 text-sm ${
            msg.ok
              ? "border-green-600/30 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Record dues */}
      <form
        onSubmit={onDues}
        className="rounded-xl border border-black/10 p-5 dark:border-white/15"
      >
        <h3 className="font-semibold">Record a contribution (dues)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectField label="Month" name="month" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {cap(m)}
              </option>
            ))}
          </SelectField>
          <Field label="Year" name="year" required defaultValue={thisYear} />
          <SelectField label="Type" name="duesType" required defaultValue="Monthly">
            {DUES_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectField>
          <Field label="Amount (€)" name="amount" type="number" step="0.01" min="0" required />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Field label="Note (optional)" name="description" />
          <label className="mt-6 flex items-center gap-2 text-sm">
            <input type="checkbox" name="paid" /> Mark as paid
          </label>
        </div>
        <button
          type="submit"
          disabled={busy !== null}
          className="mt-4 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {busy === "dues" ? "Saving…" : "Add dues"}
        </button>
      </form>

      {/* Grant benefit */}
      <form
        onSubmit={onBenefit}
        className="rounded-xl border border-black/10 p-5 dark:border-white/15"
      >
        <h3 className="font-semibold">Grant a benefit</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <SelectField label="Category" name="category" required defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {BENEFIT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <Field label="Amount (€)" name="amount" type="number" step="0.01" min="0" required />
          <Field label="Note (optional)" name="description" />
        </div>
        <button
          type="submit"
          disabled={busy !== null}
          className="mt-4 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {busy === "benefit" ? "Saving…" : "Grant benefit"}
        </button>
      </form>
    </div>
  );
}
