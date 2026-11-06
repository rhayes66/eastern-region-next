"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Slide = { src: string; title: string; caption: string };

const SLIDES: Slide[] = [
  {
    src: "/images/slider/aburi-gardens.jpg",
    title: "Aburi Gardens",
    caption: "Celebrating the beauty of Ghana's Eastern Region",
  },
  {
    src: "/images/slider/akaa-falls.jpg",
    title: "Akaa Falls",
    caption: "Eastern Biako Ye — we are one",
  },
  {
    src: "/images/slider/boti-falls.jpg",
    title: "Boti Falls",
    caption: "A community that supports one another",
  },
  {
    src: "/images/slider/kwahu-mountains.jpg",
    title: "Kwahu Mountains",
    caption: "Rooted in our home, growing together in Finland",
  },
];

const INTERVAL = 5000;

/**
 * Auto-advancing hero slideshow for the home page, mimicking the legacy
 * slider-revolution banner. Pauses on hover/focus and respects reduced motion.
 */
export default function HomeSlider() {
  const [index, setIndex] = useState(0);
  // Hover and keyboard focus are tracked separately: autoplay resumes only
  // when BOTH are clear, so leaving one doesn't restart the show while the
  // other is still engaged.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduce) return;
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="GERAF highlights"
      className="relative h-[320px] w-full overflow-hidden bg-green-900 sm:h-[440px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
    >
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${SLIDES.length}: ${s.title}`}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={s.src}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-6 text-white">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-200">
              Eastern Biako Ye
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">
              {s.title}
            </h2>
            <p className="mt-2 max-w-xl text-lg text-white/90">{s.caption}</p>
          </div>
        </div>
      ))}

      {/* Prev / next */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
