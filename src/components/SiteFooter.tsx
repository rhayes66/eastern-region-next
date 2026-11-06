import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { dbConnect } from "@/lib/db";
import { Event } from "@/models/Event";
import { CONTACT_DETAILS } from "@/lib/executives";
import { GALLERY_PHOTOS } from "@/lib/media";

type EventRow = { _id: { toString(): string }; title: string; startDate: Date };

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Helsinki",
  }).format(new Date(d));

const phoneHref = `tel:${CONTACT_DETAILS.phone.replace(/\s/g, "")}`;

/** Current year, read dynamically so it never pins the static prerender. */
async function CopyrightYear() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

// Social placeholders — the association's real profile URLs aren't wired yet.
const SOCIALS = ["Facebook", "Twitter", "LinkedIn"];

/** Live upcoming events for the footer (streamed; DB read is dynamic). */
async function UpcomingEvents() {
  await connection();
  await dbConnect();
  const now = new Date();
  const events = (await Event.find({ startDate: { $gte: now } })
    .sort({ startDate: 1 })
    .limit(4)
    .select("title startDate")
    .lean()) as unknown as EventRow[];

  if (events.length === 0) {
    return <p className="text-sm text-zinc-500">No upcoming events right now.</p>;
  }
  return (
    <ul className="space-y-4">
      {events.map((e) => (
        <li key={e._id.toString()} className="border-b border-black/10 pb-3 last:border-0 dark:border-white/10">
          <Link href="/events" className="block font-medium hover:text-green-700 dark:hover:text-green-400">
            {e.title}
          </Link>
          <span className="mt-1 block text-xs text-zinc-500">📅 {fmtDate(e.startDate)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SiteFooter() {
  const thumbs = GALLERY_PHOTOS.slice(0, 6);

  return (
    <footer className="mt-16">
      {/* Gold divider, like the live site */}
      <div className="h-10 bg-green-700" />

      <div className="bg-black/[0.03] dark:bg-white/[0.03]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold">About GERAF, Finland</h3>
            <div className="mt-3 h-0.5 w-10 bg-green-700" />
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              The Ghana Eastern Region Association (GERAF), resident in Finland,
              establishes a welfare fund which is not aligned with any political,
              religious or organizational establishment.
            </p>
            <div className="mt-5 flex gap-3">
              {SOCIALS.map((s) => (
                <span
                  key={s}
                  title={s}
                  aria-label={`${s} (coming soon)`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-xs text-zinc-500 dark:border-white/20"
                >
                  {s.charAt(0)}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div>
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <div className="mt-3 h-0.5 w-10 bg-green-700" />
            <div className="mt-4">
              <Suspense fallback={<p className="text-sm text-zinc-500">Loading events…</p>}>
                <UpcomingEvents />
              </Suspense>
            </div>
          </div>

          {/* Portfolio gallery */}
          <div>
            <h3 className="text-lg font-semibold">Portfolio Gallery</h3>
            <div className="mt-3 h-0.5 w-10 bg-green-700" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {thumbs.map((src) => (
                <Link
                  key={src}
                  href="/media/gallery"
                  className="relative aspect-square overflow-hidden rounded"
                >
                  <Image
                    src={src}
                    alt="GERAF event photo"
                    fill
                    sizes="80px"
                    className="object-cover transition hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Find us */}
          <div>
            <h3 className="text-lg font-semibold">Find Us</h3>
            <div className="mt-3 h-0.5 w-10 bg-green-700" />
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              You can also follow us through the social links above.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-green-700">📍</span>
                <span>{CONTACT_DETAILS.address.join(", ")}</span>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-green-700">📞</span>
                <a href={phoneHref} className="hover:underline">{CONTACT_DETAILS.phone}</a>
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="text-green-700">✉️</span>
                <a href={`mailto:${CONTACT_DETAILS.email}`} className="break-all hover:underline">
                  {CONTACT_DETAILS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-black/10 dark:border-white/10">
          <p className="mx-auto max-w-6xl px-6 py-4 text-center text-xs text-zinc-500">
            Copyright ©{" "}
            <Suspense fallback={null}>
              <CopyrightYear />
            </Suspense>{" "}
            GERAF — Ghana Eastern Region Association of Finland. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
