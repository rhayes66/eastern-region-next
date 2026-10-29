import { Suspense } from "react";
import { connection } from "next/server";
import { dbConnect } from "@/lib/db";
import { MemberApplication } from "@/models/MemberApplication";
import ApplicationActions from "@/components/ApplicationActions";

export const metadata = { title: "Applications — GERAF Admin" };

type Row = {
  _id: { toString(): string };
  status: string;
  createdAt: Date;
  yourDetails: {
    firstname?: string;
    lastname?: string;
    gender?: string;
    ghanacity?: string;
    finlandContact?: string;
    email?: string;
  };
};

const statusBadge: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  Accepted: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

/** Dynamic part: queried per-request and streamed in via Suspense (PPR). */
async function ApplicationsTable() {
  await connection(); // defer to request time; never query the DB at build
  await dbConnect();
  const applications = (await MemberApplication.find({})
    .sort({ createdAt: -1 })
    .lean()) as unknown as Row[];

  if (applications.length === 0) {
    return <p className="mt-10 text-sm text-zinc-500">No applications yet.</p>;
  }

  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
          <tr>
            <th className="px-4 py-3">Applicant</th>
            <th className="px-4 py-3">Ghana town</th>
            <th className="px-4 py-3">Finland contact</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {applications.map((a) => {
            const d = a.yourDetails;
            const id = a._id.toString();
            return (
              <tr key={id}>
                <td className="px-4 py-3">
                  <div className="font-medium">
                    {[d.firstname, d.lastname].filter(Boolean).join(" ")}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {d.gender}
                    {d.email ? ` · ${d.email}` : ""}
                  </div>
                </td>
                <td className="px-4 py-3">{d.ghanacity ?? "—"}</td>
                <td className="px-4 py-3">{d.finlandContact ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      statusBadge[a.status] ?? ""
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {a.status === "Pending" ? (
                    <ApplicationActions id={id} />
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
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

export default function AdminApplicationsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Membership applications
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Review and accept or reject applications. Accepting creates a member
        account.
      </p>

      <Suspense
        fallback={<p className="mt-10 text-sm text-zinc-500">Loading applications…</p>}
      >
        <ApplicationsTable />
      </Suspense>
    </main>
  );
}
