"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { AdaptiveQuestions } from "@/lib/types";
import { FixedQuestionsForm } from "./FixedQuestionsForm";
import { ShimmerLoader } from "./ShimmerLoader";
import { AdaptiveForm } from "./AdaptiveForm";
import { submitResponse } from "@/app/submit/actions";

type Stage = "fixed" | "loading" | "adaptive" | "done";

const stageMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

export function SurveyFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("fixed");
  const [fixedAnswers, setFixedAnswers] = useState<Record<string, unknown> | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] =
    useState<AdaptiveQuestions | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  async function handleFixedSubmit(answers: Record<string, unknown>) {
    setFixedAnswers(answers);
    setBusyMessage(null);
    setStage("loading");

    try {
      const res = await fetch("/api/adaptive-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions?.length > 0) {
          setAdaptiveQuestions(data);
          setStage("adaptive");
          return;
        }
      }

      if (!res.ok) {
        setBusyMessage("The server is busy right now. Please try again in a moment.");
        setStage("fixed");
        return;
      }
    } catch {
      setBusyMessage("The server is busy right now. Please try again in a moment.");
      setStage("fixed");
      return;
    }

    doSubmit(answers, null);
  }

  function handleAdaptiveSubmit(
    adaptiveAnswers: Record<string, unknown>[]
  ) {
    doSubmit(fixedAnswers!, adaptiveAnswers);
  }

  async function doSubmit(
    fixed: Record<string, unknown>,
    adaptive: Record<string, unknown>[] | null
  ) {
    setStage("done");

    try {
      const result = await submitResponse(fixed, adaptive);

      if (result.success) {
        router.push("/thank-you");
        return;
      }

      if (result.error === "rate_limited" || result.error === "submissions_closed") {
        setBusyMessage(result.message);
        setStage("fixed");
        return;
      }
    } catch {
      // Network or unexpected error
    }

    setBusyMessage("Something went wrong. Please try again.");
    setStage("fixed");
  }

  return (
    <AnimatePresence mode="wait">
      {stage === "loading" && (
        <motion.div key="loader" {...stageMotion}>
          <ShimmerLoader />
        </motion.div>
      )}

      {stage === "adaptive" && adaptiveQuestions && (
        <motion.div key="adaptive" {...stageMotion}>
          <AdaptiveForm
            questions={adaptiveQuestions}
            onSubmit={handleAdaptiveSubmit}
          />
        </motion.div>
      )}

      {stage === "fixed" && (
        <motion.div key="fixed" {...stageMotion}>
          {busyMessage && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {busyMessage}
            </div>
          )}
          <FixedQuestionsForm onSubmit={handleFixedSubmit} defaultValues={fixedAnswers} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
