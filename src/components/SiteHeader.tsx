import Link from "next/link";
import { Suspense } from "react";
import { getSessionUser } from "@/lib/session";
import { signOut } from "@/auth";
import NavShell from "@/components/NavShell";

/** Auth-dependent nav (reads the session cookie → dynamic, streamed). */
async function HeaderActions() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-md bg-green-700 px-3 py-1.5 text-center text-white hover:bg-green-800"
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
          className="w-full rounded-md bg-black/5 px-3 py-1.5 text-left hover:bg-black/10 lg:w-auto lg:text-center dark:bg-white/10 dark:hover:bg-white/20"
        >
          Sign out
        </button>
      </form>
    </>
  );
}

export default function SiteHeader() {
  return (
    <NavShell
      actions={
        <Suspense fallback={<span className="text-sm text-zinc-400">…</span>}>
          <HeaderActions />
        </Suspense>
      }
    />
  );
}
