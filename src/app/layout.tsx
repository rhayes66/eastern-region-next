import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GERAF — Ghanaian Eastern Region Association Finland",
  description:
    "Membership, contributions, benefits and events for the Ghanaian Eastern Region Association in Finland.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <header className="bg-white dark:bg-black">
              <div className="bg-green-700 py-1.5" />
              <div className="mx-auto max-w-6xl border-b border-black/10 px-6 py-3 text-lg font-bold text-green-700 dark:border-white/15 dark:text-green-500">
                GERAF
              </div>
            </header>
          }
        >
          <SiteHeader />
        </Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
