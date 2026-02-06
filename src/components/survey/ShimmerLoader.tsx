"use client";

export function ShimmerLoader() {
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="inline-flex items-center gap-2 text-lg font-medium text-gray-600 dark:text-gray-400">
        <svg
          className="h-5 w-5 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Thinking about what to ask you next...
      </div>
      <div className="mx-auto max-w-md space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
