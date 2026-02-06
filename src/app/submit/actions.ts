"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { fixedQuestionsSchema } from "@/lib/types";

export async function submitResponse(
  fixedAnswers: unknown,
  adaptiveData?: Record<string, unknown>[] | null
) {
  const parsed = fixedQuestionsSchema.safeParse(fixedAnswers);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().fieldErrors };
  }

  await db.insert(submissions).values({
    responses: parsed.data,
    adaptiveData: adaptiveData ?? null,
    consentGiven: true,
  });

  return { success: true as const };
}
