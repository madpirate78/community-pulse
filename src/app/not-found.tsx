import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not Found" };

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md animate-fade-in">
        <p className="font-mono text-5xl font-bold text-accent">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-soft-lg active:scale-[0.98]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
