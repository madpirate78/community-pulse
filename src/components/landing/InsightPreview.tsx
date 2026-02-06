import Link from "next/link";

interface InsightPreviewProps {
  insightText: string | null;
}

export function InsightPreview({ insightText }: InsightPreviewProps) {
  if (!insightText) return null;

  // Show first ~300 chars
  const preview =
    insightText.length > 300
      ? insightText.slice(0, 300).trimEnd() + "..."
      : insightText;

  return (
    <section className="mx-auto max-w-2xl">
      <h2 className="mb-4 text-center text-xl font-bold">
        What the community is saying
      </h2>
      <blockquote className="rounded-xl bg-gray-50 p-6 text-gray-700 italic dark:bg-gray-900 dark:text-gray-300">
        &ldquo;{preview}&rdquo;
      </blockquote>
      <div className="mt-3 text-center">
        <Link
          href="/insights"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Read the full Community Voice &rarr;
        </Link>
      </div>
    </section>
  );
}
