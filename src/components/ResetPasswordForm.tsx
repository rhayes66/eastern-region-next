"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Field } from "@/components/FormField";

function ResetInner() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="rounded-md border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
        Missing reset token. Please use the link from your email, or{" "}
        <a href="/forgot-password" className="underline">
          request a new one
        </a>
        .
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: form.get("password"),
        confirmPassword: form.get("confirmPassword"),
      }),
    });
    setBusy(false);
    if (res.ok) {
      setDone(true);
      return;
    }
    const json = await res.json().catch(() => ({}));
    setError(json.error ?? "Reset failed. Please try again.");
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-50 p-6 text-sm text-green-900 dark:bg-green-950/40 dark:text-green-100">
        Your password has been reset.{" "}
        <a href="/login" className="font-medium underline">
          Log in
        </a>{" "}
        with your new password.
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
      <Field label="New password" name="password" type="password" required />
      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        required
      />
      <p className="text-xs text-zinc-500">
        6+ characters with an uppercase letter, a number and a symbol.
      </p>
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {busy ? "Resetting…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}
