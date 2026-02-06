export default function InsightsLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-border" />
        <div className="h-4 w-72 rounded bg-border" />
        <div className="space-y-3">
          <div className="h-4 rounded bg-border" />
          <div className="h-4 w-5/6 rounded bg-border" />
          <div className="h-4 w-4/6 rounded bg-border" />
        </div>
      </div>
    </main>
  );
}
