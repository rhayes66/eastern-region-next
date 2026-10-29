import { Suspense } from "react";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "My profile — GERAF" };

async function ProfileContent() {
  const user = await getSessionUser();
  return (
    <>
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Role: <span className="font-medium">{user?.role ?? "—"}</span>
      </p>
      <p className="mt-6 rounded-lg border border-black/10 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-400">
        Your contributions, received benefits and upcoming events will appear
        here. (Coming in Phase 3.)
      </p>
    </>
  );
}

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading your profile…</p>}
      >
        <ProfileContent />
      </Suspense>
    </main>
  );
}
