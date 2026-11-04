import { PageHeader } from "@/components/PageHeader";
import { EXECUTIVES } from "@/lib/executives";

export const metadata = { title: "Executives — GERAF" };

export default function ExecutivesPage() {
  return (
    <main className="flex-1">
      <PageHeader title="GERAF Executives" subtitle="Eastern Biako Ye" image="/images/banners/executives.jpg" />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
          Our Executives
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EXECUTIVES.map((e) => {
            const initials = e.name
              .split(" ")
              .map((p) => p.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <li
                key={e.name}
                className="flex flex-col items-center rounded-xl border border-black/10 bg-white p-6 text-center dark:border-white/15 dark:bg-zinc-900"
              >
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-2xl font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-200"
                >
                  {initials}
                </div>
                <h3 className="mt-4 font-semibold">{e.name}</h3>
                <p className="text-sm text-zinc-500">{e.role}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-green-700 dark:text-green-500">
                  Founding Member
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
