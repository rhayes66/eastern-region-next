import { Suspense } from "react";
import { connection } from "next/server";
import { getSessionUser } from "@/lib/session";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Dues } from "@/models/Dues";
import { Benefit } from "@/models/Benefit";
import { sortDues } from "@/lib/dues-sort";
import { totalBenefitsReceived } from "@/lib/benefits";
import { PROFILE_DETAIL_KEYS } from "@/lib/profile-fields";
import { ProfileDetails } from "@/components/ProfileDetails";
import Link from "next/link";
import { DuesGrid } from "@/components/DuesGrid";

export const metadata = { title: "My profile — GERAF" };

type DuesRow = {
  _id: { toString(): string };
  amount: number;
  month: string;
  year: string;
  duesType: string;
  paid: boolean;
};
type ProfileDoc = Record<string, string | undefined>;


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

async function ProfileContent() {
  await connection(); // getSessionUser() hits the DB → request time only
  const user = await getSessionUser();
  if (!user?.id) {
    return <p className="text-sm text-zinc-500">Not signed in.</p>;
  }

  await dbConnect();
  const [profile, duesRaw, benefits] = await Promise.all([
    User.findById(user.id)
      .select(`${PROFILE_DETAIL_KEYS.join(" ")} picture`)
      .lean() as Promise<unknown> as Promise<ProfileDoc | null>,
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
  const totalBenefits = totalBenefitsReceived(benefits);

  return (
    <>
      <div className="flex items-center gap-4">
        {profile?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.picture}
            alt={`Profile photo of ${user.name ?? "member"}`}
            className="h-16 w-16 rounded-full border border-black/10 object-cover dark:border-white/15"
          />
        ) : null}
        <div>
          <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
            Welcome{user.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Role: <span className="font-medium">{user.role}</span>
          </p>
        </div>
        <Link
          href="/profile/edit"
          className="ml-auto rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Edit profile
        </Link>
      </div>

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

      {/* Personal details */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <ProfileDetails profile={profile} />
      </section>

      {/* Dues */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Dues details</h2>
        {dues.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No dues recorded yet.</p>
        ) : (
          <div className="mt-3">
            <DuesGrid dues={dues} />
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <Suspense
        fallback={<p className="text-sm text-zinc-500">Loading your profile…</p>}
      >
        <ProfileContent />
      </Suspense>
    </main>
  );
}
