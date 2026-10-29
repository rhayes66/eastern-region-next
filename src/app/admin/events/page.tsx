import { Suspense } from "react";
import { connection } from "next/server";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import EventForm from "@/components/EventForm";
import DeleteEventButton from "@/components/DeleteEventButton";

export const metadata = { title: "Events — GERAF Admin" };

type EventRow = {
  _id: { toString(): string };
  title: string;
  eventType: string;
  location?: string;
  startDate: Date;
};

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Helsinki",
    timeZoneName: "short",
  }).format(new Date(d));

async function EventsAdminList() {
  await connection();
  await dbConnect();
  const events = (await Event.find({})
    .sort({ startDate: -1 })
    .lean()) as unknown as EventRow[];

  if (events.length === 0) {
    return <p className="mt-6 text-sm text-zinc-500">No events yet.</p>;
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
      <table className="w-full text-left text-sm">
        <thead className="bg-black/5 text-xs uppercase text-zinc-500 dark:bg-white/10">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Where</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/10">
          {events.map((e) => (
            <tr key={e._id.toString()}>
              <td className="px-4 py-3 font-medium">{e.title}</td>
              <td className="px-4 py-3">{e.eventType}</td>
              <td className="px-4 py-3">{fmt(e.startDate)}</td>
              <td className="px-4 py-3">{e.location ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <DeleteEventButton id={e._id.toString()} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-bold text-green-700 dark:text-green-500">
        Manage events
      </h1>
      <div className="mt-6">
        <EventForm />
      </div>
      <Suspense fallback={<p className="mt-6 text-sm text-zinc-500">Loading events…</p>}>
        <EventsAdminList />
      </Suspense>
    </main>
  );
}
