"use client";

import { Suspense, useState } from "react";
import { InsightDisplay } from "./InsightDisplay";
import { DemoRegenButton } from "./DemoRegenButton";

interface InsightSectionProps {
  cachedInsight: string | null;
  submissionCount?: number;
  generationTimeMs?: number | null;
}

function InsightSectionInner({
  cachedInsight,
  submissionCount,
  generationTimeMs,
}: InsightSectionProps) {
  const [streamedText, setStreamedText] = useState<string | null>(null);

  const isStreaming = streamedText !== null;
  const displayText = isStreaming ? streamedText : cachedInsight;
  const showMeta = !isStreaming && submissionCount;

  return (
    <div>
      <div className="mb-2 flex justify-end empty:hidden">
        <Suspense>
          <DemoRegenButton onStream={setStreamedText} />
        </Suspense>
      </div>

      {isStreaming && !streamedText ? (
        <p className="py-8 text-center text-sm text-muted animate-pulse">
          Generating insight&hellip;
        </p>
      ) : (
        <InsightDisplay cachedInsight={displayText} />
      )}

      {showMeta && (
        <p className="mt-3 text-xs text-muted">
          Last generated from {submissionCount} responses
          {generationTimeMs
            ? ` in ${(generationTimeMs / 1000).toFixed(1)}s`
            : ""}
        </p>
      )}
    </div>
  );
}

export function InsightSection(props: InsightSectionProps) {
  return <InsightSectionInner {...props} />;
}
