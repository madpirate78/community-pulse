import { z } from "zod";

// ─── Fixed Questions (everyone answers these) ─────────────────

export const PRESSURE_OPTIONS = [
  "housing",
  "food",
  "energy",
  "transport",
  "childcare",
  "healthcare",
  "debt",
  "other",
] as const;

export type PressureOption = (typeof PRESSURE_OPTIONS)[number];

export const fixedQuestionsSchema = z.object({
  biggest_pressure: z.enum(PRESSURE_OPTIONS),
  change_direction: z.coerce.number().min(1).max(5),
  sacrifice: z
    .string()
    .min(2, "Please share at least a brief answer")
    .max(200, "Please keep this brief — under 200 characters"),
});

export type FixedAnswers = z.infer<typeof fixedQuestionsSchema>;

// ─── Adaptive Questions (AI-generated follow-ups) ─────────────

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
  top_pressure: string;
  top_pressure_pct: number;
  avg_change: number;
  sacrifice_themes: string[];
  emerging_gap: string | null;
  ai_themes: ExtractedTheme[] | null;
}

// ─── UI Labels ────────────────────────────────────────────────

export const PRESSURE_LABELS: Record<string, string> = {
  housing: "Housing costs",
  food: "Food & groceries",
  energy: "Energy bills",
  transport: "Getting around",
  childcare: "Childcare",
  healthcare: "Healthcare",
  debt: "Debt & borrowing",
  other: "Other",
};

export const CHANGE_LABELS: Record<number, string> = {
  1: "Much better",
  2: "A bit better",
  3: "Same",
  4: "Worse",
  5: "Much worse",
};
