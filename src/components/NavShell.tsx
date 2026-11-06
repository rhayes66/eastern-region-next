"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONTACT_DETAILS } from "@/lib/executives";

type NavItem = { href: string; label: string; external?: boolean };
type Dropdown = { label: string; items: NavItem[] };

// Grouped menus, like the live site's "About" and "Media" dropdowns.
const ABOUT: Dropdown = {
  label: "About",
  items: [
    { href: "/about", label: "About GERAF" },
    { href: "/constitution", label: "Constitution" },
    { href: "/executives", label: "Executives" },
    { href: "/history", label: "GERAF History" },
    { href: "https://www.ghanaunionfinland.com/home", label: "GUF Website", external: true },
  ],
};
const MEDIA: Dropdown = {
  label: "Media",
  items: [
    { href: "/media/gallery", label: "Photo Gallery" },
    { href: "/media/videos", label: "Video Gallery" },
  ],
};

// Top-level links shown between the dropdowns (order matters on desktop).
const EVENTS: NavItem = { href: "/events", label: "Events" };
const TAIL_LINKS: NavItem[] = [
  { href: "/membership", label: "Membership" },
  { href: "/donation", label: "Donate" },
  { href: "/contact", label: "Contact" },
];

const phoneHref = `tel:${CONTACT_DETAILS.phone.replace(/\s/g, "")}`;

/**
 * Site header mimicking the live GERAF site: a gold utility bar with contact
 * details, a logo, and a main nav with "About" and "Media" dropdowns. Collapses
 * to a hamburger menu on small screens. Auth controls are rendered on the
 * server and passed in as `actions`.
 */
export default function NavShell({ actions }: { actions: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const pathname = usePathname();
  const close = () => {
    setOpen(false);
    setOpenGroup(null);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const linkCls = (href: string) =>
    `hover:text-green-700 dark:hover:text-green-400 ${
      isActive(href) ? "font-semibold text-green-700 dark:text-green-500" : ""
    }`;
  const groupActive = (d: Dropdown) =>
    d.items.some((l) => !l.external && isActive(l.href));

  const renderItem = (l: NavItem, cls: string) =>
    l.external ? (
      <a
        key={l.href}
        href={l.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={close}
      >
        {l.label}
        <span aria-hidden="true" className="ml-1 text-xs">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    ) : (
      <Link key={l.href} href={l.href} className={cls} onClick={close}>
        {l.label}
      </Link>
    );

  // Desktop hover/focus dropdown (plain render fn, not a component)
  const renderDesktopDropdown = (d: Dropdown) => (
    <div key={d.label} className="group relative">
      <button
        type="button"
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 ${
          groupActive(d)
            ? "font-semibold text-green-700 dark:text-green-500"
            : "hover:text-green-700 dark:hover:text-green-400"
        }`}
      >
        {d.label}
        <span aria-hidden="true" className="text-xs">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-10 min-w-56 rounded-md border border-black/10 bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:border-white/15 dark:bg-zinc-900">
        {d.items.map((l) =>
          renderItem(
            l,
            `block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 ${
              !l.external && isActive(l.href)
                ? "font-semibold text-green-700 dark:text-green-500"
                : ""
            }`
          )
        )}
      </div>
    </div>
  );

  // Mobile expandable group (plain render fn, not a component)
  const renderMobileGroup = (d: Dropdown) => {
    const expanded = openGroup === d.label;
    return (
      <div key={d.label}>
        <button
          type="button"
          onClick={() => setOpenGroup((g) => (g === d.label ? null : d.label))}
          aria-expanded={expanded}
          className={`inline-flex items-center gap-1 ${
            groupActive(d) ? "font-semibold text-green-700 dark:text-green-500" : ""
          }`}
        >
          {d.label}
          <span aria-hidden="true" className="text-xs">{expanded ? "▴" : "▾"}</span>
        </button>
        {expanded && (
          <div className="mt-2 flex flex-col gap-2 border-l border-black/10 pl-4 dark:border-white/15">
            {d.items.map((l) => renderItem(l, linkCls(l.href)))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white dark:bg-black">
      {/* Utility bar */}
      <div className="bg-green-700 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-6 py-1.5 text-xs">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span>{CONTACT_DETAILS.address.join(", ")}</span>
            <a href={phoneHref} className="hover:underline">
              {CONTACT_DETAILS.phone}
            </a>
            <a href={`mailto:${CONTACT_DETAILS.email}`} className="hover:underline">
              {CONTACT_DETAILS.email}
            </a>
          </div>
          <Link href="/apply" className="font-medium hover:underline" onClick={close}>
            Join Us
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <nav className="border-b border-black/10 dark:border-white/15">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-3" onClick={close}>
            <Image
              src="/geraf-logo.png"
              alt="GERAF logo"
              width={44}
              height={44}
              className="h-11 w-11"
              priority
            />
            <span className="leading-tight">
              <span className="block text-lg font-bold text-green-700 dark:text-green-500">
                GERAF
              </span>
              <span className="hidden text-[10px] uppercase tracking-wide text-zinc-500 sm:block">
                Ghana Eastern Region Ass. Finland
              </span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-5 text-sm lg:flex">
            <Link href="/" className={linkCls("/")}>
              Home
            </Link>
            {renderDesktopDropdown(ABOUT)}
            <Link href={EVENTS.href} className={linkCls(EVENTS.href)}>
              {EVENTS.label}
            </Link>
            {TAIL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls(l.href)}>
                {l.label}
              </Link>
            ))}
            {renderDesktopDropdown(MEDIA)}
            {actions}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-black/5 lg:hidden dark:hover:bg-white/10"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div
            id="mobile-nav"
            className="border-t border-black/10 px-6 py-4 lg:hidden dark:border-white/15"
          >
            <div className="flex flex-col gap-3 text-sm">
              <Link href="/" className={linkCls("/")} onClick={close}>
                Home
              </Link>
              {renderMobileGroup(ABOUT)}
              <Link href={EVENTS.href} className={linkCls(EVENTS.href)} onClick={close}>
                {EVENTS.label}
              </Link>
              {TAIL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className={linkCls(l.href)} onClick={close}>
                  {l.label}
                </Link>
              ))}
              {renderMobileGroup(MEDIA)}
              <div
                className="flex flex-col gap-3 border-t border-black/10 pt-3 dark:border-white/15"
                onClick={close}
              >
                {actions}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
