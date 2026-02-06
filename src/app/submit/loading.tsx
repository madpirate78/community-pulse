export default function SubmitLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="animate-pulse space-y-8">
        <div>
          <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-20 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </main>
  );
}
