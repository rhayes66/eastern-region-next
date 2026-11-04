import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getSessionUser } from "@/lib/session";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import ProfileEditForm from "@/components/ProfileEditForm";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import { profileSchema, type ProfileInput } from "@/lib/validation";

export const metadata = { title: "Edit profile — GERAF" };

const FIELDS = Object.keys(profileSchema.shape) as (keyof ProfileInput)[];

async function EditContent() {
  await connection();
  const me = await getSessionUser();
  if (!me?.id) return <p className="text-sm text-zinc-500">Not signed in.</p>;

  await dbConnect();
  const doc = (await User.findById(me.id)
    .select(`${FIELDS.join(" ")} picture`)
    .lean()) as (Record<string, string | undefined> & { picture?: string }) | null;
  if (!doc) return <p className="text-sm text-zinc-500">Member not found.</p>;

  const defaults = Object.fromEntries(
    FIELDS.map((k) => [k, doc[k] ?? ""])
  ) as ProfileInput;
  const name = [doc.firstname, doc.lastname].filter(Boolean).join(" ") || "Member";

  return (
    <>
      <Link href="/profile" className="text-sm text-green-700 hover:underline dark:text-green-500">
        ← Back to profile
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-green-700 dark:text-green-500">
        Edit profile
      </h1>
      <div className="mt-6">
        <ProfileImageUpload picture={doc.picture || undefined} name={name} />
      </div>
      <div className="mt-8">
        <ProfileEditForm defaults={defaults} />
      </div>
    </>
  );
}

export default function EditProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <EditContent />
      </Suspense>
    </main>
  );
}
