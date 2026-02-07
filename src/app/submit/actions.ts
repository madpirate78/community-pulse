"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { fixedQuestionsSchema, adaptiveResponseSchema } from "@/lib/types";
import { maybeExtractThemes } from "@/lib/theme-extraction";
import { maybeGenerateInsight } from "@/lib/insight-generation";

export async function submitResponse(
  fixedAnswers: unknown,
  adaptiveData?: Record<string, unknown>[] | null
) {
  const parsed = fixedQuestionsSchema.safeParse(fixedAnswers);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  let validatedAdaptive: Record<string, unknown>[] | null = null;
  if (adaptiveData != null) {
    const adaptiveParsed = adaptiveResponseSchema.safeParse(adaptiveData);
    if (!adaptiveParsed.success) {
      return { success: false as const, error: { adaptive: ["Invalid adaptive data"] } };
    }
    validatedAdaptive = adaptiveParsed.data;
  }

  await db.insert(submissions).values({
    responses: parsed.data,
    adaptiveData: validatedAdaptive,
    consentGiven: true,
  });

  maybeExtractThemes()
    .then(() => maybeGenerateInsight())
    .catch(console.error);

  return { success: true as const };
}
