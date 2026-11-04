"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import { GENDERS, TITLES } from "@/lib/constants";
import { Field, SelectField } from "@/components/FormField";

export default function ProfileEditForm({
  defaults,
}: {
  defaults: ProfileInput;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
  });

  const onSubmit = async (data: ProfileInput) => {
    setServerError(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/profile");
      router.refresh();
      return;
    }
    const json = await res.json().catch(() => ({}));
    setServerError(json.error ?? "Could not save your profile.");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div
          role="alert"
          className="rounded-md border border-red-600/30 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField label="Title" {...register("title")}>
          <option value="">—</option>
          {TITLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </SelectField>
        <Field label="Full name" required {...register("firstname")} error={errors.firstname?.message} />
        <Field label="Last name" required {...register("lastname")} error={errors.lastname?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Gender" required {...register("gender")} error={errors.gender?.message}>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </SelectField>
        <Field label="Date of birth" type="date" {...register("dateOfBirth")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Finland contact number" required placeholder="+358…" {...register("finlandContact")} error={errors.finlandContact?.message} />
        <Field label="Occupation" {...register("occupation")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Location address (Finland)" required {...register("address")} error={errors.address?.message} />
        <Field label="City (Finland)" {...register("city")} />
        <Field label="Postal code" {...register("postalCode")} />
      </div>

      <Field label="Home town in Ghana" required {...register("ghanacity")} error={errors.ghanacity?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Spouse's name" {...register("spousename")} />
        <Field label="Number of children" type="number" min={0} {...register("children")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Father's full name" {...register("fathersname")} />
        <Field label="Mother's full name" {...register("mothersname")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Next of kin" {...register("nextkin")} />
        <Field label="Next of kin contact" {...register("nextkinContact")} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="rounded-full border border-black/15 px-6 py-3 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
