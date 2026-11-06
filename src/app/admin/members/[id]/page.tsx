import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Dues } from "@/models/Dues";
import { Benefit } from "@/models/Benefit";
import MemberManage from "@/components/MemberManage";
import RemindButton from "@/components/RemindButton";
import BenefitActions from "@/components/BenefitActions";
import { ProfileDetails } from "@/components/ProfileDetails";
import { PROFILE_DETAIL_KEYS } from "@/lib/profile-fields";
import { sortDues } from "@/lib/dues-sort";
import { DuesGrid } from "@/components/DuesGrid";

export const metadata = { title: "Member — GERAF Admin" };

const eur = (n: number) =>
  new Intl.NumberFormat("en-FI", { style: "currency", currency: "EUR" }).format(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type DueRow = {
  _id: { toString(): string };
  month: string;
  year: string;
  amount: number;
  paid: boolean;
  duesType: string;
};

type MemberDoc = Record<string, string | undefined> & {
  _id: { toString(): string };
  role: string;
};

async function MemberDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  await dbConnect();

  const member = (await User.findById(id)
    .select(`${PROFILE_DETAIL_KEYS.join(" ")} role picture`)
    .lean()) as MemberDoc | null;
  if (!member) notFound();

  const [duesRaw, benefits] = await Promise.all([
    Dues.find({ member: id }).lean(),
    Benefit.find({ member: id }).sort({ requestedDate: -1 }).lean(),
  ]);
  const dueRows = sortDues(duesRaw as unknown as DueRow[]);
  const dues = dueRows;
  const unpaid = dueRows.filter((d) => !d.paid);

  const name = [member.firstname, member.lastname].filter(Boolean).join(" ") || "—";

  return (
    <>
      <Link href="/admin/members" className="text-sm text-green-700 hover:underline dark:text-green-500">
        ← Back to members
      </Link>
      <div className="mt-2 flex items-center gap-4">
        {member.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.picture}
            alt={`Profile photo of ${name}`}
            className="h-16 w-16 rounded-full border border-black/10 object-cover dark:border-white/15"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-200"
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
            {name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {member.email} · {member.role}
            {member.ghanacity ? ` · ${member.ghanacity}` : ""}
            {member.finlandContact ? ` · ${member.finlandContact}` : ""}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Personal details</h2>
        <ProfileDetails profile={member} />
      </section>

      <div className="mt-8">
        <MemberManage memberId={member._id.toString()} />
      </div>

      {/* History */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Contributions ({dues.length})</h2>
        {dues.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">None recorded.</p>
        ) : (
          <>
            <div className="mt-3">
              <DuesGrid dues={dueRows} />
            </div>
            {unpaid.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">
                  Unpaid ({unpaid.length})
                </h3>
                <ul className="mt-2 divide-y divide-black/5 rounded-xl border border-black/10 text-sm dark:divide-white/10 dark:border-white/15">
                  {unpaid.map((row) => (
                    <li
                      key={row._id.toString()}
                      className="flex justify-between px-4 py-2"
                    >
                      <span>
                        {cap(row.month)} {row.year} · {row.duesType}
                      </span>
                      <span className="flex items-center gap-3">
                        {eur(row.amount)}
                        <RemindButton duesId={row._id.toString()} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Benefits ({benefits.length})</h2>
        {benefits.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">None recorded.</p>
        ) : (
          <ul className="mt-3 divide-y divide-black/5 rounded-xl border border-black/10 text-sm dark:divide-white/10 dark:border-white/15">
            {benefits.map((b) => {
              const row = b as unknown as {
                _id: { toString(): string };
                category: string;
                amount: number;
                status: string;
              };
              return (
                <li key={row._id.toString()} className="flex justify-between px-4 py-2">
                  <span>{row.category}</span>
                  <span className="flex items-center gap-3">
                    {eur(row.amount)}
                    <span className="text-zinc-500">{row.status}</span>
                    <BenefitActions id={row._id.toString()} status={row.status} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

export default function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading member…</p>}>
        <MemberDetail params={params} />
      </Suspense>
    </main>
  );
}
