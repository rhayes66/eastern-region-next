"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema, type ApplicationInput } from "@/lib/validation";
import { GENDERS, TITLES } from "@/lib/constants";
import { Field, SelectField } from "@/components/FormField";

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationInput) => {
    setServerError(null);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(true);
      return;
    }
    const json = await res.json().catch(() => ({}));
    setServerError(json.error ?? "Submission failed. Please try again.");
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-600/30 bg-green-50 p-6 text-green-900 dark:bg-green-950/40 dark:text-green-100">
        <h2 className="text-xl font-semibold">Application received</h2>
        <p className="mt-2 text-sm">
          Thank you. Your membership application has been submitted and is now
          pending review by an administrator. You will be notified of the
          outcome by email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-md border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Title" {...register("title")} error={errors.title?.message}>
          <option value="">—</option>
          {TITLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <Field
          label="Full name"
          required
          {...register("firstname")}
          error={errors.firstname?.message}
        />
        <Field
          label="Last name"
          required
          {...register("lastname")}
          error={errors.lastname?.message}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Gender"
          required
          defaultValue=""
          {...register("gender")}
          error={errors.gender?.message}
        >
          <option value="" disabled>
            Select…
          </option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </SelectField>
        <Field label="Date of birth" type="date" {...register("dateOfBirth")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Father's full name" {...register("fathersname")} />
        <Field label="Mother's full name" {...register("mothersname")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Spouse's name" {...register("spousename")} />
        <Field
          label="Number of children"
          type="number"
          min={0}
          {...register("children")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Location address (Finland)"
          required
          {...register("address")}
          error={errors.address?.message}
        />
        <Field label="City (Finland)" {...register("city")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Postal code" {...register("postalCode")} />
        <Field
          label="Home town in Ghana"
          required
          {...register("ghanacity")}
          error={errors.ghanacity?.message}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Finland contact number"
          required
          placeholder="+358…"
          {...register("finlandContact")}
          error={errors.finlandContact?.message}
        />
        <Field
          label="Email"
          type="email"
          required
          {...register("email")}
          error={errors.email?.message}
        />
      </div>

      <Field label="Occupation" {...register("occupation")} />

      {/* Login credentials — used to sign in once an admin accepts the application */}
      <fieldset className="rounded-lg border border-black/10 p-4 dark:border-white/15">
        <legend className="px-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Choose your login password
        </legend>
        <p className="mb-3 px-0.5 text-xs text-zinc-500">
          You will use your email and this password to sign in after your
          application is accepted. Minimum 6 characters with an uppercase
          letter, a number and a symbol.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Password"
            type="password"
            required
            {...register("password")}
            error={errors.password?.message}
          />
          <Field
            label="Confirm password"
            type="password"
            required
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {isSubmitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
