import type { Metadata } from "next";
import { config } from "@/config";
import { SurveyFlow } from "@/components/survey/SurveyFlow";

export const metadata: Metadata = { title: "Submit" };

export default function SubmitPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 animate-fade-in">
        <h1 className="font-display text-3xl font-bold">{config.pages.submit.heading}</h1>
        <p className="mt-2 text-muted">
          {config.pages.submit.subtext}
        </p>
      </div>
      <SurveyFlow />
    </main>
  );
}
