"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { submissions } from "@/db/schema";
import { config } from "@/config";
import { fixedQuestionsSchema, adaptiveResponseSchema } from "@/lib/types";
import { collectFreeText, moderateContent, retryModeration } from "@/lib/moderation";
import { maybeExtractThemes } from "@/lib/theme-extraction";
import { maybeGenerateInsight } from "@/lib/insight-generation";
import { submitLimiter } from "@/lib/rate-limit";
import { getSubmissionCount } from "@/lib/db-queries";

export async function submitResponse(
  fixedAnswers: unknown,
  adaptiveData?: Record<string, unknown>[] | null
) {
  // ── Rate limit: per-IP throttle ──────────────────────────────
  const hdrs = await headers();
  const forwarded = hdrs.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : hdrs.get("x-real-ip") ?? "127.0.0.1";

  const rateCheck = submitLimiter.check(ip);
  if (!rateCheck.allowed) {
    return {
      success: false as const,
      error: "rate_limited" as const,
      message: "You're submitting too quickly. Please wait a few minutes and try again.",
    };
  }

  // ── Global cap ───────────────────────────────────────────────
  if (config.operational.maxSubmissions != null) {
    const total = await getSubmissionCount();
    if (total >= config.operational.maxSubmissions) {
      return {
        success: false as const,
        error: "submissions_closed" as const,
        message: "This survey has reached its response limit. Thank you for your interest.",
      };
    }
  }

  // ── Validate fixed answers ───────────────────────────────────
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

  let contentSafe: boolean | null;
  try {
    const moderation = await moderateContent(freeTexts);
    contentSafe = moderation.safe;
  } catch {
    // Moderation API error — mark for background retry
    contentSafe = freeTexts.length === 0 ? true : null;
  }

  const [inserted] = await db
    .insert(submissions)
    .values({
      responses: parsed.data,
      adaptiveData: validatedAdaptive,
      consentGiven: true,
      contentSafe,
    })
    .returning({ id: submissions.id });

  if (contentSafe === null) {
    console.warn(`Moderation API error — submission ${inserted.id} stored with contentSafe=null, retrying in background`);
    retryModeration(inserted.id, freeTexts).catch(console.error);
  }

  maybeExtractThemes()
    .then(() => maybeGenerateInsight())
    .catch(console.error);

  return { success: true as const };
}
