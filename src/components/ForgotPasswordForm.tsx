"use client";

import { useState } from "react";
import { Field } from "@/components/FormField";

export default function ForgotPasswordForm() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const email = new FormData(e.currentTarget).get("email");
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true); // always show the same message (no enumeration)
    } catch {
      setError("Could not reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-50 p-6 text-sm text-green-900 dark:bg-green-950/40 dark:text-green-100">
        If that email is registered, we&apos;ve sent a password reset link. It
        expires in 1 hour. Check your inbox (and spam folder).
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      <Field label="Email" name="email" type="email" required />
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
