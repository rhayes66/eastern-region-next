"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EVENT_TYPES } from "@/lib/constants";
import { Field, SelectField } from "@/components/FormField";

export default function EventForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: f.get("title"),
          eventType: f.get("eventType"),
          description: f.get("description") || undefined,
          location: f.get("location") || undefined,
          startDate: f.get("startDate"),
          endDate: f.get("endDate") || undefined,
        }),
      });
      if (res.ok) {
        setMsg({ ok: true, text: "Event created." });
        (e.target as HTMLFormElement).reset();
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => ({}));
      setMsg({ ok: false, text: json.error ?? "Could not create the event." });
    } catch {
      setMsg({ ok: false, text: "Could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-black/10 p-5 dark:border-white/15"
    >
      <h3 className="font-semibold">Create an event</h3>
      {msg && (
        <div
          className={`mt-3 rounded-md border p-2 text-sm ${
            msg.ok
              ? "border-green-600/30 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200"
              : "border-red-600/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" required />
        <SelectField label="Type" name="eventType" required defaultValue="Meeting">
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <Field label="Start" name="startDate" type="datetime-local" required />
        <Field label="End (optional)" name="endDate" type="datetime-local" />
        <Field label="Location" name="location" />
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 dark:border-white/20 dark:bg-zinc-900"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="mt-4 rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {busy ? "Saving…" : "Create event"}
      </button>
    </form>
  );
}
