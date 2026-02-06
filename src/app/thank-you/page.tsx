import Link from "next/link";

export default function ThankYouPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-5xl">&#x2728;</div>
        <h1 className="text-3xl font-bold">Your voice has been added</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Thank you for sharing. Every response helps build a clearer picture of
          what our community is going through.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/insights"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            See What We&apos;re All Saying
          </Link>
          <Link
            href="/statistics"
            className="rounded-xl border-2 border-gray-200 px-6 py-3 font-semibold transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            View Statistics
          </Link>
        </div>
      </div>
    </main>
  );
}
