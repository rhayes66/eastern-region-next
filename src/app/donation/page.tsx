import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Donations — GERAF" };

const peopleWeHelp = [
  "Schools in Ghana",
  "Women's organizations",
  "Children with disabilities",
  "Street children",
  "Hospitals",
];

export default function DonationPage() {
  return (
    <main className="flex-1">
      <PageHeader title="Donations" subtitle="Eastern Biako Ye" image="/images/banners/donation.jpg" />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
          Donation Saves Lives
        </h2>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          We have been working with communities for several years, and we know
          the best way to fight poverty and injustice is to help people help
          themselves. The money you raise helps change lives — you can pay in
          what you have raised using the association&rsquo;s bank account, or
          give during any of our events.
        </p>

        <h3 className="mt-10 text-lg font-semibold">People we help</h3>
        <ul className="mt-3 space-y-2">
          {peopleWeHelp.map((p) => (
            <li key={p} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
              <span aria-hidden="true" className="text-green-600">✓</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-xl border border-black/10 bg-black/[0.03] p-6 dark:border-white/15 dark:bg-white/[0.03]">
          <h3 className="font-semibold">Want to give?</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Get in touch and our financial secretary will share the
            association&rsquo;s bank details and answer any questions.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-full bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
          >
            Donate — contact us
          </Link>
        </div>
      </section>
    </main>
  );
}
