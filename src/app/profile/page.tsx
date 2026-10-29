import { Suspense } from "react";
import { getSessionUser } from "@/lib/session";
import { dbConnect } from "@/lib/db";
import { Dues } from "@/models/Dues";
import { Benefit } from "@/models/Benefit";
import { sortDues } from "@/lib/dues-sort";

export const metadata = { title: "My profile — GERAF" };

type DuesRow = {
  _id: { toString(): string };
  amount: number;
  month: string;
  year: string;
  duesType: string;
  paid: boolean;
};
type BenefitRow = {
  _id: { toString(): string };
  category: string;
  amount: number;
  description?: string;
  status: string;
  requestedDate: Date;
};

const eur = (n: number) =>
  new Intl.NumberFormat("en-FI", { style: "currency", currency: "EUR" }).format(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function ProfileContent() {
  const user = await getSessionUser();
  if (!user?.id) {
    return <p className="text-sm text-zinc-500">Not signed in.</p>;
  }

  await dbConnect();
  const [duesRaw, benefits] = await Promise.all([
    Dues.find({ member: user.id }).lean() as Promise<unknown> as Promise<DuesRow[]>,
    Benefit.find({ member: user.id }).sort({ requestedDate: -1 }).lean() as Promise<
      unknown
    > as Promise<BenefitRow[]>,
  ]);
  const dues = sortDues(duesRaw);

  const totalPaid = dues.filter((d) => d.paid).reduce((s, d) => s + d.amount, 0);
  const totalOutstanding = dues
    .filter((d) => !d.paid)
    .reduce((s, d) => s + d.amount, 0);
  const totalBenefits = benefits
    .filter((b) => b.status === "Disbursed" || b.status === "Approved")
    .reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Welcome{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Role: <span className="font-medium">{user.role}</span>
      </p>

      {/* Summary cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Contributions paid" value={eur(totalPaid)} tone="green" />
        <SummaryCard
          label="Outstanding dues"
          value={eur(totalOutstanding)}
          tone={totalOutstanding > 0 ? "red" : "green"}
        />
        <SummaryCard label="Benefits received" value={eur(totalBenefits)} tone="neutral" />
      </div>

      {/* Dues */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">My contributions</h2>
        {dues.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No dues recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
                <tr>
                  <th className="px-4 py-2">Period</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {dues.map((d) => (
                  <tr key={d._id.toString()}>
                    <td className="px-4 py-2">
                      {cap(d.month)} {d.year}
                    </td>
                    <td className="px-4 py-2">{d.duesType}</td>
                    <td className="px-4 py-2">{eur(d.amount)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          d.paid
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                        }`}
                      >
                        {d.paid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">My benefits</h2>
        {benefits.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No benefits recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
                <tr>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {benefits.map((b) => (
                  <tr key={b._id.toString()}>
                    <td className="px-4 py-2">{b.category}</td>
                    <td className="px-4 py-2">{eur(b.amount)}</td>
                    <td className="px-4 py-2">{b.status}</td>
                    <td className="px-4 py-2 text-zinc-500">{b.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "neutral";
}) {
  const toneCls =
    tone === "green"
      ? "text-green-700 dark:text-green-400"
      : tone === "red"
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-800 dark:text-zinc-200";
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/15 dark:bg-zinc-900">
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading your profile…</p>}
      >
        <ProfileContent />
      </Suspense>
    </main>
  );
}
