import Link from "next/link";
import HomeSlider from "@/components/HomeSlider";

const pillars = [
  {
    title: "Collaboration with sister NGOs",
    body: "We work with humanitarian NGOs in Ghana on street children, vocational training for women, school libraries, children with disabilities and community health centres.",
  },
  {
    title: "Donations to those in need",
    body: "We donate towards school development and orphanages in the Eastern Region of Ghana.",
  },
  {
    title: "Helping members in times of need",
    body: "The association supports its members through contributions and benefits when emergencies arise.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Slideshow */}
      <HomeSlider />

      {/* Hero */}
      <section className="bg-green-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-green-200">
            Eastern Biako Ye
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Ghanaian Eastern Region Association, Finland
          </h1>
          <p className="mt-4 max-w-xl text-lg text-green-50">
            A non-profit community based in Helsinki, supporting one another in
            Finland and development back home in Ghana — through contributions,
            benefits in times of need, and events that bring us together.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:justify-start">
            <Link
              href="/apply"
              className="rounded-full bg-white px-6 py-3 font-medium text-green-800 hover:bg-green-50"
            >
              Apply for membership
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/70 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              Member login
            </Link>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
          What We Do
        </h2>
        <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
          The Ghanaian Eastern Region Association of Finland (GERAF) is a
          non-governmental organisation engaged in human rights and humanitarian
          work in both Finland and Ghana. Our main sources of income are sales at
          Restaurant Day and the World Village Festival, alongside members&rsquo;
          contributions.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-500">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6">
          <Link href="/about" className="font-medium text-green-700 hover:underline dark:text-green-500">
            Read more about us →
          </Link>
        </p>
      </section>
    </main>
  );
}
