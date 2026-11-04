import Image from "next/image";
import { PageHeader } from "@/components/PageHeader";
import { GALLERY_PHOTOS } from "@/lib/media";

export const metadata = { title: "Photo gallery — GERAF" };

export default function GalleryPage() {
  return (
    <main className="flex-1">
      <PageHeader title="Photo Gallery" subtitle="Eastern Biako Ye" image="/images/banners/media.jpg" />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {GALLERY_PHOTOS.map((src) => (
            <div
              key={src}
              className="relative aspect-square overflow-hidden rounded-lg border border-black/10 dark:border-white/15"
            >
              <Image
                src={src}
                alt="GERAF event photo"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
