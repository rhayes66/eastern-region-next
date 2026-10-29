import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Dues } from "@/models/Dues";
import { Benefit } from "@/models/Benefit";
import MemberManage from "@/components/MemberManage";
import { sortDues } from "@/lib/dues-sort";

export const metadata = { title: "Member — GERAF Admin" };

const eur = (n: number) =>
  new Intl.NumberFormat("en-FI", { style: "currency", currency: "EUR" }).format(n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type MemberDoc = {
  _id: { toString(): string };
  email?: string;
  firstname?: string;
  lastname?: string;
  role: string;
  finlandContact?: string;
  ghanacity?: string;
  gender?: string;
};

async function MemberDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  await dbConnect();

  const member = (await User.findById(id)
    .select("email firstname lastname role finlandContact ghanacity gender")
    .lean()) as MemberDoc | null;
  if (!member) notFound();

  const [duesRaw, benefits] = await Promise.all([
    Dues.find({ member: id }).lean(),
    Benefit.find({ member: id }).sort({ requestedDate: -1 }).lean(),
  ]);
  const dues = sortDues(
    duesRaw as unknown as { year: string; month: string }[]
  ) as typeof duesRaw;

  const name = [member.firstname, member.lastname].filter(Boolean).join(" ") || "—";

  return (
    <>
      <Link href="/admin/members" className="text-sm text-green-700 hover:underline dark:text-green-500">
        ← Back to members
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-green-700 dark:text-green-500">
        {name}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {member.email} · {member.role}
        {member.ghanacity ? ` · ${member.ghanacity}` : ""}
        {member.finlandContact ? ` · ${member.finlandContact}` : ""}
      </p>

      <div className="mt-8">
        <MemberManage memberId={member._id.toString()} />
      </div>

      {/* History */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Contributions ({dues.length})</h2>
        {dues.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">None recorded.</p>
        ) : (
          <ul className="mt-3 divide-y divide-black/5 rounded-xl border border-black/10 text-sm dark:divide-white/10 dark:border-white/15">
            {dues.map((d) => {
              const row = d as unknown as {
                _id: { toString(): string };
                month: string;
                year: string;
                amount: number;
                paid: boolean;
                duesType: string;
              };
              return (
                <li key={row._id.toString()} className="flex justify-between px-4 py-2">
                  <span>
                    {cap(row.month)} {row.year} · {row.duesType}
                  </span>
                  <span className="flex items-center gap-3">
                    {eur(row.amount)}
                    <span className={row.paid ? "text-green-600" : "text-red-600"}>
                      {row.paid ? "Paid" : "Unpaid"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading member…</p>}>
        <MemberDetail params={params} />
      </Suspense>
    </main>
  );
}
