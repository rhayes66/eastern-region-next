import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "History — GERAF" };

const aims = [
  "To establish a standing fund through monthly contributions of all the association members who are interested in the aim.",
  "To help and support members who contribute to the fund in times of emergency and extreme need, as outlined in the basic rules.",
  "Promoting education and health, and helping school facilities in the Eastern Region of Ghana.",
  "To raise funds, by lawful means of accepting gifts, donations or otherwise, for the association.",
];

const objectives = [
  "Raise funds and receive contributions, where appropriate, to finance the work of the association.",
  "Open bank accounts.",
  "Make rules and standing orders for categories of members and their rights.",
  "Organize meetings and events, work with the Ghana Union and exchange information with them.",
  "Take any lawful action that would help it fulfil its aims.",
];

export default function HistoryPage() {
  return (
    <main className="flex-1">
      <PageHeader title="GERAF History" subtitle="Eastern Biako Ye" image="/images/banners/history.jpg" />
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-500">
          Our History
        </h2>
        <p className="mt-4 text-zinc-700 dark:text-zinc-300">
          The Eastern Region Association of Finland was established in September
          2015 by service-minded men and women of immigrant families living in
          Finland, who saw the need to help one another and to support those in
          need back home in Ghana and here in Finland. Members come mostly from
          the Eastern Region of Ghana. The association began with a small group,
          and through the dedication of its founding members it has grown as
          many more have joined.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-green-700 dark:text-green-500">
          Aims
        </h2>
        <ul className="mt-4 space-y-2">
          {aims.map((a) => (
            <li key={a} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
              <span aria-hidden="true" className="text-green-600">✓</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-green-700 dark:text-green-500">
          Objectives
        </h2>
        <ul className="mt-4 space-y-2">
          {objectives.map((o) => (
            <li key={o} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
              <span aria-hidden="true" className="text-green-600">✓</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
