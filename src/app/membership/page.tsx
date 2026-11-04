import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Membership — GERAF" };

const eligibility = [
  "Any Ghanaian or non-Ghanaian resident in Finland who is 18 years or older may become a member of the association.",
  "The board committee may refuse membership to an applicant where it considers that such membership would be detrimental to the aims, purposes or activities of the association.",
  "Membership is open to individuals irrespective of political party, nationality, religion or political opinion.",
];

export default function MembershipPage() {
  return (
    <main className="flex-1">
      <PageHeader title="GERAF Membership" subtitle="Eastern Biako Ye" image="/images/banners/membership.jpg" />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
          Eligible Members
        </h2>
        <ul className="mt-4 space-y-2">
          {eligibility.map((e) => (
            <li key={e} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
              <span aria-hidden="true" className="text-green-600">✓</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-green-700 dark:text-green-500">
          Registration Instructions
        </h2>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          Press the <strong>Apply</strong> button in the header to go to
          registration. Fill in the form and submit it. Your application will be
          evaluated by the executives, and our financial secretary will contact
          you to welcome you once you are accepted as a member.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-green-700 dark:text-green-500">
          Fees and Payment
        </h2>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          The registration fee is <strong>€50</strong>, paid once, with monthly
          dues of <strong>€10</strong>. Fees and dues can be paid during our
          monthly meetings, held on the last Saturday of every month. Members
          may also pay into the association&rsquo;s bank account and notify the
          financial secretary.
        </p>

        <div className="mt-10">
          <Link
            href="/apply"
            className="inline-block rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
          >
            Apply for membership
          </Link>
        </div>
      </section>
    </main>
  );
}
