import { PageHeader } from "@/components/PageHeader";
import AboutTabs from "@/components/AboutTabs";

export const metadata = { title: "About us — GERAF" };

const whatWeDo = [
  "Collaboration with sister NGOs",
  "Donations to those in need",
  "Helping members in times of need",
];

export default function AboutPage() {
  return (
    <main className="flex-1">
      <PageHeader title="About GERAF" subtitle="Eastern Biako Ye" image="/images/banners/about.jpg" />
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-2">
        {/* Left: What We Do */}
        <div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
            What We Do
          </h2>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The Ghanaian Eastern Region Association of Finland (GERAF) is a
            non-profit organisation based in Helsinki, supporting development in
            Ghana. We donate towards school development and orphanages. Our main
            sources of income are sales at Restaurant Day and the World Village
            Festival, together with members&rsquo; contributions.
          </p>
          <ul className="mt-4 space-y-2">
            {whatWeDo.map((w) => (
              <li key={w} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
                <span aria-hidden="true" className="text-green-600">✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            GERAF is a non-governmental organisation engaged in human rights work
            in both Finland and Ghana. We play a role in promoting human rights,
            providing information and addressing problems, safeguarding and
            promoting the rights of different groups of people through our
            activities.
          </p>
        </div>

        {/* Right: We Love / What / We Do tabs */}
        <div>
          <AboutTabs />
        </div>
      </section>
    </main>
  );
}
