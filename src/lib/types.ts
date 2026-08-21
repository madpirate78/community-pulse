import { z } from "zod";
import { config } from "@/config";
import type { ChoiceQuestion } from "@/config/schema";

// ─── Dynamic fixed-questions schema from config ─────────────

function buildFixedSchema() {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const q of config.questions.fixed) {
    switch (q.type) {
      case "choice": {
        const values = q.options.map((o) => o.value) as [string, ...string[]];
        shape[q.fieldName] = z.enum(values);
        break;
      }
      case "scale":
        shape[q.fieldName] = z.coerce.number().min(q.min).max(q.max);
        break;
      case "text":
        shape[q.fieldName] = z
          .string()
          .min(q.minLength, "Please share at least a brief answer")
          .max(q.maxLength, `Please keep this brief — under ${q.maxLength} characters`);
        break;
    }
  }

  return z.object(shape);
}

export const fixedQuestionsSchema = buildFixedSchema();
export type FixedAnswers = z.infer<typeof fixedQuestionsSchema>;

// ─── Config-derived helpers ─────────────────────────────────

// The first choice question drives the statistics dashboard and AI prompts.
const firstChoice = config.questions.fixed.find(
  (q): q is ChoiceQuestion => q.type === "choice"
);

/** Option values of the first choice question. */
export const PRESSURE_OPTIONS: readonly string[] =
  firstChoice?.options.map((o) => o.value) ?? [];

/** Value→label map of the first choice question. */
export const PRESSURE_LABELS: Record<string, string> = firstChoice
  ? Object.fromEntries(firstChoice.options.map((o) => [o.value, o.label]))
  : {};

// ─── Adaptive Questions (AI-generated follow-ups) ───────────

export const adaptiveQuestionSchema = z.object({
  questions: z
    .array(
      z.object({
        question_text: z.string(),
        input_type: z.enum(["single_choice", "scale", "short_text"]),
        options: z.array(z.string()).optional(),
        scale_min_label: z.string().optional(),
        scale_max_label: z.string().optional(),
        reasoning: z.string(),
      })
    )
    .min(1)
    .max(2),
});

export type AdaptiveQuestions = z.infer<typeof adaptiveQuestionSchema>;

// ─── Adaptive Responses (submitted answers to follow-ups) ────

export const adaptiveResponseSchema = z
  .array(
    z.object({
      question: z.string().max(500),
      input_type: z.enum(["single_choice", "scale", "short_text"]),
      answer: z.union([z.string().max(200), z.number(), z.null()]),
    })
  )
  .max(2);


// ─── AI-Extracted Themes ─────────────────────────────────────

export const extractedThemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  frequency: z.number(),
  representative_quotes: z.array(z.string()),
});

export const extractedThemesResponseSchema = z.object({
  themes: z.array(extractedThemeSchema).min(1).max(12),
});

export type ExtractedTheme = z.infer<typeof extractedThemeSchema>;

// ─── Dataset Summary (fed into AI prompts) ────────────────────

export interface DatasetSummary {
  total_responses: number;
  pressure_counts: Record<string, number>;
  top_pressure: string;
  top_pressure_pct: number;
  avg_change: number;
  sacrifice_themes: string[];
  emerging_gap: string | null;
  ai_themes: ExtractedTheme[] | null;
}
