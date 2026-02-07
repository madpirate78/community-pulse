"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { pages } from "@/config/client";

interface InsightPreviewProps {
  insightText: string | null;
}

export function InsightPreview({ insightText }: InsightPreviewProps) {
  if (!insightText) return null;

  const preview =
    insightText.length > 300
      ? insightText.slice(0, 300).trimEnd() + "..."
      : insightText;

  return (
    <motion.section
      className="relative z-10 mx-auto max-w-2xl pb-16"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="mb-4 text-center font-display text-xl font-bold">
        {pages.insights.previewHeading}
      </h2>
      <blockquote className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 text-muted italic shadow-warm">
        <span className="absolute -left-1 -top-3 font-display text-6xl leading-none text-accent opacity-15">
          &ldquo;
        </span>
        <span className="relative block border-l-4 border-accent pl-4 font-display">
          {preview}
        </span>
      </blockquote>
      <div className="mt-3 text-center">
        <Link
          href="/insights"
          className="group text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          {pages.insights.previewLink}{" "}
          <span className="inline-block transition-transform group-hover:translate-x-1">
            &rarr;
          </span>
        </Link>
      </div>
    </motion.section>
  );
}
