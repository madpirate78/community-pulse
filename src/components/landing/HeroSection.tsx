import Link from "next/link";

export function HeroSection() {
  return (
    <section className="py-20 text-center">
      <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
        The cost of living is changing how we live.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 dark:text-gray-400">
        Share your experience anonymously. Our AI turns individual voices into
        a collective picture of what communities are really going through.
      </p>
      <Link
        href="/submit"
        className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Add Your Voice &mdash; 90 seconds, anonymous
      </Link>
    </section>
  );
}
