"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="font-display text-xl font-semibold">Something went wrong</h2>
      <button
        onClick={reset}
        className="rounded-lg bg-accent px-4 py-2 text-white transition-all hover:bg-accent-hover hover:shadow-warm active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}
