"use client";

import { motion } from "framer-motion";

export function ShimmerLoader() {
  return (
    <motion.div
      className="space-y-4 py-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="inline-flex items-center gap-2 text-lg font-medium text-muted">
        <svg
          className="h-5 w-5 animate-spin text-accent"
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
        <div className="h-4 animate-pulse rounded bg-border" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-border" />
        <div className="h-10 animate-pulse rounded-lg bg-border" />
      </div>
    </motion.div>
  );
}
