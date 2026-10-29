import { Suspense } from "react";
import { connection } from "next/server";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";

export const metadata = { title: "Events — GERAF" };

type EventRow = {
  _id: { toString(): string };
  title: string;
  eventType: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
};

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Helsinki",
    timeZoneName: "short",
  }).format(new Date(d));

function EventCard({ e }: { e: EventRow }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/15 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">{e.title}</h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-200">
          {e.eventType}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-500">
        {fmt(e.startDate)}
        {e.endDate ? ` – ${fmt(e.endDate)}` : ""}
        {e.location ? ` · ${e.location}` : ""}
      </p>
      {e.description && (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {e.description}
        </p>
      )}
    </div>
  );
}

async function EventsList() {
  await connection();
  await dbConnect();
  const now = new Date();
  const all = (await Event.find({}).sort({ startDate: 1 }).lean()) as unknown as EventRow[];
  const upcoming = all.filter((e) => new Date(e.startDate) >= now);
  const past = all
    .filter((e) => new Date(e.startDate) < now)
    .sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate));

  return (
    <>
      <section>
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">No upcoming events.</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {upcoming.map((e) => (
              <EventCard key={e._id.toString()} e={e} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Past events</h2>
          <div className="mt-3 grid gap-4 opacity-80 sm:grid-cols-2">
            {past.map((e) => (
              <EventCard key={e._id.toString()} e={e} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function EventsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Events
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Meetings, team events and community gatherings.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-zinc-500">Loading events…</p>}>
          <EventsList />
        </Suspense>
      </div>
    </main>
  );
}
