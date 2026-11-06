"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Field } from "@/components/FormField";

export default function ContactForm() {
  const [done, setDone] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setServerError(null);
    let res: Response;
    try {
      res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Network/transport failure — keep the entered message so the visitor
      // can simply retry, and show a clear, retryable error.
      setServerError(
        "Couldn't reach the server. Check your connection and try again."
      );
      return;
    }
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setDone(json.message ?? "Thanks — your message was received.");
      reset();
      return;
    }
    setServerError(json.error ?? "Could not send your message.");
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-50 p-6 text-green-900 dark:bg-green-950/40 dark:text-green-100">
        <h2 className="text-lg font-semibold">Message sent</h2>
        <p className="mt-2 text-sm">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div role="alert" className="rounded-md border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {serverError}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required {...register("name")} error={errors.name?.message} />
        <Field label="Email" type="email" required {...register("email")} error={errors.email?.message} />
      </div>
      <Field label="Subject" required {...register("subject")} error={errors.subject?.message} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Message<span className="text-red-600"> *</span>
        </span>
        <textarea
          rows={6}
          {...register("message")}
          className="w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-600 dark:border-white/20 dark:bg-zinc-900 dark:text-white"
        />
        {errors.message && (
          <span className="mt-1 block text-xs text-red-600">{errors.message.message}</span>
        )}
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
