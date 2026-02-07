interface InsightDisplayProps {
  cachedInsight?: string | null;
}

export function InsightDisplay({ cachedInsight }: InsightDisplayProps) {
  if (!cachedInsight) {
    return (
      <div className="rounded-xl border-2 border-dashed border-accent/30 p-8 text-center text-muted">
        <p className="text-lg font-medium">No community voice yet</p>
        <p className="mt-1 text-sm">
          Insights are generated automatically as responses come in.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-none space-y-3 leading-relaxed text-foreground">
      {cachedInsight.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}
