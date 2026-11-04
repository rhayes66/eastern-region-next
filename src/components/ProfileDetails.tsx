import { PROFILE_DETAIL_FIELDS } from "@/lib/profile-fields";

/** Read-only member detail grid (hides empty fields). */
export function ProfileDetails({
  profile,
}: {
  profile: Record<string, string | undefined> | null;
}) {
  const shown = PROFILE_DETAIL_FIELDS.filter(([k]) => profile?.[k]);
  if (shown.length === 0) {
    return <p className="mt-2 text-sm text-zinc-500">No details on file.</p>;
  }
  return (
    <dl className="mt-3 grid gap-x-6 gap-y-3 rounded-xl border border-black/10 p-4 text-sm sm:grid-cols-2 dark:border-white/15">
      {shown.map(([key, label]) => (
        <div key={key}>
          <dt className="text-xs uppercase text-zinc-500">{label}</dt>
          <dd className="mt-0.5">{profile?.[key]}</dd>
        </div>
      ))}
    </dl>
  );
}
