import Markdown from "react-markdown";
import { config } from "@/config";
import { EmptyState } from "@/components/ui/EmptyState";

interface InsightDisplayProps {
  cachedInsight?: string | null;
}

export function InsightDisplay({ cachedInsight }: InsightDisplayProps) {
  if (!cachedInsight) {
    return (
      <EmptyState
        heading={config.pages.insights.emptyHeading}
        body={config.pages.insights.emptyBody}
      />
    );
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground">
      <Markdown>{cachedInsight}</Markdown>
    </div>
  );
}
