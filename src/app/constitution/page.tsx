import { PageHeader } from "@/components/PageHeader";
import { CONSTITUTION } from "@/lib/constitution";

export const metadata = { title: "Constitution — GERAF" };

export default function ConstitutionPage() {
  return (
    <main className="flex-1">
      <PageHeader title="GERAF Constitution" subtitle="Eastern Biako Ye" image="/images/banners/constitution.jpg" />
      <section className="mx-auto max-w-3xl px-6 py-12">
        {/* Table of contents */}
        <nav aria-label="Constitution sections" className="rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Contents
          </h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            {CONSTITUTION.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-green-700 hover:underline dark:text-green-500">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {CONSTITUTION.map((s, i) => (
          <section key={s.id} id={s.id} className="mt-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
              {i + 1}. {s.title}
            </h2>
            {s.intro && (
              <p className="mt-3 text-zinc-700 dark:text-zinc-300">{s.intro}</p>
            )}
            {s.items && (
              <ul className="mt-3 space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
                    <span aria-hidden="true" className="text-green-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.paragraphs?.map((p) => {
              const isHeading = /^\d+\.\s/.test(p); // "1. Title" — top-level clause
              const isSubClause = /^\d+\.\d+\./.test(p); // "1.1." — sub-clause
              const isIllustration = p.startsWith("Illustration:");
              if (isHeading) {
                return (
                  <h3 key={p} className="mt-5 font-semibold text-zinc-900 dark:text-zinc-100">
                    {p}
                  </h3>
                );
              }
              return (
                <p
                  key={p}
                  className={`mt-2 ${isSubClause ? "pl-5" : ""} ${
                    isIllustration
                      ? "rounded-md bg-black/[0.04] p-3 text-sm italic text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {p}
                </p>
              );
            })}
          </section>
        ))}

        <p className="mt-10 text-sm text-zinc-500">
          This constitution was adopted by the members present at the AGM (refer
          to the signed hard copy for the date).
        </p>
      </section>
    </main>
  );
}
