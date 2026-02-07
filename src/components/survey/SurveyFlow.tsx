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

  async function handleFixedSubmit(answers: Record<string, unknown>) {
    setFixedAnswers(answers);
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
    } catch {
      // If adaptive questions fail, just submit without them
    }

    doSubmit(answers, null);
  }

  function handleAdaptiveSubmit(
    adaptiveAnswers: Record<string, unknown>[]
  ) {
    doSubmit(fixedAnswers!, adaptiveAnswers);
  }

  function doSubmit(
    fixed: Record<string, unknown>,
    adaptive: Record<string, unknown>[] | null
  ) {
    setStage("done");
    router.push("/thank-you");
    submitResponse(fixed, adaptive).catch(console.error);
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
          <FixedQuestionsForm onSubmit={handleFixedSubmit} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
