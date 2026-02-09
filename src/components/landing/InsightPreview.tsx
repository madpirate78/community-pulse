"use client";

import Link from "next/link";
import Markdown from "react-markdown";
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
      <blockquote className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 text-muted italic shadow-soft">
        <span
          className="absolute left-3 top-2 bg-gradient-to-br from-[var(--gradient-start)] via-[var(--gradient-mid)] to-[var(--gradient-end)] bg-clip-text font-display text-6xl leading-none text-transparent opacity-30"
        >
          &ldquo;
        </span>
        <span className="relative block border-l-4 border-transparent pl-4 font-display" style={{ borderImage: "linear-gradient(to bottom, var(--gradient-start), var(--gradient-end)) 1" }}>
          <div className="prose prose-sm dark:prose-invert"><Markdown>{preview}</Markdown></div>
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
