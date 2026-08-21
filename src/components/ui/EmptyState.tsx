interface EmptyStateProps {
  heading: string;
  body: string;
}

export function EmptyState({ heading, body }: EmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-accent-soft p-8 text-center text-muted">
      <p className="text-lg font-medium">{heading}</p>
      <p className="mt-1 text-sm">{body}</p>
    </div>
  );
}
