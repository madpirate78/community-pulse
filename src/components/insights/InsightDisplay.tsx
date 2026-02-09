import Markdown from "react-markdown";
import { config } from "@/config";

interface InsightDisplayProps {
  cachedInsight?: string | null;
}

export function InsightDisplay({ cachedInsight }: InsightDisplayProps) {
  if (!cachedInsight) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent/30 p-8 text-center text-muted">
        <p className="text-lg font-medium">{config.pages.insights.emptyHeading}</p>
        <p className="mt-1 text-sm">
          {config.pages.insights.emptyBody}
        </p>
      </div>
    );
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground">
      <Markdown>{cachedInsight}</Markdown>
    </div>
  );
}
