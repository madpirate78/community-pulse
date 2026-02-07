import Link from "next/link";
import { config } from "@/config";

export default function ThankYouPage() {
  const { heading, body, ctaInsights, ctaStats } = config.pages.thankYou;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle">
          <div className="h-4 w-4 animate-glow-pulse rounded-full bg-accent" />
        </div>
        <h1 className="font-display text-3xl font-bold">{heading}</h1>
        <p className="mt-4 text-muted">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/insights"
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-warm-lg active:scale-[0.98]"
          >
            {ctaInsights}
          </Link>
          <Link
            href="/statistics"
            className="rounded-xl border-2 border-border px-6 py-3 font-semibold transition-colors hover:border-border-strong hover:bg-surface"
          >
            {ctaStats}
          </Link>
        </div>
      </div>
    </main>
  );
}
