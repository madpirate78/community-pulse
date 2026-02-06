"use client";

import { useState, useCallback } from "react";

interface StreamingInsightProps {
  cachedInsight?: string | null;
}

export function StreamingInsight({ cachedInsight }: StreamingInsightProps) {
  const [text, setText] = useState(cachedInsight ?? "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setText("");

    try {
      const res = await fetch("/api/generate-insight", { method: "POST" });

      if (!res.ok) {
        setError("Failed to generate insight");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setText(accumulated);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return (
    <div className="space-y-4">
      {text ? (
        <div className="prose prose-gray max-w-none dark:prose-invert">
          {text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {isStreaming && (
            <span className="inline-block h-4 w-1 animate-pulse bg-blue-500" />
          )}
        </div>
      ) : !isStreaming ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-700">
          <p className="text-lg font-medium">No insight generated yet</p>
          <p className="mt-1 text-sm">
            Generate an AI-powered community narrative from the data.
          </p>
        </div>
      ) : (
        <div className="space-y-3 py-8">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={generate}
        disabled={isStreaming}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {isStreaming
          ? "Generating..."
          : text
            ? "Regenerate Insight"
            : "Generate Community Voice"}
      </button>
    </div>
  );
}
