import { PageHeader } from "@/components/PageHeader";
import { GALLERY_VIDEOS } from "@/lib/media";

export const metadata = { title: "Video gallery — GERAF" };

export default function VideosPage() {
  return (
    <main className="flex-1">
      <PageHeader title="Video Gallery" subtitle="Eastern Biako Ye" image="/images/banners/media.jpg" />
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-6 sm:grid-cols-2">
          {GALLERY_VIDEOS.map((v) => (
            <figure key={v.id} className="overflow-hidden rounded-xl border border-black/10 dark:border-white/15">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                  title={v.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <figcaption className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                {v.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}
