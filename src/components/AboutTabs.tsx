"use client";

import { useState } from "react";
import Image from "next/image";

type TabKey = "love" | "what" | "do";

const TABS: { key: TabKey; label: string; icon?: string }[] = [
  { key: "love", label: "We Love", icon: "♥" },
  { key: "what", label: "What" },
  { key: "do", label: "We Do" },
];

/**
 * Tabbed panel on the About page, mimicking the legacy "We Love / What / We Do"
 * tabs: an image, a video, and the Fund Raising and Partners text.
 */
export default function AboutTabs() {
  const [active, setActive] = useState<TabKey>("love");

  return (
    <div>
      {/* Tab list */}
      <div role="tablist" aria-label="About GERAF" className="flex gap-1 border-b border-black/10 dark:border-white/15">
        {TABS.map((t) => {
          const selected = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              id={`tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`panel-${t.key}`}
              onClick={() => setActive(t.key)}
              className={`-mb-px rounded-t-md px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-green-700 text-white"
                  : "text-zinc-600 hover:text-green-700 dark:text-zinc-300 dark:hover:text-green-400"
              }`}
            >
              {t.icon && <span aria-hidden="true" className="mr-1">{t.icon}</span>}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="mt-4">
        {active === "love" && (
          <div role="tabpanel" id="panel-love" aria-labelledby="tab-love">
            <figure className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/15">
              <Image
                src="/images/about-restaurant.jpg"
                alt="GERAF members working at the Restaurant Day events"
                width={1600}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full object-cover"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-2 text-sm text-white">
                Working at the Restaurant Day events
              </figcaption>
            </figure>
          </div>
        )}

        {active === "what" && (
          <div role="tabpanel" id="panel-what" aria-labelledby="tab-what">
            <div className="aspect-video overflow-hidden rounded-xl border border-black/10 dark:border-white/15">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/PS7AGeyT85E"
                title="GERAF at Restaurant Day"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {active === "do" && (
          <div
            role="tabpanel"
            id="panel-do"
            aria-labelledby="tab-do"
            className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300"
          >
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-500">
              Fund Raising and Partners
            </h3>
            <p>
              Restaurant Day and the World Village Festival in Helsinki have been
              our main means of raising funds for our humanitarian work. Members
              of the association come together voluntarily at each event to sell
              special traditional food from the Eastern Region of Ghana.
            </p>
            <p>
              GERAF collaborates with sister humanitarian NGOs in Ghana to support
              local causes such as street children, vocational training for women,
              building school libraries, children with disabilities and community
              health centres.
            </p>
            <p>
              We are always looking for more ideas and experienced partners in the
              field of humanitarian aid. You can contribute voluntarily during any
              of our events, or join us as a member.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
