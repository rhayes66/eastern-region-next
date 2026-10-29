import Link from "next/link";

const features = [
  {
    title: "Membership",
    body: "Apply to join the association and become part of a supportive community in Finland.",
  },
  {
    title: "Monthly dues",
    body: "Track your contributions month by month, transparently recorded.",
  },
  {
    title: "Member benefits",
    body: "Receive support in times of need — bereavement, medical, hardship and more.",
  },
  {
    title: "Events",
    body: "Stay informed about meetings, team events and community gatherings.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-green-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:text-left">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Ghanaian Eastern Region Association, Finland
          </h1>
          <p className="mt-4 max-w-xl text-lg text-green-50">
            A community that supports its members — through contributions,
            benefits in times of need, and events that bring us together.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start justify-center">
            <Link
              href="/apply"
              className="rounded-full bg-white px-6 py-3 font-medium text-green-800 hover:bg-green-50"
            >
              Apply for membership
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/70 px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              Member login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-500">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
