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

  const displayText = streamedText !== null ? streamedText : cachedInsight;
  const showMeta = streamedText === null && submissionCount;

  return (
    <div className="relative">
      <div className="absolute right-0 top-0">
        <Suspense>
          <DemoRegenButton onStream={setStreamedText} />
        </Suspense>
      </div>

      <InsightDisplay cachedInsight={displayText} />

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
