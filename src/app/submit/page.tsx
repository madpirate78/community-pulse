import { SurveyFlow } from "@/components/survey/SurveyFlow";

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add Your Voice</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Anonymous. 90 seconds. Your answers shape the community picture.
        </p>
      </div>
      <SurveyFlow />
    </main>
  );
}
