/**
 * Banner used at the top of the static content pages: a background photo with a
 * dark translucent overlay and centered title, mimicking the legacy site's
 * `banner dark-translucent-bg`. Falls back to solid green if the image is
 * missing. Pass `description` for an optional lead paragraph under the title.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  image = "/images/page-banner.jpg",
}: {
  title: string;
  subtitle?: string;
  description?: string;
  /** Background image path under /public. Defaults to the shared banner. */
  image?: string;
}) {
  return (
    <section
      className="relative bg-green-800 bg-cover bg-center text-white"
      style={{
        backgroundImage: `url('${image}')`,
        backgroundPosition: "center",
      }}
    >
      {/* Dark translucent overlay for legible text over the photo */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/55" />
      <div className="relative mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-lg font-medium text-green-100">{subtitle}</p>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/90">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
