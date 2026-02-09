import { z } from "zod";
import { config } from "@/config";
import type { ChoiceQuestion, ScaleQuestion } from "@/config/schema";

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
          .min(q.minLength, `Please share at least a brief answer`)
          .max(q.maxLength, `Please keep this brief — under ${q.maxLength} characters`);
        break;
    }
  }

  return z.object(shape);
}

export const fixedQuestionsSchema = buildFixedSchema();
export type FixedAnswers = z.infer<typeof fixedQuestionsSchema>;

// ─── Config-derived helpers (backward-compat) ───────────────

function findQuestion<T extends "choice" | "scale" | "text">(type: T) {
  return config.questions.fixed.filter((q) => q.type === type);
}

const choiceQuestions = findQuestion("choice") as ChoiceQuestion[];
const scaleQuestions = findQuestion("scale") as ScaleQuestion[];

// First choice question's option values (was PRESSURE_OPTIONS)
const firstChoice = choiceQuestions[0];
export const PRESSURE_OPTIONS = firstChoice
  ? (firstChoice.options.map((o) => o.value) as readonly string[])
  : ([] as readonly string[]);

export type PressureOption = string;

// First choice question's value→label map (was PRESSURE_LABELS)
export const PRESSURE_LABELS: Record<string, string> = firstChoice
  ? Object.fromEntries(firstChoice.options.map((o) => [o.value, o.label]))
  : {};

// First scale question's number→label map (was CHANGE_LABELS)
const firstScale = scaleQuestions[0];
export const CHANGE_LABELS: Record<number, string> = firstScale
  ? Object.fromEntries(
      Object.entries(firstScale.labels).map(([k, v]) => [Number(k), v])
    )
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

export type AdaptiveResponse = z.infer<typeof adaptiveResponseSchema>;

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
export type ExtractedThemesResponse = z.infer<typeof extractedThemesResponseSchema>;

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
