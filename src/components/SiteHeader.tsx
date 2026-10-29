import Link from "next/link";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/auth";

/** Auth-dependent nav (reads the session cookie → dynamic, streamed). */
async function HeaderActions() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-green-700 px-3 py-1.5 text-white hover:bg-green-800"
      >
        Log in
      </Link>
    );
  }

  return (
    <>
      {user.role === "Admin" && (
        <>
          <Link href="/admin/applications" className="hover:underline">
            Applications
          </Link>
          <Link href="/admin/members" className="hover:underline">
            Members
          </Link>
          <Link href="/admin/events" className="hover:underline">
            Manage events
          </Link>
        </>
      )}
      <Link href="/events" className="hover:underline">
        Events
      </Link>
      <Link href="/profile" className="hover:underline">
        Profile
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="rounded-md bg-black/5 px-3 py-1.5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
        >
          Sign out
        </button>
      </form>
    </>
  );
}

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white dark:border-white/15 dark:bg-black">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-green-700 dark:text-green-500">
          GERAF
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/apply" className="hover:underline">
            Apply
          </Link>
          <Suspense fallback={<span className="text-sm text-zinc-400">…</span>}>
            <HeaderActions />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
