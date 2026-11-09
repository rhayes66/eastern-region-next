import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { User } from "@/models/User";
import ResetPasswordAction from "@/components/ResetPasswordAction";

export const metadata = { title: "Members — GERAF Admin" };

type Row = {
  _id: { toString(): string };
  email?: string;
  firstname?: string;
  lastname?: string;
  role: string;
  finlandContact?: string;
  google?: string;
};

const roleBadge: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
  Member: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
};

async function MembersTable() {
  await connection();
  await requireAdmin(); // live DB role check, right next to the data
  await dbConnect();
  const users = (await User.find({})
    .select("email firstname lastname role finlandContact google")
    .sort({ createdAt: -1 })
    .lean()) as unknown as Row[];

  if (users.length === 0) {
    return <p className="mt-10 text-sm text-zinc-500">No members yet.</p>;
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Sign-in</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {users.map((u) => {
            const id = u._id.toString();
            const name =
              [u.firstname, u.lastname].filter(Boolean).join(" ") || "—";
            return (
              <tr key={id}>
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/admin/members/${id}`}
                    className="text-green-700 hover:underline dark:text-green-500"
                  >
                    {name}
                  </Link>
                </td>
                <td className="px-4 py-3">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      roleBadge[u.role] ?? ""
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {u.google ? "Google" : "Password"}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.email ? (
                    <ResetPasswordAction id={id} name={name} />
                  ) : (
                    <span className="text-xs text-zinc-400">no email</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminMembersPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Members
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        All accounts. Use “Reset password” to set a new password for a member
        who cannot sign in.
      </p>

      <Suspense
        fallback={<p className="mt-10 text-sm text-zinc-500">Loading members…</p>}
      >
        <MembersTable />
      </Suspense>
    </main>
  );
}
