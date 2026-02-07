"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema";
import { fixedQuestionsSchema, adaptiveResponseSchema } from "@/lib/types";
import { collectFreeText, moderateContent, retryModeration } from "@/lib/moderation";
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

  const freeTexts = collectFreeText(parsed.data, validatedAdaptive);

  try {
    const moderation = await moderateContent(freeTexts);

    if (!moderation.safe) {
      console.warn("Submission rejected by moderation:", moderation.reason);
      return {
        success: false as const,
        error: { moderation: ["Your submission could not be processed. Please revise and try again."] },
      };
    }

    // Safe — insert with contentSafe: true
    await db.insert(submissions).values({
      responses: parsed.data,
      adaptiveData: validatedAdaptive,
      consentGiven: true,
      contentSafe: true,
    });
  } catch {
    // Moderation API error — store submission but gate free-text from AI
    const [inserted] = await db
      .insert(submissions)
      .values({
        responses: parsed.data,
        adaptiveData: validatedAdaptive,
        consentGiven: true,
        contentSafe: freeTexts.length === 0 ? true : null,
      })
      .returning({ id: submissions.id });

    if (freeTexts.length > 0) {
      console.warn(`Moderation API error — submission ${inserted.id} stored with contentSafe=null, retrying in background`);
      retryModeration(inserted.id, freeTexts).catch(console.error);
    }
  }

  maybeExtractThemes()
    .then(() => maybeGenerateInsight())
    .catch(console.error);

  return { success: true as const };
}
