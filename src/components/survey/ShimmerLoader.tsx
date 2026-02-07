"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Thinking about what to ask you next...",
  "Reading what you shared...",
  "Tailoring follow-up questions...",
];

export function ShimmerLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

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
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {messages[index]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mx-auto max-w-md space-y-3">
        {[1, 0.75, null].map((w, i) => (
          <div
            key={i}
            className={`relative overflow-hidden ${i === 2 ? "h-10 rounded-lg" : "h-4 rounded"} bg-border`}
            style={w ? { width: `${w * 100}%` } : undefined}
          >
            <div
              className="absolute inset-0 -translate-x-full animate-[shimmer-sweep_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[var(--gradient-start)] to-transparent opacity-10"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
