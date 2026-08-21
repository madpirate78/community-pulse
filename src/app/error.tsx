"use client";

import { useEffect } from "react";
import { pages } from "@/config/client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold">
          {pages.error.heading}
        </h1>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-hover hover:shadow-soft-lg active:scale-[0.98]"
        >
          {pages.error.retryLabel}
        </button>
      </div>
    </main>
  );
}
