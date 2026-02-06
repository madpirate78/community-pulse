"use client";

import { useState, useCallback, useRef } from "react";

interface StreamingInsightProps {
  cachedInsight?: string | null;
}

const CLIENT_RETRY_DELAY = 10_000;
const MAX_CLIENT_RETRIES = 2;

export function StreamingInsight({ cachedInsight }: StreamingInsightProps) {
  const [text, setText] = useState(cachedInsight ?? "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    setIsStreaming(true);
    setError(null);
    setStatus("Connecting to AI...");
    setText("");

    try {
    for (let attempt = 0; attempt <= MAX_CLIENT_RETRIES; attempt++) {
      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/generate-insight", {
          method: "POST",
          signal: abortRef.current.signal,
        });

        if (res.status === 503) {
          if (attempt < MAX_CLIENT_RETRIES) {
            const waitSec = CLIENT_RETRY_DELAY / 1000;
            for (let s = waitSec; s > 0; s--) {
              setStatus(`Model is busy — retrying in ${s}s...`);
              await new Promise((r) => setTimeout(r, 1000));
            }
            setStatus("Retrying...");
            continue;
          }
          setError(
            "The AI model is currently overloaded. Please wait a minute and try again."
          );
          return;
        }

        if (!res.ok) {
          setError("Failed to generate insight. Please try again.");
          return;
        }

        setStatus("Generating narrative...");

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setText(accumulated);
          setStatus(null);
        }

        return; // Success — exit retry loop
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (attempt >= MAX_CLIENT_RETRIES) {
          setError("Something went wrong. Please try again.");
          return;
        }
      }
    }
    } finally {
      setIsStreaming(false);
      setStatus(null);
    }
  }, []);

  function handleCancel() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStatus(null);
  }

  return (
    <div className="space-y-4">
      {text ? (
        <div className="max-w-none space-y-3 leading-relaxed text-foreground">
          {text.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {isStreaming && (
            <span className="inline-block h-4 w-1 animate-cursor-pulse bg-accent" />
          )}
        </div>
      ) : !isStreaming ? (
        <div className="rounded-xl border-2 border-dashed border-accent/30 p-8 text-center text-muted">
          <p className="text-lg font-medium">No insight generated yet</p>
          <p className="mt-1 text-sm">
            Generate an AI-powered community narrative from the data.
          </p>
        </div>
      ) : (
        <div className="space-y-3 py-8">
          <div className="h-4 animate-pulse rounded bg-border" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-border" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-border" />
        </div>
      )}

      {status && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <svg className="h-4 w-4 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {status}
        </p>
      )}

      {error && (
        <p className="text-sm text-amber-600">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={generate}
          disabled={isStreaming}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-hover hover:shadow-warm-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isStreaming
            ? "Generating..."
            : text
              ? "Regenerate Insight"
              : "Generate Community Voice"}
        </button>
        {isStreaming && (
          <button
            onClick={handleCancel}
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
