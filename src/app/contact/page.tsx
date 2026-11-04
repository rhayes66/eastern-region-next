import { PageHeader } from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { CONTACT_DETAILS } from "@/lib/executives";

export const metadata = { title: "Contact us — GERAF" };

export default function ContactPage() {
  return (
    <main className="flex-1">
      <PageHeader title="Contact Us" subtitle="Eastern Biako Ye" image="/images/banners/contact.jpg" />
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            It would be great to hear from you. Drop us a line about anything we
            could help with — we look forward to hearing from you.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
        <aside className="rounded-xl border border-black/10 p-6 text-sm dark:border-white/15">
          <h2 className="font-semibold text-green-700 dark:text-green-500">
            {CONTACT_DETAILS.name}
          </h2>
          <dl className="mt-4 space-y-3 text-zinc-700 dark:text-zinc-300">
            <div>
              <dt className="text-xs uppercase text-zinc-500">Address</dt>
              <dd>
                {CONTACT_DETAILS.address.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-zinc-500">Phone</dt>
              <dd>
                <a href={`tel:${CONTACT_DETAILS.phone.replace(/\s/g, "")}`} className="hover:underline">
                  {CONTACT_DETAILS.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-zinc-500">Email</dt>
              <dd>
                <a href={`mailto:${CONTACT_DETAILS.email}`} className="break-all hover:underline">
                  {CONTACT_DETAILS.email}
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
